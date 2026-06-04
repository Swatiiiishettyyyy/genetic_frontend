import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../../../shared/auth/AuthContext'
import { authService } from '../../../../shared/auth/authService'
import { isGeneticAuthContext } from '../../utils/authMode'
import { ga4CustomUserParams, trackGa4CustomEvent } from '../../utils/ga4CustomEvents'

const OTP_LENGTH = 4
const RESEND_TIMEOUT = 30

const OTPModal: React.FC = () => {
  const { isOTPModalOpen, mobileNumber, closeOTPModal, openLoginModal, handleVerifySuccess, isLoggedIn, user, currentMember } = useAuth()
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const autocompleteInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const lock = isOTPModalOpen
    document.body.style.overflow = lock ? 'hidden' : ''
    document.documentElement.style.overflow = lock ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOTPModalOpen])

  useEffect(() => {
    if (isOTPModalOpen) {
      setOtp(Array(OTP_LENGTH).fill(''))
      setError(null)
      setResendTimer(RESEND_TIMEOUT)
      setTimeout(() => autocompleteInputRef.current?.focus(), 100)
    }
  }, [isOTPModalOpen])

  useEffect(() => {
    if (!isOTPModalOpen) return
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer, isOTPModalOpen])

  const verify = useCallback(async (code: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = isGeneticAuthContext()
        ? {
            success: true,
            csrf_token: 'genetic_mock_csrf',
            is_new_user: false,
            user: {
              id: `genetic-${mobileNumber}`,
              name: 'Genetic Test User',
              mobile: mobileNumber,
            },
          }
        : await authService.verifyOTP(mobileNumber, code)
      trackGa4CustomEvent('mobile_num_otp_verified', {
        linkText: 'Continue',
        ...ga4CustomUserParams({ isLoggedIn, user, currentMember }),
      })
      await handleVerifySuccess(response, mobileNumber)
    } catch (err: any) {
      trackGa4CustomEvent('mobile_num_otp_invalid', {
        linkText: err?.message || 'Invalid OTP',
        ...ga4CustomUserParams({ isLoggedIn, user, currentMember }),
      })
      setError(err?.message || 'Invalid OTP. Please try again.')
      setOtp(Array(OTP_LENGTH).fill(''))
      setTimeout(() => autocompleteInputRef.current?.focus(), 50)
    } finally {
      setIsLoading(false)
    }
  }, [currentMember, handleVerifySuccess, isLoggedIn, mobileNumber, user])

  const applyOtpCode = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH)
    const newOtp = Array(OTP_LENGTH).fill('')
    digits.split('').forEach((digit, index) => { newOtp[index] = digit })
    setOtp(newOtp)
    if (error) setError(null)

    const nextEmpty = newOtp.findIndex(digit => digit === '')
    if (nextEmpty === -1) {
      verify(newOtp.join(''))
    } else {
      inputRefs.current[nextEmpty]?.focus()
    }
  }, [error, verify])

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (error) setError(null)
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
    if (digit && newOtp.every(d => d !== '')) verify(newOtp.join(''))
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const newOtp = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((d, i) => { newOtp[i] = d })
    setOtp(newOtp)
    const nextEmpty = newOtp.findIndex(d => d === '')
    inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus()
    if (newOtp.every(d => d !== '')) verify(newOtp.join(''))
  }

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return
    setIsResending(true)
    setError(null)
    try {
      if (!isGeneticAuthContext()) {
        await authService.sendOTP(mobileNumber)
      }
      setOtp(Array(OTP_LENGTH).fill(''))
      setResendTimer(RESEND_TIMEOUT)
      setTimeout(() => autocompleteInputRef.current?.focus(), 50)
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP.')
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < OTP_LENGTH) { setError('Please enter the complete OTP'); return }
    verify(code)
  }

  if (!isOTPModalOpen) return null

  const isDisabled = isLoading || otp.some(d => d === '')

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', padding: '70px 16px 16px',
      }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          width: '100%', maxWidth: 420, padding: '32px 28px',
          fontFamily: 'Poppins, sans-serif', position: 'relative',
          boxSizing: 'border-box',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Back button */}
        <button
          onClick={() => { closeOTPModal(); openLoginModal() }}
          aria-label="Back"
          type="button"
          style={{
            position: 'absolute', top: 16, left: 16,
            height: 36, padding: '0 12px', borderRadius: 999,
            background: '#F7F7F7', border: '1px solid #E7E1FF',
            display: 'flex', alignItems: 'center', gap: 6,
            cursor: 'pointer', color: '#24254F',
            fontSize: 13, fontWeight: 500, fontFamily: 'Poppins, sans-serif',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 19l-7-7 7-7" stroke="#24254F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: '#E7E1FF', border: '1px solid #E7E1FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#101129', margin: 0, lineHeight: 1.2 }}>
            Verify OTP
          </h2>
          <p style={{ fontSize: 13, color: '#828282', margin: '8px 0 0', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
            OTP sent to <span style={{ fontWeight: 600, color: '#101129' }}>+91 {mobileNumber}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={autocompleteInputRef}
            aria-label="One-time password"
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={OTP_LENGTH}
            value={otp.join('')}
            onChange={e => applyOtpCode(e.target.value)}
            disabled={isLoading}
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              opacity: 0,
              border: 0,
              padding: 0,
              pointerEvents: 'none',
            }}
          />

          {/* OTP boxes */}
          <div
            style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}
            onClick={() => autocompleteInputRef.current?.focus()}
            onPaste={handlePaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={isLoading}
                style={{
                  width: 56, height: 56,
                  textAlign: 'center', fontSize: 22, fontWeight: 700,
                  borderRadius: 14, border: `2px solid ${error ? '#EF4444' : digit ? '#8B5CF6' : '#E7E1FF'}`,
                  outline: 'none', color: '#101129',
                  backgroundColor: isLoading ? '#F9FAFB' : '#fff',
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
              />
            ))}
          </div>

          {error && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#EF4444', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            style={{
              width: '100%', height: 48, borderRadius: 12, border: 'none',
              background: isDisabled ? '#D1D5DB' : 'linear-gradient(90deg, #101129 0%, #2A2C5B 100%)',
              color: '#fff', fontSize: 15, fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              marginBottom: 20, transition: 'background 0.2s',
            }}
          >
            {isLoading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>

        {/* Resend */}
        <div style={{ textAlign: 'center', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
          {resendTimer > 0 ? (
            <span style={{ color: '#828282' }}>
              Resend OTP in <span style={{ fontWeight: 600, color: '#101129' }}>{resendTimer}s</span>
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              style={{
                background: 'none', border: 'none', padding: 0,
                cursor: isResending ? 'not-allowed' : 'pointer',
                color: '#8B5CF6', fontWeight: 600, fontSize: 13,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {isResending ? 'Sending…' : 'Resend OTP'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OTPModal

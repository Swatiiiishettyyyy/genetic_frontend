import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
}

export default function OTPInput({ value, onChange, length = 6 }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  const updateDigit = (index: number, digit: string) => {
    const newDigits = [...digits]
    newDigits[index] = digit
    onChange(newDigits.join(''))
  }

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) {
      updateDigit(index, '')
      return
    }
    const lastChar = val.slice(-1)
    updateDigit(index, lastChar)
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        updateDigit(index, '')
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        updateDigit(index - 1, '')
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted.padEnd(length, '').slice(0, length))
    const focusIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={el => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(index, e)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  )
}

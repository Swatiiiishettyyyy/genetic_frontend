import { api } from '../api/client'
import { getDeviceId, getDevicePlatform, getDeviceDetails } from '../utils/deviceUtil'
import { getRefreshToken } from './authStorage'

export interface SendOTPRequest {
  mobile: string
  country_code?: string
  purpose?: string
}

export interface SendOTPResponse {
  success: boolean
  message?: string
  data?: { sessionId?: string; expiresIn?: number }
}

export interface VerifyOTPRequest {
  country_code: string
  phone: string
  otp: string
  device_id: string
  device_platform: string
  device_details: string
  utm_fingerprint?: string
}

export interface VerifyOTPResponse {
  success: boolean
  message?: string
  token?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
  csrf_token?: string
  csrfToken?: string
  is_new_user?: boolean
  name?: string
  user?: { id: string | number; name?: string; email?: string; mobile?: string }
  data?: {
    token?: string
    access_token?: string
    csrf_token?: string
    csrfToken?: string
    refreshToken?: string
    refresh_token?: string
    is_new_user?: boolean
    user?: { id: string; mobileNumber: string; name?: string }
  }
}

export interface LogoutResponse {
  status: 'success' | 'error'
  message?: string
}

export interface RefreshTokenResponse {
  status: 'success' | 'error'
  message?: string
  access_token?: string
  refresh_token?: string
  csrf_token?: string
  expires_in?: number
}

export const sendOTP = async (mobile: string, country_code = '91'): Promise<SendOTPResponse> => {
  try {
    const cc = country_code.replace(/^\+/, '')
    return await api.post<SendOTPResponse>('/auth/send-otp', { phone: mobile, country_code: cc })
  } catch (error: any) {
    const data = error?.data || error?.response?.data || {}
    const status = error?.status || error?.response?.status
    if (status === 429) {
      const serverMessage = data?.detail || data?.message
      throw {
        message: serverMessage || 'Too many requests, please try again after sometime.',
        error: data || error,
        status,
      }
    }
    const detailsMessage = Array.isArray(data?.details) && data.details.length > 0
      ? data.details[0]?.message || data.details[0]?.msg
      : undefined
    throw { message: detailsMessage || data?.detail || data?.message || error?.message || 'Failed to send OTP', error: data || error, details: data?.details }
  }
}

export const verifyOTP = async (mobile: string, otp: string, country_code = '91'): Promise<VerifyOTPResponse> => {
  try {
    const cc = country_code.replace(/^\+/, '')
    const payload: VerifyOTPRequest = {
      country_code: cc,
      phone: mobile,
      otp,
      device_id: getDeviceId(),
      device_platform: getDevicePlatform(),
      device_details: getDeviceDetails(),
      utm_fingerprint: getDeviceId(),
    }
    return await api.post<VerifyOTPResponse>('/auth/verify-otp', payload)
  } catch (error: any) {
    throw { message: error?.data?.message || error?.response?.data?.message || 'Failed to verify OTP', error: error?.data || error?.response?.data || error }
  }
}

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  try {
    const refresh_token = getRefreshToken()
    return await api.post<RefreshTokenResponse>('/auth/refresh', refresh_token ? { refresh_token } : {})
  } catch (error: any) {
    throw { message: error?.data?.message || 'Failed to refresh token', error: error?.data || error }
  }
}

export const logout = async (): Promise<LogoutResponse> => {
  try {
    const refresh_token = getRefreshToken()
    return await api.post<LogoutResponse>('/auth/logout', refresh_token ? { refresh_token } : {})
  } catch (error: any) {
    throw { message: error?.data?.message || 'Failed to logout', error: error?.data || error }
  }
}

export const authService = { sendOTP, verifyOTP, refreshToken, logout }
export default authService

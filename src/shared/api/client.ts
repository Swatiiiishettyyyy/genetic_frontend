import {
  getAuthToken,
  getCsrfToken,
  getRefreshToken,
  saveCsrfToken,
  saveSessionTokens,
  clearAuthData,
} from '../auth/authStorage'
import { globalHandlers } from '../auth/globalHandlers'

export const API_BASE_URL = 'https://7qmg64nu2z.ap-south-1.awsapprunner.com'
const ENV_BASE = String(import.meta.env.VITE_API_BASE_URL ?? '').trim()
const BASE_URL = ENV_BASE
  ? ENV_BASE.replace(/\/+$/, '')
  : (import.meta.env.DEV ? '' : API_BASE_URL)
const API_TIMEOUT = 30000
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

function extractCsrfFromResponse(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  return (
    (d.csrf_token as string) ||
    (d.csrfToken as string) ||
    ((d.data as Record<string, unknown>)?.csrf_token as string) ||
    ((d.data as Record<string, unknown>)?.csrfToken as string) ||
    null
  )
}

function extractAuthTokens(data: unknown): { accessToken: string | null; refreshToken: string | null } {
  if (!data || typeof data !== 'object') return { accessToken: null, refreshToken: null }
  const d = data as Record<string, unknown>
  const nested = (d.data && typeof d.data === 'object') ? d.data as Record<string, unknown> : {}
  return {
    accessToken: (
      (d.access_token as string) ||
      (d.token as string) ||
      (nested.access_token as string) ||
      (nested.token as string) ||
      null
    ),
    refreshToken: (
      (d.refresh_token as string) ||
      (d.refreshToken as string) ||
      (nested.refresh_token as string) ||
      (nested.refreshToken as string) ||
      null
    ),
  }
}

function attachBearer(headers: Record<string, string>): void {
  const token = getAuthToken()
  if (token) headers.Authorization = `Bearer ${token}`
}

function persistAuthFromResponse(data: unknown): void {
  const csrf = extractCsrfFromResponse(data)
  if (csrf) saveCsrfToken(csrf)

  const { accessToken, refreshToken } = extractAuthTokens(data)
  if (accessToken || refreshToken) saveSessionTokens(accessToken, refreshToken)
}

function isCsrfForbidden(status: number, data: unknown): boolean {
  if (status !== 403 || !data || typeof data !== 'object') return false
  const detail = (data as { detail?: unknown }).detail
  return typeof detail === 'string' && detail.toLowerCase().includes('csrf')
}

async function refreshCsrfToken(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/csrf-token`, {
      method: 'GET',
      headers: (() => {
        const headers = { Accept: 'application/json' }
        attachBearer(headers)
        return headers
      })(),
      credentials: 'include',
    })
    const data: unknown = res.headers.get('content-type')?.includes('application/json')
      ? await res.json()
      : await res.text()
    if (!res.ok) return false
    const csrf = extractCsrfFromResponse(data)
    if (!csrf) return false
    persistAuthFromResponse(data)
    return true
  } catch {
    return false
  }
}

async function refreshAuthToken(): Promise<void> {
  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true
  refreshPromise = (async (): Promise<void> => {
    try {
      const csrfToken = getCsrfToken()
      const baseHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      attachBearer(baseHeaders)
      if (csrfToken) baseHeaders['X-CSRF-Token'] = csrfToken
      const storedRefreshToken = getRefreshToken()

      let lastMessage = 'Token refresh failed'
      let hitRateLimit = false

      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: baseHeaders,
        body: storedRefreshToken ? JSON.stringify({ refresh_token: storedRefreshToken }) : undefined,
        credentials: 'include',
      })
      const ct = res.headers.get('content-type')
      const responseData: unknown = ct?.includes('application/json') ? await res.json() : await res.text()

      if (res.ok) {
        persistAuthFromResponse(responseData)
        return
      }
      if (res.status === 429) hitRateLimit = true
      if (typeof responseData === 'object' && responseData && 'message' in responseData) {
        const m = (responseData as { message?: unknown }).message
        if (typeof m === 'string' && m.trim()) lastMessage = m.trim()
      }

      if (!hitRateLimit) {
        clearAuthData()
        globalHandlers.handleUnauthorized()
      }
      throw new Error(lastMessage)
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function refreshAuthIfNeeded(): Promise<void> {
  return refreshAuthToken()
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const csrfToken = getCsrfToken()
  const method = (options.method || 'GET').toUpperCase()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  }
  attachBearer(headers)
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken

  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const body = options.body instanceof FormData
    ? options.body
    : options.body
      ? JSON.stringify(options.body)
      : undefined

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)
  const signal = options.signal || controller.signal

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      method,
      headers,
      body,
      credentials: 'include',
      signal,
    })
    clearTimeout(timeoutId)

    const ct = res.headers.get('content-type')
    let data: T
    if (ct?.includes('application/json')) {
      data = await res.json() as T
    } else {
      const text = await res.text()
      try { data = JSON.parse(text) as T } catch { data = text as unknown as T }
    }

    persistAuthFromResponse(data)

    if (!res.ok) {
      const isRefreshEndpoint = path.includes('/auth/refresh')
      const isLogoutEndpoint = path.includes('/auth/logout')

      if (MUTATING_METHODS.has(method) && isCsrfForbidden(res.status, data)) {
        const refreshed = await refreshCsrfToken()
        const csrfAfter = getCsrfToken()
        if (refreshed && csrfAfter) {
          const retryHeaders: Record<string, string> = { ...headers, 'X-CSRF-Token': csrfAfter }
          attachBearer(retryHeaders)
          if (options.body instanceof FormData) delete retryHeaders['Content-Type']
          const retryRes = await fetch(`${BASE_URL}${path}`, {
            ...options,
            method,
            headers: retryHeaders,
            body,
            credentials: 'include',
            signal,
          })
          const retryData: T = retryRes.headers.get('content-type')?.includes('application/json')
            ? await retryRes.json()
            : await retryRes.text() as unknown as T
          persistAuthFromResponse(retryData)
          if (!retryRes.ok) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err: any = new Error((retryData as any)?.detail || (retryData as any)?.message || `Request failed ${retryRes.status}`)
            err.status = retryRes.status
            err.data = retryData
            err.response = { status: retryRes.status, data: retryData }
            throw err
          }
          return retryData
        }
      }

      if (res.status === 401 && !isRefreshEndpoint && !isLogoutEndpoint) {
        try {
          await refreshAuthToken()
          const retryHeaders: Record<string, string> = { ...headers }
          attachBearer(retryHeaders)
          const csrfAfter = getCsrfToken()
          if (csrfAfter) retryHeaders['X-CSRF-Token'] = csrfAfter
          if (options.body instanceof FormData) delete retryHeaders['Content-Type']

          const retryRes = await fetch(`${BASE_URL}${path}`, {
            ...options,
            method,
            headers: retryHeaders,
            body,
            credentials: 'include',
          })
          const retryData: T = retryRes.headers.get('content-type')?.includes('application/json')
            ? await retryRes.json()
            : await retryRes.text() as unknown as T
          persistAuthFromResponse(retryData)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (!retryRes.ok) throw { response: { status: retryRes.status, data: retryData }, message: (retryData as any)?.message || `Request failed ${retryRes.status}` }
          return retryData
        } catch (refreshErr: unknown) {
          if (refreshErr && typeof refreshErr === 'object' && 'response' in refreshErr) throw refreshErr
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = new Error((data as any)?.message || `API error ${res.status}: ${path}`)
      err.status = res.status
      err.data = data
      err.response = { status: res.status, data }
      throw err
    }

    return data
  } catch (error: unknown) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = new Error('Request timeout')
      err.code = 'TIMEOUT'
      throw err
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = new Error('Network error - no response received')
      err.code = 'NETWORK_ERROR'
      throw err
    }
    throw error
  }
}

async function requestBlob(path: string, options: RequestInit = {}): Promise<Blob> {
  const csrfToken = getCsrfToken()
  const headers: Record<string, string> = {
    Accept: 'application/pdf',
    ...(options.headers as Record<string, string>),
  }
  attachBearer(headers)
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = new Error(`API error ${res.status}: ${path}`)
    err.status = res.status
    try { err.data = JSON.parse(errBody) } catch { err.data = errBody }
    throw err
  }
  return res.blob()
}

export const api = {
  get:     <T>(path: string)                  => request<T>(path),
  post:    <T>(path: string, body: unknown)   => request<T>(path, { method: 'POST',   body: body as BodyInit }),
  put:     <T>(path: string, body: unknown)   => request<T>(path, { method: 'PUT',    body: body as BodyInit }),
  patch:   <T>(path: string, body: unknown)   => request<T>(path, { method: 'PATCH',  body: body as BodyInit }),
  delete:  <T>(path: string)                  => request<T>(path, { method: 'DELETE' }),
  getBlob: (path: string)                     => requestBlob(path),
}

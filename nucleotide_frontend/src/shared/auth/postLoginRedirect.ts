const STORAGE_KEY = 'nucleotide_post_login_redirect'

const BLOCKED_PATHS = new Set(['/', '/blood-test'])

export function isValidPostLoginRedirect(path: string): boolean {
  if (!path || !path.startsWith('/')) return false
  if (path.startsWith('//')) return false

  const pathname = path.split(/[?#]/, 1)[0]
  if (BLOCKED_PATHS.has(pathname)) return false

  return true
}

export function savePostLoginRedirect(path: string): void {
  if (typeof window === 'undefined') return
  if (!isValidPostLoginRedirect(path)) return
  window.sessionStorage.setItem(STORAGE_KEY, path)
}

export function consumePostLoginRedirect(): string | null {
  if (typeof window === 'undefined') return null
  const path = window.sessionStorage.getItem(STORAGE_KEY)
  window.sessionStorage.removeItem(STORAGE_KEY)
  return path && isValidPostLoginRedirect(path) ? path : null
}

export function getPostLoginRedirect(): string | null {
  if (typeof window === 'undefined') return null
  const path = window.sessionStorage.getItem(STORAGE_KEY)
  return path && isValidPostLoginRedirect(path) ? path : null
}

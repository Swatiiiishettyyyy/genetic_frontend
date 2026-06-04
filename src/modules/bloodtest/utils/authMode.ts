import { getPostLoginRedirect } from '../../../shared/auth/postLoginRedirect'

export function isGeneticAuthContext(): boolean {
  if (typeof window === 'undefined') return false

  const currentPath = window.location.pathname
  const redirectPath = getPostLoginRedirect()

  return currentPath.startsWith('/genetic-tests') || redirectPath?.startsWith('/genetic-tests') === true
}

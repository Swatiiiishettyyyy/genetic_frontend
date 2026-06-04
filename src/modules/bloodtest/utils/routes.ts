export const BLOOD_TEST_BASE = '/blood-test'
export const BLOOD_TEST_HOME = `${BLOOD_TEST_BASE}/tests`

const BLOOD_TEST_TOP_LEVEL_PATHS = new Set([
  '/cart',
  '/address',
  '/timeslot',
  '/payment',
  '/confirmation',
  '/orders',
  '/order-details',
  '/report',
  '/reports',
  '/empty-report',
  '/compare-reports',
  '/packages',
  '/metrics',
  '/vitals',
  '/comprehensive',
  '/women-health',
  '/men-health',
])

export function bloodTestPath(path = 'tests'): string {
  const clean = path.replace(/^\/+/, '')
  return clean ? `${BLOOD_TEST_BASE}/${clean}` : BLOOD_TEST_HOME
}

export function canonicalBloodTestHref(href: string): string {
  if (!href) return href
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href
  if (href === '/') return BLOOD_TEST_HOME
  if (href === '#tests') return BLOOD_TEST_HOME
  if (href.startsWith('#')) return `${BLOOD_TEST_HOME}${href}`
  if (href.startsWith(`${BLOOD_TEST_BASE}/`) || href === BLOOD_TEST_BASE) return href

  const [pathWithMaybeHash, query = ''] = href.split('?')
  const [path, hash = ''] = pathWithMaybeHash.split('#')
  const firstSegment = `/${path.replace(/^\/+/, '').split('/')[0] ?? ''}`
  if (!BLOOD_TEST_TOP_LEVEL_PATHS.has(firstSegment)) return href

  const normalizedPath = path === '/' ? '/tests' : path
  const withQuery = query ? `${BLOOD_TEST_BASE}${normalizedPath}?${query}` : `${BLOOD_TEST_BASE}${normalizedPath}`
  return hash ? `${withQuery}#${hash}` : withQuery
}

export function productSlugFromName(name: string): string {
  const slug = String(name ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'test'
}

export function productDetailPath(name: string): string {
  return `${BLOOD_TEST_BASE}/${productSlugFromName(name)}`
}

export function samePathForActive(currentPath: string, targetHref: string): boolean {
  const targetPath = targetHref.split(/[?#]/)[0] || '/'
  if (targetPath === BLOOD_TEST_HOME) {
    return currentPath === '/' || currentPath === BLOOD_TEST_BASE || currentPath === BLOOD_TEST_HOME
  }
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

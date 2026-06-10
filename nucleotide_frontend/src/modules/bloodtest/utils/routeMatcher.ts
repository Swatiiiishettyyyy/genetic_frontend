const bloodTestLegacyPaths = new Set([
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
  '/privacy-policy',
  '/terms',
  '/refund-policy',
  '/contact-us',
  '/faq',
])

export function shouldRenderBloodTestRoutes(path: string): boolean {
  return (
    path === '/index.html' ||
    path === '/blood-test' ||
    path.startsWith('/blood-test/') ||
    path === '/upcoming' ||
    path.startsWith('/upcoming/') ||
    path === '/genetics' ||
    path.startsWith('/genetics/') ||
    path === '/genetic-tests/cart' ||
    path === '/genetic-tests/address' ||
    path === '/genetic-tests/timeslot' ||
    path === '/genetic-tests/payment' ||
    path === '/genetic-tests/confirmation' ||
    path.startsWith('/vitals/') ||
    path.startsWith('/comprehensive/') ||
    path.startsWith('/women-health') ||
    path.startsWith('/men-health') ||
    path.startsWith('/metrics/') ||
    bloodTestLegacyPaths.has(path)
  )
}

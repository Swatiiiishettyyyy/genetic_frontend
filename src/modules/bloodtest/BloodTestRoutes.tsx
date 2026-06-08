import { Component, lazy, Suspense, useCallback, useEffect, useRef, type ErrorInfo, type ReactNode } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../shared/auth/AuthContext'
import { AuthModalStack } from './components/AuthModalStack'
import { savePostLoginRedirect } from '../../shared/auth/postLoginRedirect'

const CartPage                = lazy(() => import('./pages/CartPage'))
const AddressPage             = lazy(() => import('./pages/AddressPage'))
const PaymentPage             = lazy(() => import('./pages/PaymentPage'))
const ConfirmationPage        = lazy(() => import('./pages/ConfirmationPage'))
const OrderDetailsPage        = lazy(() => import('./pages/OrderDetailsPage'))
const ReportsListPage         = lazy(() => import('./pages/ReportsListPage'))
const EmptyReportPage         = lazy(() => import('./pages/EmptyReportPage'))
const CompareReportsPage      = lazy(() => import('./pages/CompareReportsPage'))
const PackagesPage            = lazy(() => import('./pages/PackagesPage'))
const OrdersPage              = lazy(() => import('./pages/OrdersPage'))
const ReportPage              = lazy(() => import('./pages/ReportPage'))
const TestPage                = lazy(() => import('./pages/TestPage'))
const TestDetailPage          = lazy(() => import('./pages/TestDetailPage'))
const WomenHealthSegmentPage  = lazy(() => import('./pages/WomenHealthSegmentPage'))
const MenHealthSegmentPage    = lazy(() => import('./pages/MenHealthSegmentPage'))
const OrganDetailPage         = lazy(() => import('./pages/OrganDetailPage'))
const HealthMetricsPage       = lazy(() => import('./pages/HealthMetricsPage'))
const TimeSlotPage            = lazy(() => import('./pages/TimeSlotPage'))
const VitalsOrganPage         = lazy(() => import('./pages/VitalsOrganPage'))
const ComprehensiveBrowsePage = lazy(() => import('./pages/ComprehensiveBrowsePage'))
const PrivacyPolicyPage       = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsPage               = lazy(() => import('./pages/TermsPage'))
const RefundPolicyPage        = lazy(() => import('./pages/RefundPolicyPage'))
const ContactUsPage           = lazy(() => import('./pages/ContactUsPage'))
const FAQPage                 = lazy(() => import('./pages/FAQPage'))
const UpcomingModulePage      = lazy(() => import('./pages/UpcomingModulePage'))
import type { TestCardProps } from './types'
import {
  checkoutPricingSnapshotKey,
  pullCheckoutSnapshot,
} from './api/cart'
import { useCheckoutSession } from './hooks/useCheckoutSession'
import { cartLineKey, findExistingLineForAdd } from './utils/cartLineKey'
import { readUtmFromUrl, hasUtmParams, saveUtmToSession, markUtmFired, wasUtmFired, utmFireKey } from './utils/utmUtil'
import { trackUtm } from './api/utm'
import { getDeviceId, getUtmDeviceMetadata } from '../../shared/utils/deviceUtil'
import { BLOOD_TEST_BASE, bloodTestPath, productDetailPath } from './utils/routes'
import { checkoutHomePath, checkoutModuleFromPath, checkoutPathForModule } from './utils/checkoutRoutes'

// Page-1 Cart is now local-only; server hydration starts from Address onward.
const CHECKOUT_PATHS = [
  '/address',
  '/timeslot',
  '/payment',
  bloodTestPath('address'),
  bloodTestPath('timeslot'),
  bloodTestPath('payment'),
  checkoutPathForModule('genetic-test', 'address'),
  checkoutPathForModule('genetic-test', 'timeslot'),
  checkoutPathForModule('genetic-test', 'payment'),
]

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, authReady, openLoginModal } = useAuth()
  const location = useLocation()
  const triggered = useRef(false)

  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn && !triggered.current) {
      triggered.current = true
      savePostLoginRedirect(`${location.pathname}${location.search}${location.hash}`)
      openLoginModal()
    }
    if (isLoggedIn) triggered.current = false
  }, [authReady, isLoggedIn, openLoginModal, location.pathname, location.search, location.hash])

  if (!authReady) return null
  if (!isLoggedIn) return <Navigate to={checkoutHomePath(checkoutModuleFromPath(location.pathname))} replace />
  return <>{children}</>
}

function ScrollToTopOnRouteChange() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])
  return null
}

function RedirectPreservingLocation({ to }: { to: string }) {
  const location = useLocation()
  return <Navigate to={`${to}${location.search}${location.hash}`} state={location.state} replace />
}

function LegacyProductRedirect() {
  const location = useLocation()
  const params = location.pathname.split('/').filter(Boolean)
  const raw = params[0] ?? ''
  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = raw
  }
  return (
    <Navigate
      to={`${productDetailPath(decoded)}${location.search}${location.hash}`}
      state={location.state}
      replace
    />
  )
}

type RouteErrorBoundaryProps = {
  children: ReactNode
  resetKey: string
}

type RouteErrorBoundaryState = {
  error: unknown
}

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: unknown): RouteErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Route render failed:', error, info)
  }

  componentDidUpdate(prevProps: RouteErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div
        role="alert"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: 24,
          textAlign: 'center',
          fontFamily: 'Poppins, sans-serif',
          color: '#101129',
          background: '#fff',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>We could not load this page.</h1>
        <p style={{ margin: 0, maxWidth: 420, color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>
          Please refresh once. If it still does not open, try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            minHeight: 42,
            padding: '0 18px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            background: '#8B5CF6',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Refresh
        </button>
      </div>
    )
  }
}

export default function App() {
  const location = useLocation()
  const { session, update, upsertGroup, clearSession } = useCheckoutSession()
  const { isLoggedIn, user, members, openLoginModal, openCompleteProfileModal } = useAuth()
  const checkoutModule = checkoutModuleFromPath(location.pathname)
  const cartItems = session.checkoutKind === checkoutModule ? session.cartItems : []
  const cartLineCount = cartItems.length
  const didInitialSync = useRef(false)
  const utmInFlight = useRef<Set<string>>(new Set())
  const sessionRef = useRef(session)
  sessionRef.current = session

  useEffect(() => {
    if (!location.pathname.startsWith('/blood-test')) return
    const utm = readUtmFromUrl()
    if (!hasUtmParams(utm)) return
    const fingerprint = getDeviceId()
    const landingUrl = window.location.href
    const fireKey = utmFireKey(fingerprint, landingUrl, utm)
    if (wasUtmFired(fireKey) || utmInFlight.current.has(fireKey)) return

    saveUtmToSession(utm)
    utmInFlight.current.add(fireKey)
    void (async () => {
      try {
        await trackUtm({
          fingerprint,
          landing_url: landingUrl,
          ...utm,
          ...(await getUtmDeviceMetadata()),
        })
        markUtmFired(fireKey)
      } catch {
        /* non-critical */
      } finally {
        utmInFlight.current.delete(fireKey)
      }
    })()
  }, [location.pathname, location.search])

  const applyCheckoutSnapshot = useCallback(
    (snap: Awaited<ReturnType<typeof pullCheckoutSnapshot>>) => {
      const clearPricing = !snap.hadCartLinesFromApi
      update({
        checkoutKind: 'blood-test',
        cartItems: snap.cartItems,
        groups: snap.groups,
        checkoutSyncError: null,
        ...(clearPricing
          ? {
              netPayableAmount: null,
              thyrocarePricing: null,
              pricingSnapshotKey: null,
            }
          : {}),
      })
    },
    [update],
  )

  /** GET /cart/view + active groups → session (single source of truth for checkout UI). */
  const hydrateCheckoutFromView = useCallback(async () => {
    const snap = await pullCheckoutSnapshot({
      previousGroups: sessionRef.current.groups,
      localOnlyItems: sessionRef.current.cartItems.filter(i => !i.cartItemId),
      fallbackItems: sessionRef.current.cartItems,
    })
    applyCheckoutSnapshot(snap)
  }, [applyCheckoutSnapshot])

  const runCheckoutHydrateWithErrorBanner = useCallback(async () => {
    try {
      await hydrateCheckoutFromView()
    } catch (e) {
      console.error('Checkout sync failed:', e)
      // If the user is no longer logged in, the auth failure already opened the
      // login modal via globalHandlers.handleUnauthorized — don't overlay a cart
      // error banner on top of it.
      if (!isLoggedIn) return
      update({
        checkoutSyncError: 'Could not refresh your cart. Check your connection and try again.',
      })
    }
  }, [hydrateCheckoutFromView, isLoggedIn, update])

  const retryCheckoutSync = useCallback(async () => {
    await runCheckoutHydrateWithErrorBanner()
  }, [runCheckoutHydrateWithErrorBanner])

  // Align session with server cart + Thyrocare groups (replaces merge-only upsert that left stale groups).
  // Runs when user opens a checkout step (Page-1 cart is local-only).
  useEffect(() => {
    const onCheckout = CHECKOUT_PATHS.includes(location.pathname)
    if (!onCheckout) return
    if (checkoutModuleFromPath(location.pathname) === 'genetic-test') return
    if (!didInitialSync.current) didInitialSync.current = true
    void runCheckoutHydrateWithErrorBanner()
  }, [location.pathname, runCheckoutHydrateWithErrorBanner])

  useEffect(() => {
    const key = checkoutPricingSnapshotKey(session.groups, session.cartItems)
    const hasPricing = !!(session.thyrocarePricing || session.netPayableAmount)
    if (!hasPricing) return
    if (!session.pricingSnapshotKey || session.pricingSnapshotKey !== key) {
      update({
        netPayableAmount: null,
        thyrocarePricing: null,
        pricingSnapshotKey: null,
      })
    }
  }, [session.groups, session.cartItems, session.pricingSnapshotKey, session.thyrocarePricing, session.netPayableAmount, update])

  const handleAddToCart = useCallback((test: TestCardProps): boolean => {
    const hasSelf =
      members.some(m => String(m.relation ?? '').trim().toLowerCase() === 'self' || m.is_self === true || m.is_self_profile === true)

    // Requirement: if profile isn't completed, prompt for Self profile when attempting to add to cart.
    if (!isLoggedIn) {
      openLoginModal()
      return false
    }
    if (!hasSelf && user?.is_new_user === true) {
      openCompleteProfileModal()
      // Block add-to-cart until Self profile exists.
      return false
    }

    const addQty = test.quantity != null && test.quantity > 0 ? test.quantity : 1
    const existing = findExistingLineForAdd(cartItems, test)
    const newQuantity = existing ? existing.quantity + addQty : addQty
    const mergeKey = existing ? cartLineKey(existing) : null
    update({
      checkoutKind: 'blood-test',
      cartItems: (() => {
        if (existing && mergeKey) {
          return cartItems.map(i => (cartLineKey(i) === mergeKey ? { ...i, quantity: i.quantity + addQty } : i))
        }
        return [...cartItems, {
          thyrocareProductId: test.thyrocareProductId,
          maxBeneficiaries: test.maxBeneficiaries,
          name: test.name,
          type: test.type,
          price: test.price,
          originalPrice: test.originalPrice,
          quantity: addQty,
        }]
      })(),
      netPayableAmount: null,
      thyrocarePricing: null,
      pricingSnapshotKey: null,
    })
    return true
  }, [cartItems, update, isLoggedIn, members, openLoginModal, openCompleteProfileModal])

  const showCheckoutSyncBanner =
    CHECKOUT_PATHS.includes(location.pathname) && session.checkoutSyncError

  return (
    <>
      <ScrollToTopOnRouteChange />
      {/* Auth modals — always in DOM, shown via AuthContext state */}
      <AuthModalStack />
      {showCheckoutSyncBanner && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
            padding: '10px 16px',
            background: '#FEF3C7',
            borderBottom: '1px solid #FCD34D',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#92400E',
          }}
        >
          <span>{session.checkoutSyncError}</span>
          <button
            type="button"
            onClick={() => void retryCheckoutSync()}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: '#101129',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Retry
          </button>
        </div>
      )}
    <RouteErrorBoundary resetKey={`${location.pathname}${location.search}`}>
    <Suspense fallback={<div style={{ minHeight: '50vh' }} />}>
      <Routes>
      {/* Some static hosts land on /index.html; treat it as the blood-test home. */}
      <Route path="/index.html" element={<RedirectPreservingLocation to={BLOOD_TEST_BASE} />} />
      {/* Badge = number of distinct cart lines (products), not sum of patient quantities */}
      <Route path="/" element={<RedirectPreservingLocation to={BLOOD_TEST_BASE} />} />
      <Route path={BLOOD_TEST_BASE} element={<TestPage cartCount={cartLineCount} />} />
      <Route path="/genetics" element={<Navigate to="/upcoming/genetic-testing" replace />} />
      <Route path="/genetics/*" element={<Navigate to="/upcoming/genetic-testing" replace />} />
      <Route path="/upcoming" element={<Navigate to="/upcoming/genetic-testing" replace />} />
      <Route path="/upcoming/:moduleSlug" element={<UpcomingModulePage cartCount={cartLineCount} />} />

      <Route path="/blood-test/tests" element={<TestPage cartCount={cartLineCount} />} />
      <Route path="/blood-test/vitals/:organId" element={<VitalsOrganPage cartCount={cartLineCount} />} />
      <Route path="/blood-test/comprehensive/:gender" element={<ComprehensiveBrowsePage cartCount={cartLineCount} />} />
      <Route path="/blood-test/women-health/:segment" element={<WomenHealthSegmentPage cartCount={cartLineCount} />} />
      <Route path="/blood-test/women-health" element={<WomenHealthSegmentPage cartCount={cartLineCount} />} />
      <Route path="/blood-test/men-health/:segment" element={<MenHealthSegmentPage cartCount={cartLineCount} />} />
      <Route path="/blood-test/men-health" element={<MenHealthSegmentPage cartCount={cartLineCount} />} />
      <Route path="/blood-test/packages" element={<PackagesPage cartCount={cartLineCount} />} />
      <Route path="/blood-test/metrics" element={<HealthMetricsPage cartCount={cartLineCount} />} />
      <Route path="/blood-test/metrics/:organ" element={<OrganDetailPage cartCount={cartLineCount} />} />
      <Route
        path="/blood-test/cart"
        element={
          <ProtectedRoute>
            <CartPage
              cartCount={cartLineCount}
              items={cartItems}
              session={session}
              onSessionUpdate={update}
            />
          </ProtectedRoute>
        }
      />
      <Route path="/blood-test/address" element={<ProtectedRoute><AddressPage cartCount={cartLineCount} items={cartItems} session={session} onSessionUpdate={update} onUpsertGroup={upsertGroup} /></ProtectedRoute>} />
      <Route path="/blood-test/timeslot" element={<ProtectedRoute><TimeSlotPage cartCount={cartLineCount} items={cartItems} session={session} onSessionUpdate={update} onUpsertGroup={upsertGroup} /></ProtectedRoute>} />
      <Route path="/blood-test/payment" element={<ProtectedRoute><PaymentPage cartCount={cartLineCount} items={cartItems} session={session} onSessionUpdate={update} onOrderComplete={clearSession} /></ProtectedRoute>} />
      <Route path="/blood-test/confirmation" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />
      <Route
        path="/genetic-tests/cart"
        element={
          <CartPage
            cartCount={cartLineCount}
            items={cartItems}
            session={session}
            onSessionUpdate={update}
          />
        }
      />
      <Route path="/genetic-tests/address" element={<AddressPage cartCount={cartLineCount} items={cartItems} session={session} onSessionUpdate={update} onUpsertGroup={upsertGroup} />} />
      <Route path="/genetic-tests/timeslot" element={<TimeSlotPage cartCount={cartLineCount} items={cartItems} session={session} onSessionUpdate={update} onUpsertGroup={upsertGroup} />} />
      <Route path="/genetic-tests/payment" element={<PaymentPage cartCount={cartLineCount} items={cartItems} session={session} onSessionUpdate={update} onOrderComplete={clearSession} />} />
      <Route path="/genetic-tests/confirmation" element={<ConfirmationPage />} />
      <Route path="/blood-test/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/blood-test/order-details" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
      <Route path="/blood-test/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      <Route path="/blood-test/reports" element={<ProtectedRoute><ReportsListPage /></ProtectedRoute>} />
      <Route path="/blood-test/empty-report" element={<ProtectedRoute><EmptyReportPage /></ProtectedRoute>} />
      <Route path="/blood-test/compare-reports" element={<ProtectedRoute><CompareReportsPage /></ProtectedRoute>} />
      <Route path="/blood-test/:id" element={<TestDetailPage cartCount={cartLineCount} onAddToCart={handleAddToCart} />} />

      <Route path="/vitals/:organId" element={<RedirectPreservingLocation to={bloodTestPath('vitals/' + (location.pathname.split('/')[2] ?? ''))} />} />
      <Route path="/comprehensive/:gender" element={<RedirectPreservingLocation to={bloodTestPath('comprehensive/' + (location.pathname.split('/')[2] ?? ''))} />} />
      <Route path="/women-health/:segment" element={<RedirectPreservingLocation to={bloodTestPath('women-health/' + (location.pathname.split('/')[2] ?? ''))} />} />
      <Route path="/women-health" element={<RedirectPreservingLocation to={bloodTestPath('women-health')} />} />
      <Route path="/men-health/:segment" element={<RedirectPreservingLocation to={bloodTestPath('men-health/' + (location.pathname.split('/')[2] ?? ''))} />} />
      <Route path="/men-health" element={<RedirectPreservingLocation to={bloodTestPath('men-health')} />} />
      <Route path="/cart" element={<RedirectPreservingLocation to={bloodTestPath('cart')} />} />
      <Route path="/address" element={<RedirectPreservingLocation to={bloodTestPath('address')} />} />
      <Route path="/timeslot" element={<RedirectPreservingLocation to={bloodTestPath('timeslot')} />} />
      <Route path="/payment" element={<RedirectPreservingLocation to={bloodTestPath('payment')} />} />
      <Route path="/confirmation" element={<RedirectPreservingLocation to={bloodTestPath('confirmation')} />} />
      <Route path="/orders" element={<RedirectPreservingLocation to={bloodTestPath('orders')} />} />
      <Route path="/order-details" element={<RedirectPreservingLocation to={bloodTestPath('order-details')} />} />
      <Route path="/report" element={<RedirectPreservingLocation to={bloodTestPath('report')} />} />
      <Route path="/reports" element={<RedirectPreservingLocation to={bloodTestPath('reports')} />} />
      <Route path="/empty-report" element={<RedirectPreservingLocation to={bloodTestPath('empty-report')} />} />
      <Route path="/compare-reports" element={<RedirectPreservingLocation to={bloodTestPath('compare-reports')} />} />
      <Route path="/packages" element={<RedirectPreservingLocation to={bloodTestPath('packages')} />} />
      <Route path="/metrics" element={<RedirectPreservingLocation to={bloodTestPath('metrics')} />} />
      <Route path="/metrics/:organ" element={<RedirectPreservingLocation to={bloodTestPath('metrics/' + (location.pathname.split('/')[2] ?? ''))} />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      <Route path="/contact-us" element={<ContactUsPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/:id" element={<LegacyProductRedirect />} />
      </Routes>
    </Suspense>
    </RouteErrorBoundary>
    </>
  )
}

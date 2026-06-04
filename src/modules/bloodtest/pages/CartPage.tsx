import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { CartItem } from '../types'
import { fetchActiveGroups, deleteCartProduct, getCheckoutPriceSummary, checkoutPatientCount, type CartGroup } from '../api/cart'
import { toTestCard } from '../api/products'
import { useProductCatalog } from '../hooks/useProductCatalog'
import { parseMoney } from '../utils/money'
import { ga4ItemsFromCart, trackGa4EcommerceEvent } from '../utils/ga4Ecommerce'
import { ga4CustomCartParams, ga4CustomUserParams, trackGa4CustomEvent } from '../utils/ga4CustomEvents'
import { useAuth } from '../../../shared/auth/AuthContext'
import { Navbar } from '../components'
import { CheckoutStepper, DEFAULT_STEPS } from '../components/CheckoutStepper'
import { OrderSummaryCard } from '../components/OrderSummaryCard'
import EmptyCartPage from './EmptyCartPage'
import { checkoutHomePath, checkoutLabels, checkoutModuleFromPath, checkoutPathFromLocation } from '../utils/checkoutRoutes'

const NAV_LINKS = [
  { label: 'Tests', href: '/' },
  { label: 'Packages', href: '/' },
  { label: 'Reports', href: '#' },
  { label: 'Metrics', href: '/metrics' },
  { label: 'Orders', href: '#' },
]

const LS_KEY = 'nucleotide_cart_page1_v1'

type Page1Selection = Record<number, number> // pid -> memberCount (quantity)

function selectionFromCartItems(items: CartItem[]): Page1Selection {
  const out: Page1Selection = {}
  for (const it of items) {
    if (it.thyrocareProductId != null && Number.isFinite(it.thyrocareProductId) && it.quantity > 0) {
      out[it.thyrocareProductId] = Math.max(1, Math.floor(it.quantity))
    }
  }
  return out
}

function sameSelection(a: Page1Selection, b: Page1Selection): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every(k => a[Number(k)] === b[Number(k)])
}

function loadLocalSelection(): Page1Selection {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const out: Page1Selection = {}
    for (const [k, v] of Object.entries(parsed ?? {})) {
      const pid = Number(k)
      const qty = typeof v === 'number' ? v : Number(v)
      if (Number.isFinite(pid) && pid > 0 && Number.isFinite(qty) && qty > 0) out[pid] = Math.floor(qty)
    }
    return out
  } catch {
    return {}
  }
}

function saveLocalSelection(sel: Page1Selection) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(sel)) } catch { /* ignore */ }
}

interface CartPageProps {
  cartCount?: number
  /** Page-1 local-only selections (pid + quantity). */
  items: CartItem[]
  session: import('../hooks/useCheckoutSession').CheckoutSession
  onSessionUpdate: (patch: Partial<import('../hooks/useCheckoutSession').CheckoutSession>) => void
}

export default function CartPage({
  cartCount,
  items,
  session,
  onSessionUpdate,
}: CartPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, user, currentMember } = useAuth()
  const { products, ready } = useProductCatalog()
  const checkoutModule = checkoutModuleFromPath(location.pathname)
  const isGeneticCheckout = checkoutModule === 'genetic-test'
  const labels = checkoutLabels(checkoutModule)

  const [dbGroups, setDbGroups] = useState<CartGroup[]>([])
  const [loadingDb, setLoadingDb] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)
  const viewedCartKeyRef = useRef<string | null>(null)

  const [selection, setSelection] = useState<Page1Selection>(() => {
    // start with session items (e.g. from TestDetailPage), fall back to localStorage
    const fromSession = selectionFromCartItems(items)
    if (checkoutModule === 'genetic-test') return fromSession
    const fromLs = loadLocalSelection()
    // IMPORTANT: if we already have an explicit selection from navigation/session,
    // do not merge in older localStorage state (it causes “extra” items to appear).
    return Object.keys(fromSession).length > 0 ? fromSession : fromLs
  })

  useEffect(() => {
    const fromSession = selectionFromCartItems(items)
    if (Object.keys(fromSession).length === 0) return
    setSelection(prev => (sameSelection(prev, fromSession) ? prev : fromSession))
  }, [items])

  useEffect(() => {
    if (isGeneticCheckout) return
    saveLocalSelection(selection)
  }, [selection, isGeneticCheckout])

  // Page-1 load rule: GET /thyrocare/cart/active-all and restore DB-saved selections
  useEffect(() => {
    if (isGeneticCheckout) {
      setLoadingDb(false)
      return
    }
    let cancelled = false
    setLoadingDb(true)
    setDbError(null)
    fetchActiveGroups()
      .then(groups => {
        if (cancelled) return
        setDbGroups(groups)
        setSelection(prev => {
          // If user already has a selection (e.g. just came from TestDetailPage),
          // do NOT auto-add previously saved DB groups into Page-1 UI.
          if (Object.keys(prev).length > 0) return prev
          const next = { ...prev }
          for (const g of groups) {
            const pid = Number(g.thyrocare_product_id)
            if (!Number.isFinite(pid) || pid <= 0) continue
            const cnt = Array.isArray(g.member_ids) ? g.member_ids.length : 0
            if (cnt > 0) next[pid] = cnt
            else next[pid] = next[pid] ?? 1
          }
          return next
        })
      })
      .catch(() => {
        if (!cancelled) setDbError('Could not restore saved tests. Please check your connection and retry.')
      })
      .finally(() => { if (!cancelled) setLoadingDb(false) })
    return () => { cancelled = true }
  }, [isGeneticCheckout])

  const dbSavedPids = useMemo(() => new Set(dbGroups.map(g => Number(g.thyrocare_product_id)).filter(Number.isFinite)), [dbGroups])

  const selectedItems: CartItem[] = useMemo(() => {
    if (isGeneticCheckout) {
      return items
        .map(it => {
          const pid = Number(it.thyrocareProductId)
          if (!Number.isFinite(pid) || pid <= 0) return null
          const qty = selection[pid]
          if (!qty || qty <= 0) return null
          return { ...it, quantity: Math.max(1, Math.floor(qty)) }
        })
        .filter((it): it is CartItem => it != null)
    }
    if (!ready) return []
    const byPid = new Map<number, CartItem>()
    // build from catalog so the list is always “products DB”
    for (const p of products) {
      const pid = Number((p as any).id)
      if (!Number.isFinite(pid) || pid <= 0) continue
      const qty = selection[pid]
      if (!qty || qty <= 0) continue
      const card = toTestCard(p)
      byPid.set(pid, {
        thyrocareProductId: pid,
        name: card.name,
        type: card.type,
        price: card.price,
        originalPrice: card.originalPrice,
        quantity: Math.max(1, Math.floor(qty)),
        maxBeneficiaries: card.maxBeneficiaries,
      })
    }
    return [...byPid.values()]
  }, [products, ready, selection, isGeneticCheckout, items])

  const selectedItemsKey = useMemo(
    () => selectedItems.map(i => `${i.thyrocareProductId ?? i.name}:${i.quantity}:${i.price}`).sort().join('|'),
    [selectedItems],
  )

  // keep checkout session in sync with Page-1 selection (local-only)
  useEffect(() => {
    if (session.checkoutKind !== checkoutModule && selectedItems.length === 0) return
    onSessionUpdate({
      checkoutKind: checkoutModule,
      cartItems: selectedItems,
      // Page-1 rule: don't trust DB groups for non-saved picks; keep groups as-is until Address pulls active-all
      netPayableAmount: null,
      thyrocarePricing: null,
      pricingSnapshotKey: null,
    })
  }, [selectedItemsKey, onSessionUpdate, checkoutModule, session.checkoutKind])

  const patientCount = useMemo(() => checkoutPatientCount(selectedItems), [selectedItems])
  const { total } = useMemo(
    () =>
      getCheckoutPriceSummary(selectedItems, {
        thyrocarePricing: null,
        netPayableAmount: null,
        groups: [],
        pricingSnapshotKey: null,
      }),
    [selectedItems],
  )

  function handleRemoveItem(it: CartItem, pid: number, qty: number, isSaved: boolean) {
    setSelection(prev => {
      const next = { ...prev }
      delete next[pid]
      return next
    })
    onSessionUpdate({
      checkoutKind: isGeneticCheckout ? 'genetic-test' : session.checkoutKind,
      cartItems: selectedItems.filter(item => Number(item.thyrocareProductId) !== pid),
      groups: isGeneticCheckout
        ? session.groups.filter(g => Number(g.thyrocare_product_id) !== pid)
        : session.groups,
      netPayableAmount: null,
      thyrocarePricing: null,
      pricingSnapshotKey: null,
    })
    try {
      trackGa4EcommerceEvent('remove_from_cart', ga4ItemsFromCart([it], {
        listName: 'Cart',
        listId: isGeneticCheckout ? 'GENETIC_CART' : 'BT_CART',
      }), {
        value: Math.round(parseMoney(it.price) * Math.max(1, Math.floor(Number(qty) || 1))),
      })
    } catch {
      /* analytics should never block cart actions */
    }
    if (!isGeneticCheckout && isSaved) {
      void (async () => {
        try {
          await deleteCartProduct(pid)
          const refreshed = await fetchActiveGroups()
          setDbGroups(refreshed)
        } catch {
          /* keep local */
        }
      })()
    }
  }

  function handleContinue() {
    if (selectedItems.length === 0) return
    onSessionUpdate({
      checkoutKind: isGeneticCheckout ? 'genetic-test' : session.checkoutKind,
      cartItems: selectedItems,
      netPayableAmount: null,
      thyrocarePricing: null,
      pricingSnapshotKey: null,
    })
    try {
      trackGa4CustomEvent(isGeneticCheckout ? 'genetic_cart_continue' : 'bt_cart_continue', {
        linkText: 'Continue',
        ...ga4CustomCartParams(selectedItems),
        ...ga4CustomUserParams({ isLoggedIn, user, currentMember }),
      })
      trackGa4EcommerceEvent('begin_checkout', ga4ItemsFromCart(selectedItems, {
        listName: 'Cart',
        listId: isGeneticCheckout ? 'GENETIC_CART' : 'BT_CART',
      }), { value: total })
    } catch {
      /* analytics should never block checkout */
    }
    navigate(checkoutPathFromLocation(location.pathname, 'address'))
  }

  useEffect(() => {
    if (selectedItems.length === 0) return
    const key = selectedItems
      .map(i => `${i.thyrocareProductId ?? i.name}:${i.quantity}:${i.price}`)
      .sort()
      .join('|')
    if (viewedCartKeyRef.current === key) return
    viewedCartKeyRef.current = key
    trackGa4EcommerceEvent('view_cart', ga4ItemsFromCart(selectedItems, {
      listName: 'Cart',
      listId: 'BT_CART',
    }), { value: total })
  }, [selectedItems, total])

  // If the user removed everything, show the empty cart state.
  // (Don't depend on catalog readiness; selection is the source of truth for Page-1.)
  if (selectedItems.length === 0 && Object.keys(selection).length === 0) return <EmptyCartPage module={checkoutModule} />

  return (
    <div className="cart-page" style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Poppins', sans-serif" }}>
      <Navbar logoSrc="/favicon.svg" logoAlt="Nucleotide" links={NAV_LINKS} ctaLabel="My Cart" cartCount={cartCount} hideSearchOnMobile onCtaClick={() => navigate(checkoutPathFromLocation(location.pathname, 'cart'))} />

      {/* Breadcrumb */}
      <div
        className="cart-breadcrumb"
        style={{
          padding: '14px clamp(16px, 5vw, 56px)',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14, color: '#6B7280', cursor: 'pointer' }} onClick={() => navigate(checkoutHomePath(checkoutModule))}>{labels.navRoot}</span>
        <span style={{ fontSize: 14, color: '#6B7280' }}>›</span>
        <span style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>Checkout</span>
      </div>

      {/* Stepper */}
      <CheckoutStepper steps={DEFAULT_STEPS} activeStep={0} />

      {/* Content */}
      <div className="cart-content" style={{ gap: 24, maxWidth: 1200 }}>

        {/* Selected tests only */}
        <div style={{ flex: 1 }}>
          <h2 className="cart-items-title" style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 20 }}>
            {labels.selectedTitle} ({selectedItems.length} selected)
          </h2>
          {dbError && (
            <div role="alert" style={{ fontSize: 13, color: '#B91C1C', fontFamily: 'Inter, sans-serif', padding: '10px 12px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA', marginBottom: 12 }}>
              {dbError}
            </div>
          )}
          {loadingDb && (
            <p style={{ color: '#828282', fontSize: 14, fontFamily: 'Inter,sans-serif' }}>Restoring saved selections…</p>
          )}

          {!isGeneticCheckout && !ready ? (
            <p style={{ color: '#828282', fontSize: 14, fontFamily: 'Inter,sans-serif' }}>Loading tests…</p>
          ) : selectedItems.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 12 }}>
              {labels.emptyCopy}
            </div>
          ) : (
            selectedItems.map((it) => {
              const pid = Number(it.thyrocareProductId)
              if (!Number.isFinite(pid) || pid <= 0) return null
              const qty = selection[pid] ?? it.quantity ?? 1
              const isSaved = dbSavedPids.has(pid)
              const max = it.maxBeneficiaries ?? 10
              const plusDisabled = qty >= max
              return (
                <div key={pid} className="cart-line" style={{
                  background: '#fff',
                  borderRadius: 20,
                  outline: '1px solid #8B5CF6',
                  boxShadow: '0px 4px 27.3px 0px rgba(0,0,0,0.05)',
                  padding: '20px 24px',
                  marginBottom: 12,
                  opacity: 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 320px', minWidth: 260 }}>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 500, color: '#161616' }}>
                        {it.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it, pid, qty, isSaved)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#DC2626',
                          cursor: 'pointer',
                          fontFamily: 'Inter,sans-serif',
                          fontSize: 13,
                          padding: '6px 8px',
                          borderRadius: 8,
                        }}
                        title="Remove"
                      >
                        Remove
                      </button>
                    </div>

                    <span className="cart-line-typePill" style={{
                      fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 400, color: '#101129',
                      background: '#E7E1FF', borderRadius: 122, padding: '4px 14px',
                      outline: '1px solid #E7E1FF', whiteSpace: 'nowrap',
                    }}>{it.type}</span>

                    {isSaved && (
                      <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: '#059669', background: '#E6F6F3', border: '1px solid #A7F3D0', borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                        Saved
                      </span>
                    )}
                  </div>

                  <>
                    <div style={{ height: 0, outline: '1px solid #E7E1FF', margin: '14px 0' }} />
                    <div className="cart-line-patientBox" style={{ background: '#fff', border: '0.4px solid #E7E1FF', borderRadius: 8, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                      <span className="cart-line-patientLabel" style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 400, color: '#828282', whiteSpace: 'nowrap' }}>No of Patients</span>
                      <div className="cart-line-stepper" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button
                          onClick={() => setSelection(prev => ({ ...prev, [pid]: Math.max(1, (prev[pid] ?? qty) - 1) }))}
                          disabled={qty <= 1}
                          title={qty <= 1 ? 'Minimum 1 patient' : undefined}
                          className="cart-line-stepperBtn cart-line-stepperBtn--minus"
                          style={{
                            width: 38, height: 38, borderRadius: '50%', border: 'none',
                            background: qty <= 1 ? '#E7E1FF' : 'linear-gradient(90deg, #101129 0%, #2A2C5B 100%)',
                            color: qty <= 1 ? '#828282' : '#fff', fontSize: 18,
                            cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>−</button>
                        <span className="cart-line-stepperValue" style={{ fontFamily: 'Poppins,sans-serif', fontSize: 18, fontWeight: 400, color: '#101129', minWidth: 12, textAlign: 'center' }}>{qty}</span>
                        <button
                          onClick={() => setSelection(prev => ({ ...prev, [pid]: Math.min(max, (prev[pid] ?? qty) + 1) }))}
                          disabled={plusDisabled}
                          title={plusDisabled ? `Max ${max} patients` : undefined}
                          className="cart-line-stepperBtn cart-line-stepperBtn--plus"
                          style={{
                            width: 38, height: 38, borderRadius: '50%', border: 'none',
                            background: plusDisabled ? '#E7E1FF' : 'linear-gradient(90deg, #101129 0%, #2A2C5B 100%)',
                            color: plusDisabled ? '#828282' : '#fff',
                            fontSize: 18, cursor: plusDisabled ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>+</button>
                      </div>
                    </div>
                    {max && (
                      <div className="cart-line-maxHint" style={{ marginTop: 10, fontSize: 12, color: '#828282', fontFamily: 'Inter,sans-serif' }}>
                        Max {max} patients
                      </div>
                    )}
                  </>
                </div>
              )
            })
          )}
        </div>

        {/* Order Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380 }}>
          <OrderSummaryCard
            itemCount={patientCount}
            subtotal={total}
            savings={0}
            total={total}
            continueDisabled={selectedItems.length === 0}
            continueLabel={'Continue'}
            onContinue={handleContinue}
            collectionLabel={labels.collection}
          />
        </div>

      </div>
    </div>
  )
}

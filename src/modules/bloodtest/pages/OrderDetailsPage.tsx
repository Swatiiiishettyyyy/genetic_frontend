/**
 * First paint: GET /orders/{order_number} (query `order_number`, or nav state).
 * Per product: expand to load vendor order-details (internal ids never shown in UI).
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Navbar } from '../components'
import { useAuth } from '../../../shared/auth/AuthContext'
import {
  fetchOrderByOrderNumber,
  fetchOrders,
  getEarliestScheduledDate,
  fetchThyrocareOrderDetails,
  fetchThyrocareReport,
  downloadPatientReport,
  pickReportDownloadUrl,
  getMyReportRowKey,
  getOrderOidSegmentForReportKey,
  thyrocareIdsForOrderItem,
  thyrocareHistoryEventTimestamp,
  thyrocareApiStatusDisplayLabel,
  rescheduleOrder,
  cancelOrderWithRefund,
} from '../api/orders'
import { API_BASE_URL } from '../../../shared/api/client'
import type { Order, ThyrocareOrderDetails, OrderMemberAddressRow, MyReportRow, ReportLinkContext } from '../api/orders'
import { searchSlots } from '../api/slots'
import type { SlotTime } from '../api/slots'
import { stashReportNavigation, newReportNavigationKey } from '../reportNavSession'
import backArrow from '../assets/figma/order-details/arrow.svg'
import orderCubeIcon from '../assets/figma/order-details/Frame-3.svg'
import emailIcon from '../assets/figma/order-details/Frame 29427.svg'
import phoneIcon from '../assets/figma/order-details/call.svg'
import tickIcon from '../assets/figma/order-details/icon.svg'
import fileIcon from '../assets/figma/order-details/file.svg'

/** Same fields the reports list uses for {@link getMyReportRowKey} / {@link getOrderOidSegmentForReportKey}. */
function buildReportSeedFromOrder(order: Order, labPatientId: string, memberId: number, productName?: string): MyReportRow {
  const row: MyReportRow = {
    member_id: memberId,
    patient_id: String(labPatientId).trim(),
  }
  if (order.order_id != null && String(order.order_id).trim() !== '') {
    const oid = Number(order.order_id)
    if (!Number.isNaN(oid)) {
      row.our_order_id = oid
      row.order_id = oid
    }
  }
  const on = order.order_number?.trim()
  if (on) row.order_number = on
  if (productName?.trim()) row.product_name = productName.trim()
  return row
}

/**
 * Some `my-reports` rows only expose `order_number` (display label skips numeric `our_order_id`).
 * When we have both, try this shape as an extra list key.
 */
function buildReportSeedOrderNumberOnly(order: Order, labPatientId: string, memberId: number): MyReportRow | null {
  const on = order.order_number?.trim()
  if (!on) return null
  return {
    member_id: memberId,
    patient_id: String(labPatientId).trim(),
    order_number: on,
  } as MyReportRow
}

const NAV_LINKS = [
  { label: 'Tests', href: '/' },
  { label: 'Packages', href: '/' },
  { label: 'Reports', href: '#' },
  { label: 'Metrics', href: '/metrics' },
  { label: 'Orders', href: '/orders' },
]

const CARD: React.CSSProperties = {
  background: '#fff',
  boxShadow: '0px 4px 27.3px rgba(0,0,0,0.05)',
  borderRadius: 'clamp(14px, 1.6vmin, 16px)',
  outline: '1px solid #E7E1FF',
  outlineOffset: -1,
  padding: 'clamp(16px, 2.4vmin, 20px) clamp(16px, 2.8vmin, 24px)',
  boxSizing: 'border-box',
  width: '100%',
}
const LABEL: React.CSSProperties = { fontSize: 'var(--type-body)', color: '#828282', fontWeight: 400, lineHeight: 'var(--lh-body)' }
const VALUE: React.CSSProperties = { fontSize: 'var(--type-ui)', color: '#161616', fontWeight: 500, lineHeight: 'var(--lh-ui)' }
const SECTION_TITLE: React.CSSProperties = { fontSize: 'var(--type-ui)', fontWeight: 500, color: '#161616', marginBottom: 'clamp(8px, 1.2vmin, 10px)' }

function statusLabel(s: string | null | undefined) {
  const raw = String(s ?? '').trim()
  if (!raw) return '—'
  const u = raw.toUpperCase()
  if (u === 'CONFIRMED') return 'Confirmed'
  if (u === 'COMPLETED') return 'Completed'
  if (u === 'CANCELLED') return 'Cancelled'
  return raw
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b[a-z]/g, (m) => m.toUpperCase())
}

function formatDateTime(d: string | null | undefined) {
  if (!d) return '—'
  const raw = String(d).trim()
  // Thyrocare sends status timestamps as dd-mm-yyyy; Date.parse treats those as mm-dd-yyyy.
  const thyrocareDate = raw.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?/i,
  )
  if (thyrocareDate) {
    const [, dd, mm, yyyy, hh = '0', min = '0', sec = '0', meridiem] = thyrocareDate
    let hour = Number(hh)
    if (meridiem) {
      const period = meridiem.toUpperCase()
      if (period === 'PM' && hour < 12) hour += 12
      if (period === 'AM' && hour === 12) hour = 0
    }
    const dt = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      hour,
      Number(min),
      Number(sec),
    )
    if (!Number.isNaN(dt.getTime())) {
      return dt.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  }
  const normalized = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(raw)
    ? raw.replace(/\s+/, 'T')
    : raw
  const dt = new Date(normalized)
  if (Number.isNaN(dt.getTime())) return raw
  return dt.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDateTimeStacked(d: string | null | undefined) {
  const text = formatDateTime(d)
  const parts = text.match(/^(.+?),\s*(\d{1,2}:\d{2}.*)$/)
  return parts ? `${parts[1]}\n${parts[2]}` : text
}

function formatDateOnly(d: string | null | undefined) {
  if (!d) return ''
  const raw = String(d).trim()
  const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const dt = isoDate
    ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
    : new Date(raw)
  if (Number.isNaN(dt.getTime())) return raw
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatAppointmentSlot(dateValue: string | null | undefined, timeValue: string | null | undefined) {
  const dateText = formatDateOnly(dateValue)
  const timeText = String(timeValue ?? '').trim()
  if (dateText && timeText) return `${dateText}\n${timeText}`
  return dateText || timeText
}

function toDateInputValue(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatMemberGender(g: string | undefined) {
  const t = g?.trim()
  return t || '—'
}

function phoneDigits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '').trim()
}

function formatPhoneForDisplay(value: unknown): string {
  const digits = phoneDigits(value)
  if (!digits) return ''
  const local = digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits
  if (local.length === 10) return `+91 ${local.slice(0, 5)} ${local.slice(5)}`
  return String(value ?? '').trim() || digits
}

function formatOrderAddress(addr: OrderMemberAddressRow['address']) {
  const statePostal = [addr.state, addr.postal_code].filter(Boolean).join(' ')
  const parts = [
    addr.street_address,
    addr.landmark,
    addr.locality,
    addr.city,
    statePostal,
  ].map(part => part?.trim()).filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

const VISIT_STEP_LABELS = [
  'Order booked',
  'Sample collected',
  'Processing',
  'Report ready',
] as const

function truthyReportFlag(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (value == null) return false
  return ['1', 'true', 'yes', 'y'].includes(String(value).trim().toLowerCase())
}

function patientEventOrderStatus(row: unknown): string {
  if (row == null || typeof row !== 'object') return ''
  const r = row as Record<string, unknown>
  return String(r.orderStatus ?? r.order_status ?? r.status ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_')
}

function normalizeStatusToken(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/^PAYMENTSTATUS\./, '')
    .replace(/^ORDERSTATUS\./, '')
    .replace(/[\s-]+/g, '_')
}

function patientEventStatusLabel(row: unknown): string {
  if (row == null || typeof row !== 'object') return ''
  const r = row as Record<string, unknown>
  const status = r.orderStatus ?? r.order_status ?? r.status
  return thyrocareApiStatusDisplayLabel(null, status != null ? String(status) : null, '')
}

function patientEventReportAvailable(row: unknown): boolean {
  if (row == null || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return truthyReportFlag(r.isReportAvailable ?? r.is_report_available)
}

function numericId(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function patientMemberId(patient: unknown): number | null {
  if (patient == null || typeof patient !== 'object') return null
  const p = patient as Record<string, unknown>
  return numericId(p.member_id ?? p.memberId)
}

function patientIdValue(patient: unknown): string {
  if (patient == null || typeof patient !== 'object') return ''
  const p = patient as Record<string, unknown>
  return String(p.patient_id ?? p.patientId ?? p.id ?? p.lead_id ?? '').trim()
}

function patientEventMatchesMember(row: unknown, memberId: number): boolean {
  if (row == null || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return numericId(r.member_id ?? r.memberId) === memberId
}

function patientEventHasMember(row: unknown): boolean {
  if (row == null || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return numericId(r.member_id ?? r.memberId) != null
}

function normalizePersonName(value: unknown): string {
  return String(value ?? '').trim().toUpperCase().replace(/\s+/g, ' ')
}

function patientEventMatchesName(row: unknown, name: string | undefined): boolean {
  const wanted = normalizePersonName(name)
  if (!wanted || row == null || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return normalizePersonName(r.patient_name ?? r.name) === wanted
}

function patientEventMatchesPatient(row: unknown, patientId: string): boolean {
  if (!patientId) return true
  if (row == null || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  const rowPatientId = String(r.patient_id ?? r.patientId ?? r.id ?? r.lead_id ?? '').trim()
  return rowPatientId === patientId
}

function patientReportAvailable(patient: unknown, memberId?: number): boolean {
  if (patient == null || typeof patient !== 'object') return false
  if (memberId != null && patientMemberId(patient) !== memberId) return false
  const p = patient as Record<string, unknown>
  if (truthyReportFlag(p.isReportAvailable ?? p.is_report_available)) return true
  const history = patientHistory(patient, memberId)
  return history.some(patientEventReportAvailable)
}

function patientHistory(patient: unknown, memberId?: number): any[] {
  if (patient == null || typeof patient !== 'object') return []
  const p = patient as Record<string, unknown>
  const history = Array.isArray(p.status_history) ? p.status_history : []
  if (memberId == null) return history
  const pid = patientIdValue(patient)
  return history.filter(row =>
    patientEventMatchesMember(row, memberId) && patientEventMatchesPatient(row, pid),
  )
}

function detailStatusHistoryForMember(
  details: ThyrocareOrderDetails | undefined,
  memberId?: number,
  memberName?: string,
): any[] {
  const history = Array.isArray((details as any)?.status_history)
    ? ((details as any).status_history as any[])
    : []
  if (history.length === 0) return []

  if (memberId != null) {
    const byMember = history.filter(row => patientEventMatchesMember(row, memberId))
    if (byMember.length) return byMember
  }

  const byName = history.filter(row => patientEventMatchesName(row, memberName))
  if (byName.length) return byName

  const hasMemberScopedRows = history.some(patientEventHasMember)
  if (!hasMemberScopedRows || history.length === 1) return history
  return []
}

function clientOnlyFallbackStage(input: {
  statusRaw: string | null | undefined
  scheduledDate?: string | null | undefined
}): number {
  const s = String(input.statusRaw ?? '').trim().toUpperCase()
  if (s === 'COMPLETED') return 4
  if (s === 'CANCELLED') return 0
  // Without vendor (Thyrocare) tracking, avoid showing intermediary milestones.
  return 0
}

/** When Thyrocare ids are missing, still show a reasonable timeline. */
function clientOnlyVisitSteps(
  order: Order,
  opts: { statusRaw: string | null | undefined; scheduledDate?: string | null | undefined },
): Array<{ label: string; time: string; done: boolean }> {
  const stage = clientOnlyFallbackStage(opts)
  return VISIT_STEP_LABELS.map((label, i) => ({
    label,
    time:
      i === 0
        ? formatDateTime(order.order_date || order.created_at)
        : '',
    done: i <= stage,
  }))
}

function buildPatientVisitSteps(
  order: Order,
  patient: unknown,
  opts?: {
    memberId?: number
    memberName?: string
    details?: ThyrocareOrderDetails
  },
): Array<{ label: string; time: string; done: boolean }> {
  const memberId = opts?.memberId
  if (memberId != null && patientMemberId(patient) !== memberId) {
    const detailHistory = detailStatusHistoryForMember(opts?.details, memberId, opts?.memberName)
    if (detailHistory.length === 0) {
      return clientOnlyVisitSteps(order, { statusRaw: null })
    }
  }

  const patientHist = patientHistory(patient, memberId)
  const hist = patientHist.length
    ? patientHist
    : detailStatusHistoryForMember(opts?.details, memberId, opts?.memberName)
  let maxStage = 0
  const timestampByMilestone: Record<number, string> = {}

  for (const row of hist) {
    const status = patientEventOrderStatus(row)
    const label = patientEventStatusLabel(row)
    const ts = row != null && typeof row === 'object'
      ? thyrocareHistoryEventTimestamp(row as Record<string, unknown>)
      : null

    if (label === 'Sample collected') {
      maxStage = Math.max(maxStage, 1)
      if (ts) timestampByMilestone[1] = ts
    }
    if (label === 'Sample received by lab' || label === 'Processing') {
      maxStage = Math.max(maxStage, 2)
      if (ts) timestampByMilestone[2] = ts
    }
    if (label === 'Report ready' || status === 'COMPLETED' || patientEventReportAvailable(row)) {
      maxStage = Math.max(maxStage, 3)
      if (ts) timestampByMilestone[3] = ts
    }
  }

  if (patientReportAvailable(patient, memberId)) {
    maxStage = Math.max(maxStage, 3)
  }

  return VISIT_STEP_LABELS.map((label, i) => ({
    label,
    time: i === 0
      ? formatDateTime(order.order_date || order.created_at)
      : timestampByMilestone[i] ? formatDateTime(timestampByMilestone[i]) : '',
    done: i <= maxStage,
  }))
}

function effectiveRowThyrocareId(row: OrderMemberAddressRow, itemStripIds: string[]): string | null {
  const r = row.thyrocare_order_id?.trim()
  if (r) return r
  if (itemStripIds.length === 1) return itemStripIds[0]!
  return null
}

export default function OrderDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, members: authMembers } = useAuth()
  const state = (location.state as { order?: Order; orderNumber?: string } | null) ?? null

  const orderNumberKey = useMemo(() => {
    const q =
      searchParams.get('order_number')?.trim()
      || searchParams.get('orderNumber')?.trim()
      || ''
    const fromState =
      (typeof state?.orderNumber === 'string' ? state.orderNumber.trim() : '')
      || (state?.order?.order_number ? String(state.order.order_number).trim() : '')
    return q || fromState
  }, [searchParams, state?.orderNumber, state?.order?.order_number])

  const [order, setOrder] = useState<Order | null>(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  const [thyrocareById, setThyrocareById] = useState<Record<string, ThyrocareOrderDetails>>({})
  const [thyrocareLoading, setThyrocareLoading] = useState<Record<string, boolean>>({})
  const [thyrocareErr, setThyrocareErr] = useState<Record<string, string | undefined>>({})
  const [reportLoading, setReportLoading] = useState<Record<string, boolean>>({})
  const [expandedMemberRows, setExpandedMemberRows] = useState<Record<string, boolean>>({})
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleSlots, setRescheduleSlots] = useState<SlotTime[]>([])
  const [rescheduleSlotIdx, setRescheduleSlotIdx] = useState<number | null>(null)
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [rescheduleLoadingSlots, setRescheduleLoadingSlots] = useState(false)
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null)
  const [rescheduleCompleted, setRescheduleCompleted] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelSubmitting, setCancelSubmitting] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null)

  useEffect(() => {
    setThyrocareById({})
    setThyrocareLoading({})
    setThyrocareErr({})
    setExpandedMemberRows({})
    setRescheduleOpen(false)
    setRescheduleDate('')
    setRescheduleSlots([])
    setRescheduleSlotIdx(null)
    setRescheduleReason('')
    setRescheduleError(null)
    setRescheduleSuccess(null)
    setRescheduleCompleted(false)
    setCancelOpen(false)
    setCancelReason('')
    setCancelError(null)
    setCancelSuccess(null)
  }, [orderNumberKey])

  useEffect(() => {
    if (!orderNumberKey) {
      setOrder(null)
      setOrderError(null)
      setOrderLoading(false)
      return
    }
    let cancelled = false
    setOrderLoading(true)
    setOrderError(null)

    const loadListFallback = () =>
      fetchOrders()
        .then(list => {
          if (cancelled) return
          const found = list.find(o => String(o.order_number ?? '').trim() === orderNumberKey)
          if (found) {
            setOrder(found)
            setOrderError(null)
          } else {
            setOrder(null)
            setOrderError('Order not found.')
          }
        })
        .catch(() => {
          if (!cancelled) {
            setOrder(null)
            setOrderError('Order not found.')
          }
        })
        .finally(() => {
          if (!cancelled) setOrderLoading(false)
        })

    fetchOrderByOrderNumber(orderNumberKey)
      .then(o => {
        if (!cancelled) {
          setOrder(o)
          setOrderLoading(false)
        }
      })
      .catch(() => {
        if (cancelled) {
          setOrderLoading(false)
          return
        }
        loadListFallback()
      })

    return () => { cancelled = true }
  }, [orderNumberKey])

  useEffect(() => {
    if (!rescheduleSuccess) return
    const timer = window.setTimeout(() => {
      setRescheduleSuccess(null)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [rescheduleSuccess])

  useEffect(() => {
    if (!cancelSuccess) return
    const timer = window.setTimeout(() => {
      setCancelSuccess(null)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [cancelSuccess])

  useEffect(() => {
    if (!cancelSuccess) return
    const timer = window.setTimeout(() => {
      setCancelSuccess(null)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [cancelSuccess])

  /** Detail GET sometimes omits internal `order_id`; list rows have it and report URL keys need it. */
  useEffect(() => {
    if (!order?.order_number?.trim() || order.order_id != null) return
    let cancelled = false
    fetchOrders()
      .then(list => {
        if (cancelled) return
        const found = list.find(o => String(o.order_number ?? '').trim() === String(order.order_number).trim())
        const oid = found?.order_id
        if (found && oid != null && String(oid).trim() !== '') {
          setOrder(prev =>
            prev && String(prev.order_number).trim() === String(order.order_number).trim()
              ? { ...prev, order_id: oid }
              : prev,
          )
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [order?.order_number, order?.order_id])

  const authMemberPhoneById = useMemo(() => {
    const map = new Map<number, string>()
    for (const member of authMembers) {
      const id = Number(member.member_id ?? member.id)
      const mobile = String(member.mobile ?? '').trim()
      if (Number.isFinite(id) && phoneDigits(mobile)) map.set(id, mobile)
    }
    return map
  }, [authMembers])

  const loggedInUserPhone = String(user?.mobileNumber ?? '').trim()

  const resolveMemberPhone = useCallback((member: OrderMemberAddressRow['member']): string => {
    const ownPhone = String(member.mobile ?? '').trim()
    if (phoneDigits(ownPhone)) return formatPhoneForDisplay(ownPhone)

    const profilePhone = authMemberPhoneById.get(Number(member.member_id)) ?? ''
    if (phoneDigits(profilePhone)) return formatPhoneForDisplay(profilePhone)

    return formatPhoneForDisplay(loggedInUserPhone)
  }, [authMemberPhoneById, loggedInUserPhone])

  const ensureThyrocareLoaded = useCallback(async (tcId: string) => {
    const id = tcId.trim()
    if (!id || thyrocareById[id] || thyrocareLoading[id]) return
    setThyrocareLoading(prev => ({ ...prev, [id]: true }))
    setThyrocareErr(prev => ({ ...prev, [id]: undefined }))
    try {
      const d = await fetchThyrocareOrderDetails(id)
      setThyrocareById(prev => ({ ...prev, [id]: d }))
    } catch {
      setThyrocareErr(prev => ({ ...prev, [id]: 'Could not load timeline. Try again.' }))
    } finally {
      setThyrocareLoading(prev => ({ ...prev, [id]: false }))
    }
  }, [thyrocareById, thyrocareLoading])

  const openRescheduleModal = useCallback(() => {
    if (rescheduleCompleted || order?.is_rescheduled) return
    const initial = rescheduleDate || toDateInputValue(new Date())
    setRescheduleOpen(true)
    setRescheduleDate(initial)
    setRescheduleSlots([])
    setRescheduleSlotIdx(null)
    setRescheduleReason('')
    setRescheduleError(null)
    if (orderNumberKey) {
      setRescheduleLoadingSlots(true)
      searchSlots('', initial, initial, { order_number: orderNumberKey })
        .then(days => {
          setRescheduleSlots(days[0]?.slots ?? [])
          if (!(days[0]?.slots ?? []).length) {
            setRescheduleError('No slots available for this date. Try another date.')
          }
        })
        .catch((e: any) => {
          const msg =
            (typeof e?.data?.detail === 'string' && e.data.detail) ||
            (typeof e?.message === 'string' && e.message) ||
            'Could not load slots for this date.'
          setRescheduleError(msg)
          setRescheduleSlots([])
        })
        .finally(() => setRescheduleLoadingSlots(false))
    }
  }, [order?.is_rescheduled, orderNumberKey, rescheduleDate, rescheduleCompleted])

  async function handleRescheduleDateChange(nextDate: string) {
    setRescheduleDate(nextDate)
    setRescheduleSlots([])
    setRescheduleSlotIdx(null)
    setRescheduleError(null)
    if (!nextDate || !orderNumberKey) return
    setRescheduleLoadingSlots(true)
    try {
      const days = await searchSlots('', nextDate, nextDate, { order_number: orderNumberKey })
      const slots = days[0]?.slots ?? []
      setRescheduleSlots(slots)
      if (!slots.length) setRescheduleError('No slots available for this date. Try another date.')
    } catch (e: any) {
      const msg =
        (typeof e?.data?.detail === 'string' && e.data.detail) ||
        (typeof e?.message === 'string' && e.message) ||
        'Could not load slots for this date.'
      setRescheduleError(msg)
    } finally {
      setRescheduleLoadingSlots(false)
    }
  }

  async function handleRescheduleSubmit() {
    if (!order?.order_number) return
    const slot = rescheduleSlotIdx != null ? rescheduleSlots[rescheduleSlotIdx] : null
    const reason = rescheduleReason.trim()
    if (!rescheduleDate) {
      setRescheduleError('Select a new appointment date.')
      return
    }
    if (!slot) {
      setRescheduleError('Select a new hourly time slot.')
      return
    }
    if (!reason) {
      setRescheduleError('Add a reason for rescheduling.')
      return
    }
    setRescheduleSubmitting(true)
    setRescheduleError(null)
    setRescheduleSuccess(null)
    try {
      const response = await rescheduleOrder(order.order_number, {
        appointment_date: rescheduleDate,
        appointment_start_time: slot.start_time,
        appointment_time_hourly: slot.label,
        internal_mapped_time_slot: slot.internal_mapped_time_slot || slot.label,
        reason,
      })
      const fresh = await fetchOrderByOrderNumber(order.order_number)
      setOrder(fresh)
      setRescheduleSuccess(response.message || 'Appointment rescheduled successfully.')
      setRescheduleCompleted(true)
      setRescheduleOpen(false)
    } catch (e: any) {
      const msg =
        (typeof e?.data?.detail === 'string' && e.data.detail) ||
        (typeof e?.response?.data?.detail === 'string' && e.response.data.detail) ||
        (typeof e?.message === 'string' && e.message) ||
        'Could not reschedule this order. Please try again.'
      setRescheduleError(msg)
    } finally {
      setRescheduleSubmitting(false)
    }
  }

  const openCancelModal = useCallback(() => {
    if (order?.is_cancelled) return
    setCancelOpen(true)
    setCancelReason('')
    setCancelError(null)
    setCancelSuccess(null)
  }, [order?.is_cancelled])

  async function handleCancelSubmit() {
    if (!order?.order_number || !order.order_id) return
    const reason = cancelReason.trim()
    setCancelSubmitting(true)
    setCancelError(null)
    setCancelSuccess(null)
    try {
      const response = await cancelOrderWithRefund({ order_id: order.order_id, reason })
      const fresh = await fetchOrderByOrderNumber(order.order_number)
      setOrder(fresh)
      setCancelSuccess(response.message || 'Order cancelled. Refund will be processed in 5-7 business days.')
      setCancelOpen(false)
    } catch (e: any) {
      const msg =
        (typeof e?.data?.detail === 'string' && e.data.detail) ||
        (typeof e?.response?.data?.detail === 'string' && e.response.data.detail) ||
        (typeof e?.message === 'string' && e.message) ||
        'Could not cancel this order. Please try again.'
      setCancelError(msg)
    } finally {
      setCancelSubmitting(false)
    }
  }

  /** Per-member timelines and billing summary should have live vendor details without manual expansion. */
  useEffect(() => {
    if (!order?.items?.length) return
    const ids: string[] = []
    for (const it of order.items) {
      for (const raw of thyrocareIdsForOrderItem(it)) {
        const id = String(raw ?? '').trim()
        if (id) ids.push(id)
      }
    }
    const uniqueIds = [...new Set(ids)]
    uniqueIds.forEach(id => { void ensureThyrocareLoaded(id) })
  }, [order?.order_number, order?.items, ensureThyrocareLoaded])

  function openReportUrlInNewTab(url: string) {
    const t = url.trim()
    const abs =
      t.startsWith('http://') || t.startsWith('https://')
        ? t
        : `${API_BASE_URL}${t.startsWith('/') ? '' : '/'}${t}`
    const win = window.open(abs, '_blank', 'noopener,noreferrer')
    if (!win) window.location.assign(abs)
  }

  async function handleViewReport(
    patientId: string,
    opts?: {
      thyrocareOrderId?: string
      leadId?: string
      memberId?: number
      alternatePatientIds?: string[]
    },
  ) {
    const labPid = String(patientId).trim()
    const memberId = opts?.memberId
    const extra = (opts?.alternatePatientIds ?? []).map(x => String(x ?? '').trim()).filter(Boolean)
    const patientIdVariants = [labPid, ...extra].filter((x, i, a) => x && a.indexOf(x) === i)

    if (memberId != null && order && labPid) {
      const tcId = opts?.thyrocareOrderId?.trim()
      const productName = tcId
        ? (order.items ?? []).find(it => thyrocareIdsForOrderItem(it).includes(tcId))?.product_name ?? ''
        : ''
      const primarySeed = buildReportSeedFromOrder(order, labPid, memberId, productName || undefined)
      const oidSeg = getOrderOidSegmentForReportKey(primarySeed)
      const reportLinkContext: ReportLinkContext = {
        memberId,
        patientIds: patientIdVariants,
        nucleotideOrderNumber: order.order_number,
        nucleotideOrderId: order.order_id,
        thyrocareOrderId: opts?.thyrocareOrderId?.trim(),
      }
      if (oidSeg) {
        const tryIds: string[] = []
        for (const pid of patientIdVariants) {
          tryIds.push(getMyReportRowKey(buildReportSeedFromOrder(order, pid, memberId), 0))
          const pub = buildReportSeedOrderNumberOnly(order, pid, memberId)
          if (pub && getOrderOidSegmentForReportKey(pub) !== oidSeg) {
            tryIds.push(getMyReportRowKey(pub, 0))
          }
        }
        const uniq = tryIds.filter((x, i, a) => x && a.indexOf(x) === i)
        if (uniq.length) {
          const lk = newReportNavigationKey()
          stashReportNavigation(lk, { report: primarySeed, reportTryIds: uniq, reportLinkContext })
          navigate(`/report?id=${encodeURIComponent(uniq[0]!)}&lk=${encodeURIComponent(lk)}`, {
            state: { report: primarySeed, reportTryIds: uniq, reportLinkContext },
          })
          return
        }
      }
      const lk = newReportNavigationKey()
      stashReportNavigation(lk, { report: primarySeed, reportTryIds: [], reportLinkContext })
      navigate(`/report?id=${encodeURIComponent('order-detail')}&lk=${encodeURIComponent(lk)}`, {
        state: { report: primarySeed, reportTryIds: [], reportLinkContext },
      })
      return
    }

    const key = String(patientId)
    setReportLoading(prev => ({ ...prev, [key]: true }))
    try {
      let url = pickReportDownloadUrl(await downloadPatientReport(key))
      if (!url && opts?.thyrocareOrderId && opts?.leadId) {
        url = pickReportDownloadUrl(
          await fetchThyrocareReport(opts.thyrocareOrderId, opts.leadId),
        )
      }
      if (url) openReportUrlInNewTab(url)
      else alert('Report not available yet.')
    } catch {
      if (opts?.thyrocareOrderId && opts?.leadId) {
        try {
          const url = pickReportDownloadUrl(
            await fetchThyrocareReport(opts.thyrocareOrderId, opts.leadId),
          )
          if (url) {
            openReportUrlInNewTab(url)
            return
          }
        } catch {
          /* fall through */
        }
      }
      alert('Could not fetch report. Please try again.')
    } finally {
      setReportLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  function resolvePatientIdForRow(
    entry: OrderMemberAddressRow,
    itemStripIds: string[],
  ): string | undefined {
    const patient = resolvePatientForRow(entry, itemStripIds)
    return patient?.id ?? patient?.lead_id ?? patient?.patient_id ?? patient?.patientId
  }

  function resolvePatientForRow(
    entry: OrderMemberAddressRow,
    itemStripIds: string[],
  ): any | undefined {
    const tcRow = effectiveRowThyrocareId(entry, itemStripIds)
    const details = tcRow ? thyrocareById[tcRow] : undefined
    const patients: any[] = Array.isArray((details as any)?.patients) ? (details as any).patients : []
    const memberId = numericId(entry.member?.member_id)
    if (memberId == null) return undefined
    return patients.find((p: any) => patientMemberId(p) === memberId)
  }

  if (!orderNumberKey) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Poppins, sans-serif' }}>
        <Navbar logoSrc="/favicon.svg" logoAlt="Nucleotide" links={NAV_LINKS} ctaLabel="My Cart" hideSearchOnMobile onCtaClick={() => navigate('/cart')} />
        <div style={{ padding: 40, textAlign: 'center', color: '#828282' }}>
          Missing order number. Open this page from Orders or add <code style={{ color: '#8B5CF6' }}>?order_number=…</code> to the URL.{' '}
          <button type="button" onClick={() => navigate('/orders')} style={{ color: '#8B5CF6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Back to Orders</button>
        </div>
      </div>
    )
  }

  if (orderLoading || (!order && !orderError)) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Poppins, sans-serif' }}>
        <Navbar logoSrc="/favicon.svg" logoAlt="Nucleotide" links={NAV_LINKS} ctaLabel="My Cart" hideSearchOnMobile onCtaClick={() => navigate('/cart')} />
        <div style={{ padding: 40, textAlign: 'center', color: '#828282' }}>Loading order…</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Poppins, sans-serif' }}>
        <Navbar logoSrc="/favicon.svg" logoAlt="Nucleotide" links={NAV_LINKS} ctaLabel="My Cart" hideSearchOnMobile onCtaClick={() => navigate('/cart')} />
        <div style={{ padding: 40, textAlign: 'center', color: '#828282' }}>
          {orderError ?? 'Order not found.'}{' '}
          <button type="button" onClick={() => navigate('/orders')} style={{ color: '#8B5CF6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Back to Orders</button>
        </div>
      </div>
    )
  }

  const heroEmail = String((order as any)?.email ?? (order as any)?.customer_email ?? '').trim()
  const showHeroContacts = !!heroEmail

  const primaryThyrocareId = (() => {
    const ids: string[] = []
    for (const it of order.items ?? []) {
      for (const raw of thyrocareIdsForOrderItem(it)) {
        const id = String(raw ?? '').trim()
        if (id) ids.push(id)
      }
    }
    return ids[0]
  })()
  const primaryThyrocareDetails = primaryThyrocareId ? thyrocareById[primaryThyrocareId] : undefined
  const trackingStatuses = (order.items ?? []).flatMap(it =>
    (it.member_address_map ?? [])
      .map(row => normalizeStatusToken(row.thyrocare_order_status))
      .filter(Boolean),
  )
  const thyrocareStillOrderPlaced = trackingStatuses.every(status => status === 'ORDER_PLACED')
  const terminalOrderStatus = [order.order_status, order.raw_order_status].some(status =>
    ['COMPLETED', 'CANCELLED'].includes(normalizeStatusToken(status)),
  )
  const paidOrder = normalizeStatusToken(order.payment_status) === 'COMPLETED'
  const refundStarted = ['PENDING', 'INITIATED', 'PROCESSED'].includes(
    normalizeStatusToken(order.refund_status),
  )
  const canReschedule = Boolean(
    primaryThyrocareId &&
    !terminalOrderStatus &&
    !order.all_members_report_ready &&
    order.thyrocare_allows_customer_changes !== false &&
    thyrocareStillOrderPlaced,
  )
  const rescheduleDisabled = rescheduleCompleted || order.is_rescheduled === true
  const showRescheduleAction = canReschedule && !rescheduleDisabled
  const cancelDisabled = order.is_cancelled === true
  const showCancelAction = canReschedule && order.order_id && paidOrder && !refundStarted
  const canCancel = Boolean(showCancelAction && !cancelDisabled)
  const vendorPayment = (primaryThyrocareDetails as any)?.payment as
    | {
        amount?: number
        currency?: string
        payment_status?: string
        payment_method?: string
        razorpay_payment_id?: string
        payment_date?: string
      }
    | undefined
  const appointmentDate = getEarliestScheduledDate(order)
  const appointmentSlot = formatAppointmentSlot(appointmentDate, order.appointment_time_hourly)

  const billingStripItems = [
    {
      label: 'Payment Mode',
      value:
        vendorPayment?.payment_method ??
        order.payment_method_details ??
        order.payment_method ??
        '—',
    },
    {
      label: 'Transaction Date',
      value: formatDateTimeStacked(vendorPayment?.payment_date ?? order.order_date ?? order.created_at),
    },
    ...(appointmentSlot ? [{ label: 'Appointment', value: appointmentSlot }] : []),
    { label: 'Security', value: 'AES-256 Encrypted' },
    {
      label: 'Invoice No',
      value:
        vendorPayment?.razorpay_payment_id?.trim()
          ? vendorPayment.razorpay_payment_id.trim()
          : order.order_number || '—',
    },
  ]

  return (
    <div className="order-detail-page" style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Poppins, sans-serif', overflowX: 'hidden' }}>
      <Navbar logoSrc="/favicon.svg" logoAlt="Nucleotide" links={NAV_LINKS} ctaLabel="My Cart" hideSearchOnMobile onCtaClick={() => navigate('/cart')} />

      <div className="order-detail-inner" style={{}}>
        <div className="order-detail-bg" aria-hidden="true">
          <div className="order-detail-blob order-detail-blob--green" />
          <div className="order-detail-blob order-detail-blob--purple" />
        </div>

        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="order-detail-backBtn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'clamp(10px, 1.2vmin, 16px)',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: '#161616',
            fontFamily: 'Inter, sans-serif',
            fontSize: 'var(--type-body)',
            lineHeight: 'var(--lh-body)',
          }}
        >
          <img src={backArrow} alt="" style={{ width: 'clamp(18px, 2.6vmin, 24px)', height: 'clamp(18px, 2.6vmin, 24px)', display: 'block' }} />
          Back to Orders
        </button>

        <div className="order-detail-stack" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 3vmin, 28px)', marginTop: 'clamp(14px, 2.2vmin, 20px)' }}>

          <div className="order-detail-hero" style={{
            background: 'linear-gradient(90deg, #101129 0%, #2A2C5B 100%)',
            borderRadius: 'clamp(14px, 1.8vmin, 16px)',
            padding: 'clamp(20px, 3vmin, 26px) clamp(16px, 3vmin, 24px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(14px, 2.2vmin, 16px)',
          }}>
            <div className="order-detail-heroTop" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 'clamp(46px, 5.8vmin, 56px)',
                height: 'clamp(46px, 5.8vmin, 56px)',
                borderRadius: 999,
                outline: '1px solid rgba(139,92,246,0.35)',
                outlineOffset: -1,
                background: 'rgba(16, 17, 41, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <img src={orderCubeIcon} alt="" style={{ width: 'clamp(18px, 2.6vmin, 24px)', height: 'clamp(18px, 2.6vmin, 24px)', display: 'block' }} />
              </div>
              <div className="order-detail-heroTopText" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="order-detail-heroTitleRow" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span className="order-detail-heroTitle" style={{ fontSize: 'var(--type-ui)', fontWeight: 500, color: '#fff', lineHeight: 'var(--lh-ui)' }}>
                    Order #{order.order_number}
                  </span>
                  <span className="order-detail-heroStatusPill" style={{ padding: 'clamp(2px, 0.35vmin, 3px) clamp(10px, 1.2vmin, 10px)', background: '#5D48AC', borderRadius: 32, fontSize: 'var(--type-body)', color: '#F9F9F9', lineHeight: 'var(--lh-body)' }}>
                    {statusLabel(order.order_status)}
                  </span>
                </div>
                <span className="order-detail-heroSub" style={{ fontSize: 'var(--type-body)', color: 'rgba(255,255,255,0.62)', lineHeight: 'var(--lh-body)' }}>
                  Payment: {order.payment_status ?? '—'} · Total ₹{order.total_amount}
                </span>
              </div>
            </div>
            {(showHeroContacts || showRescheduleAction || canCancel) && (
              <div className="order-detail-heroContacts" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.4vmin, 10px)', alignItems: 'flex-end' }}>
                {heroEmail && (
                  <div className="order-detail-heroContactRow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img className="order-detail-heroContactIcon" src={emailIcon} alt="" style={{ width: 'clamp(14px, 1.8vmin, 16px)', height: 'clamp(14px, 1.8vmin, 16px)', display: 'block' }} />
                    <span className="order-detail-heroContactText" style={{ fontSize: 'var(--type-body)', color: '#F9F9F9', lineHeight: 'var(--lh-body)' }}>{heroEmail}</span>
                  </div>
                )}
                {(showRescheduleAction || canCancel) && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {showRescheduleAction && (
                      <button
                        type="button"
                        onClick={openRescheduleModal}
                        style={{
                          border: '1px solid rgba(255,255,255,0.42)',
                          background: '#fff',
                          color: '#5D48AC',
                          borderRadius: 999,
                          padding: '9px 16px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Reschedule
                      </button>
                    )}
                    {canCancel && (
                      <button
                        type="button"
                        onClick={openCancelModal}
                        style={{
                          border: '1px solid rgba(255,255,255,0.42)',
                          background: '#fff',
                          color: '#B91C1C',
                          borderRadius: 999,
                          padding: '9px 16px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          opacity: 1,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {rescheduleSuccess && (
            <div
              role="status"
              style={{
                border: '1px solid #BBF7D0',
                background: '#F0FDF4',
                color: '#166534',
                borderRadius: 12,
                padding: '12px 14px',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                lineHeight: 1.45,
              }}
            >
              {rescheduleSuccess}
            </div>
          )}

          {cancelSuccess && (
            <div
              role="status"
              style={{
                border: '1px solid #BBF7D0',
                background: '#F0FDF4',
                color: '#166534',
                borderRadius: 12,
                padding: '12px 14px',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                lineHeight: 1.45,
              }}
            >
              {cancelSuccess}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={SECTION_TITLE}>Your tests</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {order.items.map((it, itemIdx) => {
                const stripIds = thyrocareIdsForOrderItem(it)
                const canTrack = stripIds.length > 0
                return (
                  <div key={`${it.thyrocare_product_id || it.group_id}-${itemIdx}`} style={{ ...CARD, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      <span style={{ ...VALUE, fontSize: 'clamp(15px, 1.2vw, 17px)', flex: '1 1 200px' }}>
                        {it.product_name}
                      </span>
                    </div>

                    <div style={{ height: 1, background: '#F3F4F6' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <span style={{ ...LABEL, color: '#161616', fontWeight: 500, fontSize: 13 }}>Members &amp; addresses</span>
                      {it.member_address_map.map((entry, ri) => {
                        const m = entry.member
                        const addr = entry.address
                        const memberRowKey = `${itemIdx}:${entry.order_item_id ?? ri}:${m.member_id ?? ri}`
                        const isMemberExpanded = !!expandedMemberRows[memberRowKey]
                        const memberPhone = resolveMemberPhone(m)
                        const tcIdForRow = canTrack ? effectiveRowThyrocareId(entry, stripIds) : null
                        const dForStatus = tcIdForRow ? thyrocareById[tcIdForRow] : undefined
                        const patientForRow = resolvePatientForRow(entry, stripIds)
                        const patientId = resolvePatientIdForRow(entry, stripIds)
                        const rowMemberId = numericId(entry.member.member_id)
                        const visitStepsForRow = tcIdForRow
                          ? buildPatientVisitSteps(order, patientForRow, {
                              memberId: rowMemberId ?? undefined,
                              memberName: m.name,
                              details: dForStatus,
                            })
                          : clientOnlyVisitSteps(order, {
                              statusRaw: entry.order_status,
                              scheduledDate: entry.scheduled_date,
                            })
                        const hasVendorSignal = !!(patientForRow || dForStatus)
                        const rowLoading = tcIdForRow ? !!thyrocareLoading[tcIdForRow] : false
                        const rowTimelineError = tcIdForRow && !hasVendorSignal && !rowLoading
                          ? thyrocareErr[tcIdForRow]
                          : undefined
                        const isReportAvailable = patientReportAvailable(patientForRow, rowMemberId ?? undefined)
                        const alternatePatientIds = patientForRow
                          ? [...new Set(
                              [patientForRow.id, patientForRow.lead_id, patientForRow.patient_id, patientForRow.patientId]
                                .filter(v => v != null && String(v).trim())
                                .map(v => String(v).trim()),
                            )].filter(x => x !== String(patientId))
                          : undefined
                        return (
                          <div
                            key={entry.order_item_id ?? ri}
                            style={{
                              border: '1px solid #F3F4F6',
                              borderRadius: 10,
                              padding: 12,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 8,
                            }}
                          >
                            <button
                              type="button"
                              aria-expanded={isMemberExpanded}
                              onClick={() => setExpandedMemberRows(prev => ({
                                ...prev,
                                [memberRowKey]: !prev[memberRowKey],
                              }))}
                              style={{
                                appearance: 'none',
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                margin: 0,
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: 8,
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif',
                              }}
                            >
                              <div>
                                <div style={VALUE}>{m.name}</div>
                                <div className="order-detail-memberMeta" style={LABEL}>{m.relation} · {m.age} yrs · {formatMemberGender(m.gender)}</div>
                              </div>
                              <span
                                aria-hidden="true"
                                style={{
                                  color: '#8B5CF6',
                                  fontSize: 18,
                                  lineHeight: 1,
                                  paddingTop: 4,
                                  flexShrink: 0,
                                }}
                              >
                                {isMemberExpanded ? '−' : '+'}
                              </span>
                            </button>
                            {isMemberExpanded && (
                              <>
                                {memberPhone && (
                                  <div
                                    className="order-detail-memberInfoRow order-detail-memberPhone"
                                    style={{
                                      ...LABEL,
                                      marginTop: 4,
                                      fontSize: 'clamp(11px, 0.95vw, 13px)',
                                      lineHeight: 1.45,
                                    }}
                                  >
                                    <span className="order-detail-memberInfoIcon" aria-hidden="true">
                                      <img src={phoneIcon} alt="" style={{ width: 14, height: 14, display: 'block' }} />
                                    </span>
                                    <span>{memberPhone}</span>
                                  </div>
                                )}
                                <div
                                  className="order-detail-memberInfoRow order-detail-addressLine"
                                  style={{
                                    ...LABEL,
                                    fontSize: 'clamp(11px, 0.95vw, 13px)',
                                    lineHeight: 1.45,
                                  }}
                                >
                                  <span className="order-detail-memberInfoIcon" aria-hidden="true">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                      <path d="M2 10.8 12 3l10 7.8V21a1 1 0 0 1-1 1h-6.2v-6.7H9.2V22H3a1 1 0 0 1-1-1V10.8Z" fill="#8B5CF6" />
                                    </svg>
                                  </span>
                                  <span>{formatOrderAddress(addr)}</span>
                                </div>
                                <div className="order-detail-memberTracking">
                                  {rowLoading && !hasVendorSignal && (
                                    <div style={{ ...LABEL, fontSize: 12, marginBottom: 8 }}>Loading timeline…</div>
                                  )}
                                  {rowTimelineError && (
                                    <div style={{ color: '#B91C1C', fontSize: 12, marginBottom: 8 }}>{rowTimelineError}</div>
                                  )}
                                  <div className="order-detail-trackList order-detail-memberTrackList">
                                    <div className="order-detail-trackLine" aria-hidden="true" />
                                    {visitStepsForRow.map((step, i) => (
                                      <div
                                        key={`${entry.order_item_id ?? ri}-member-s-${i}`}
                                        className={`order-detail-trackRow${step.time ? ' order-detail-trackRow--withTime' : ''}`}
                                      >
                                        <div className="order-detail-trackMarker" data-done={step.done ? 'true' : 'false'} aria-hidden="true">
                                          {step.done && <img src={tickIcon} alt="" className="order-detail-trackTick" />}
                                        </div>
                                        <div className="order-detail-trackText">
                                          <div className="order-detail-trackLabel">{step.label}</div>
                                          {step.time && <div className="order-detail-trackTime">{step.time}</div>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  {patientId && isReportAvailable && (
                                    <button
                                      className="order-detail-patientViewReportBtn"
                                      type="button"
                                      onClick={() =>
                                        handleViewReport(patientId, {
                                          thyrocareOrderId: tcIdForRow ?? undefined,
                                          leadId: patientId,
                                          memberId: entry.member.member_id,
                                          alternatePatientIds,
                                        })}
                                      disabled={!!reportLoading[patientId]}
                                    >
                                      {reportLoading[patientId] ? 'Loading…' : (
                                        <>
                                          <img className="order-detail-patientViewReportIcon" src={fileIcon} alt="" aria-hidden="true" />
                                          View report
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={SECTION_TITLE}>Billing &amp; Payment Summary</span>
            <div className="order-detail-billingCard" style={CARD}>
              <div className="order-detail-billingStrip">
                <div className="order-detail-billingStripInner">
                  {billingStripItems.map(meta => (
                    <div
                      key={meta.label}
                      className={`order-detail-billingMeta${['Appointment', 'Transaction Date'].includes(meta.label) ? ' order-detail-billingMeta--stacked' : ''}${meta.label === 'Appointment' ? ' order-detail-billingMeta--appointment' : ''}`}
                    >
                      <div className="order-detail-billingMetaLabel">{meta.label}</div>
                      <div className="order-detail-billingMetaValue">{meta.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-detail-billingBody">
                <div className="order-detail-billingItems">
                  {order.items.map((line, i) => (
                    <div key={i} className="order-detail-billingItemRow">
                      <div className="order-detail-billingItemName">
                        {line.product_name} x {line.member_ids.length}
                      </div>
                      <div className="order-detail-billingItemAmount">₹{line.total_amount}</div>
                    </div>
                  ))}
                </div>

                <div className="order-detail-billingDivider" aria-hidden="true" />

                <div className="order-detail-billingRow">
                  <div className="order-detail-billingRowLabel">
                    Subtotal({order.items.length} item{order.items.length !== 1 ? 's' : ''})
                  </div>
                  <div className="order-detail-billingRowValue">₹{order.subtotal}</div>
                </div>

                <div className="order-detail-billingRow">
                  <div className="order-detail-billingRowLabel">You Save</div>
                  <div className="order-detail-billingRowValue order-detail-billingRowValue--positive">
                    -₹{order.discount}
                  </div>
                </div>

                <div className="order-detail-billingRow">
                  <div className="order-detail-billingRowLabel">Home Collection</div>
                  <div className="order-detail-billingRowValue order-detail-billingRowValue--positive">FREE</div>
                </div>

                <div className="order-detail-billingDivider" aria-hidden="true" />

                <div className="order-detail-billingTotalRow">
                  <div className="order-detail-billingTotalLabel">Total</div>
                  <div className="order-detail-billingTotalValue">₹{order.total_amount}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      {rescheduleOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reschedule order"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16,17,41,0.52)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !rescheduleSubmitting) setRescheduleOpen(false)
          }}
        >
          <div
            style={{
              width: 'min(520px, 100%)',
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 18px 60px rgba(16,17,41,0.24)',
              padding: 'clamp(18px, 3vw, 24px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#101129', lineHeight: 1.25 }}>Reschedule appointment</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
                  Order #{order.order_number}
                </div>
              </div>
              <button
                type="button"
                onClick={() => !rescheduleSubmitting && setRescheduleOpen(false)}
                disabled={rescheduleSubmitting}
                aria-label="Close"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: '1px solid #E7E1FF',
                  background: '#fff',
                  color: '#5D48AC',
                  cursor: rescheduleSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#414141', fontWeight: 500 }}>New appointment date</span>
              <input
                type="date"
                min={toDateInputValue(new Date())}
                value={rescheduleDate}
                onChange={(e) => { void handleRescheduleDateChange(e.target.value) }}
                disabled={rescheduleSubmitting}
                style={{
                  height: 44,
                  borderRadius: 10,
                  border: '1px solid #E7E1FF',
                  padding: '0 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: '#161616',
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#414141', fontWeight: 500 }}>Hourly time slot</span>
              <select
                value={rescheduleSlotIdx ?? ''}
                onChange={(e) => setRescheduleSlotIdx(e.target.value === '' ? null : Number(e.target.value))}
                disabled={rescheduleSubmitting || rescheduleLoadingSlots || rescheduleSlots.length === 0}
                style={{
                  height: 44,
                  borderRadius: 10,
                  border: '1px solid #E7E1FF',
                  padding: '0 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: rescheduleSlotIdx == null ? '#9CA3AF' : '#161616',
                  background: '#fff',
                }}
              >
                <option value="">{rescheduleLoadingSlots ? 'Loading slots...' : 'Select a time slot'}</option>
                {rescheduleSlots.map((slot, idx) => (
                  <option key={`${slot.start_time}-${idx}`} value={idx}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#414141', fontWeight: 500 }}>Reason</span>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                disabled={rescheduleSubmitting}
                rows={4}
                placeholder="Tell us why you need to reschedule"
                style={{
                  borderRadius: 10,
                  border: '1px solid #E7E1FF',
                  padding: 12,
                  resize: 'vertical',
                  minHeight: 96,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: '#161616',
                }}
              />
            </label>

            {rescheduleError && (
              <div role="alert" style={{ fontSize: 13, color: '#B91C1C', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 11px', fontFamily: 'Inter, sans-serif' }}>
                {rescheduleError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setRescheduleOpen(false)}
                disabled={rescheduleSubmitting}
                style={{
                  height: 42,
                  border: '1px solid #E7E1FF',
                  background: '#fff',
                  color: '#5D48AC',
                  borderRadius: 10,
                  padding: '0 16px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  cursor: rescheduleSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { void handleRescheduleSubmit() }}
                disabled={rescheduleSubmitting || rescheduleLoadingSlots}
                style={{
                  height: 42,
                  border: 'none',
                  background: '#8B5CF6',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '0 18px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  cursor: rescheduleSubmitting || rescheduleLoadingSlots ? 'not-allowed' : 'pointer',
                }}
              >
                {rescheduleSubmitting ? 'Rescheduling...' : 'Confirm reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
      {cancelOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cancel order"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16,17,41,0.52)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !cancelSubmitting) setCancelOpen(false)
          }}
        >
          <div
            style={{
              width: 'min(480px, 100%)',
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 18px 60px rgba(16,17,41,0.24)',
              padding: 'clamp(18px, 3vw, 24px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#101129', lineHeight: 1.25 }}>Cancel order</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
                  Order #{order.order_number}
                </div>
              </div>
              <button
                type="button"
                onClick={() => !cancelSubmitting && setCancelOpen(false)}
                disabled={cancelSubmitting}
                aria-label="Close"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: '1px solid #FECACA',
                  background: '#fff',
                  color: '#B91C1C',
                  cursor: cancelSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#414141', fontWeight: 500 }}>Reason for cancellation</span>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={cancelSubmitting}
                rows={4}
                placeholder="Tell us why you need to cancel"
                style={{
                  borderRadius: 10,
                  border: '1px solid #FECACA',
                  padding: 12,
                  resize: 'vertical',
                  minHeight: 96,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: '#161616',
                }}
              />
            </label>

            {cancelError && (
              <div role="alert" style={{ fontSize: 13, color: '#B91C1C', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 11px', fontFamily: 'Inter, sans-serif' }}>
                {cancelError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                disabled={cancelSubmitting}
                style={{
                  height: 42,
                  border: '1px solid #E7E1FF',
                  background: '#fff',
                  color: '#5D48AC',
                  borderRadius: 10,
                  padding: '0 16px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  cursor: cancelSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                Keep order
              </button>
              <button
                type="button"
                onClick={() => { void handleCancelSubmit() }}
                disabled={cancelSubmitting}
                style={{
                  height: 42,
                  border: 'none',
                  background: '#DC2626',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '0 18px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  cursor: cancelSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {cancelSubmitting ? 'Cancelling...' : 'Confirm cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

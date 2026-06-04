import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Navbar } from '../components'
import {
  fetchMyReports,
  fetchMyReportById,
  findMyReportInList,
  findMyReportByContext,
  pickReportDownloadUrl,
  pickSampleCollectedTimestampFromReport,
  downloadPatientReport,
  downloadPatientReportPdfBlob,
  fetchThyrocareReport,
  downloadThyrocareReportPdfBlob,
  type MyReportRow,
  type ReportLinkContext,
} from '../api/orders'
import { API_BASE_URL } from '../../../shared/api/client'
import { fetchMembers, type Member } from '../api/member'
import { peekReportNavigation, consumeReportNavigation } from '../reportNavSession'
import paramIcon from '../assets/Report/param.svg'
import { useAuth } from '../../../shared/auth/AuthContext'
import { ga4CustomUserParams, trackGa4CustomEvent } from '../utils/ga4CustomEvents'

const NAV_LINKS = [
  { label: 'Tests', href: '/' }, { label: 'Packages', href: '/' },
  { label: 'Reports', href: '/reports' }, { label: 'Metrics', href: '/metrics' }, { label: 'Orders', href: '/orders' },
]

type Status = 'Normal' | 'High' | 'Low'
interface Biomarker {
  name: string; category: string; value: number; displayValue: string; unit: string
  normalRange: string; low: number; high: number; status: Status; rangeKind: 'bounded' | 'reference'; isNumeric: boolean
}

const STATUS_STYLE: Record<Status, { badge_bg: string; badge_text: string; dot: string; card_bg: string }> = {
  Normal: { badge_bg: '#CCFBF1', badge_text: '#059669', dot: '#10B981', card_bg: '#F0FDF9' },
  High:   { badge_bg: '#FEF3C7', badge_text: '#D97706', dot: '#F59E0B', card_bg: '#FFFBEB' },
  Low:    { badge_bg: '#EDE9FE', badge_text: '#7C3AED', dot: '#7C5CFC', card_bg: '#F5F3FF' },
}

function str(r: MyReportRow | null, ...keys: string[]): string {
  if (!r) return ''
  for (const k of keys) {
    const v = r[k]
    if (v != null && String(v).trim()) return String(v).trim()
  }
  return ''
}

function formatLongDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function reportLinkContextFromQuery(params: URLSearchParams): ReportLinkContext | undefined {
  const memberIdRaw = params.get('member_id')?.trim() || params.get('memberId')?.trim() || ''
  const orderIdRaw = params.get('order_id')?.trim() || params.get('orderId')?.trim() || ''
  const patientIds = [
    params.get('patient_id'),
    params.get('patientId'),
    params.get('lead_id'),
    params.get('leadId'),
  ]
    .map(v => String(v ?? '').trim())
    .filter(Boolean)

  const idParam = params.get('id')?.trim() || ''
  if (idParam && !idParam.includes(':') && !patientIds.includes(idParam)) {
    patientIds.push(idParam)
  }

  const ctx: ReportLinkContext = {}
  const memberId = Number(memberIdRaw)
  if (memberIdRaw && Number.isFinite(memberId)) ctx.memberId = memberId
  if (patientIds.length) ctx.patientIds = [...new Set(patientIds)]
  const orderNumber = params.get('order_number')?.trim() || params.get('orderNumber')?.trim() || ''
  if (orderNumber) ctx.nucleotideOrderNumber = orderNumber
  const orderId = Number(orderIdRaw)
  if (orderIdRaw && Number.isFinite(orderId)) ctx.nucleotideOrderId = orderId
  const thyrocareOrderId = params.get('thyrocare_order_id')?.trim() || params.get('thyrocareOrderId')?.trim() || ''
  if (thyrocareOrderId) ctx.thyrocareOrderId = thyrocareOrderId

  return Object.keys(ctx).length ? ctx : undefined
}

/** Scalar fields returned by my-reports that are not already shown in the page header. */
function reportSummaryEntries(row: MyReportRow | null): { key: string; value: string }[] {
  if (!row) return []
  const headerKeys = new Set([
    'patient_name',
    'member_name',
    'patientName',
    'beneficiary_name',
    'patient',
    'report_date',
    'completed_at',
    'created_at',
    'appointment_date',
    'reportDate',
    'collected_at',
    'collection_date',
    'sample_collected_at',
    'order_id',
    'orderId',
    'our_order_id',
    'order_number',
    'ref_order_no',
    'patient_id',
    'patientId',
    'lead_id',
    'leadId',
    'member_id',
    'product_name',
    'package_name',
    'report_name',
    'title',
    'order_name',
    'report_type',
    'reportType',
    'category',
    'type',
  ])
  const arrayLikeKeys = new Set([
    'biomarkers',
    'parameters',
    'results',
    'tests',
    'report_parameters',
    'analytes',
    'observations',
    'report_details',
    'report_lines',
    'test_results',
    'thyrocare_results',
    'lab_results',
    'line_items',
  ])
  const out: { key: string; value: string }[] = []
  for (const [k, val] of Object.entries(row)) {
    if (headerKeys.has(k) || arrayLikeKeys.has(k)) continue
    if (val == null) continue
    const t = typeof val
    if (t === 'object') continue
    if (t !== 'string' && t !== 'number' && t !== 'boolean') continue
    let s = String(val).trim()
    if (!s) continue
    if (/token|secret|password|authorization/i.test(k)) continue
    if (s.length > 280) s = `${s.slice(0, 277)}…`
    out.push({ key: k, value: s })
  }
  out.sort((a, b) => a.key.localeCompare(b.key))
  return out
}

/** Parse strings like "0.02 - 0.5" or "0.02–0.5" into numeric bounds. */
function parseNormalValRangeString(s: string): { low: number; high: number } {
  const m = String(s)
    .trim()
    .match(/([\d.]+(?:[eE][+-]?\d+)?)\s*[-–—]\s*([\d.]+(?:[eE][+-]?\d+)?)/)
  if (!m) return { low: NaN, high: NaN }
  return { low: Number(m[1]), high: Number(m[2]) }
}

function numericValueFromResult(value: unknown): number {
  if (value == null) return NaN
  const raw = String(value).trim().replace(/,/g, '')
  if (!raw || /^[<>]=?/.test(raw)) return NaN
  if (!/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(raw)) return NaN
  return Number(raw)
}

function normalizeReportCategory(raw: unknown): string {
  const original = String(raw ?? '').trim()
  if (!original) return 'Results'

  const key = original
    .toUpperCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (/^C?\s*VITAMINS?$/.test(key) || /^(VITB|VITD3|VITAMIN B12|VITAMIN D3)$/.test(key)) {
    return 'VITAMINS'
  }
  if (/^LIPIDS?$/.test(key) || key === 'LIPID PROFILE') return 'LIPID'
  if (/^ELECTROLYTES?$/.test(key) || key === 'SERUM ELECTROLYTES') return 'ELECTROLYTES'
  if (/^(CARDIAC RISK MARKERS?|CARDIAC MARKERS?)$/.test(key)) return 'CARDIAC RISK MARKERS'
  if (/^(CANCER MARKERS?|TUMOR MARKERS?|TUMOUR MARKERS?|PSA)$/.test(key)) return 'CANCER MARKERS'
  if (/^(TOXIC ELEMENTS?|HEAVY METALS?)$/.test(key)) return 'TOXIC ELEMENTS'
  if (/^(LIVER|LFT|LIVER FUNCTION TESTS?|LIVER FUNCTION PROFILE)$/.test(key)) return 'LIVER'
  if (/^(RENAL|KIDNEY|KIDPRO|KIDNEY PROFILE|RENAL PROFILE)$/.test(key)) return 'RENAL'
  if (/^(THYROID|T3 T4 USTSH|T3 T4 TSH|THYROID PROFILE)$/.test(key)) return 'THYROID'
  if (/^(IRON DEFICIENCY|IRON DEFICIENCY PROFILE|IRON PROFILE)$/.test(key)) return 'IRON DEFICIENCY'
  if (/^(INFECTION|INFECTIONS|HBSAG)$/.test(key)) return 'INFECTION'
  if (/^(BLOOD|HEMOGRAM|HAEMOGRAM|CBC|COMPLETE BLOOD COUNT)$/.test(key)) return 'BLOOD'
  if (/^(DIABETES|DIABETIC|DIABETES PROFILE|BLOOD SUGAR)$/.test(key)) return 'DIABETES'
  if (/^(URINE|URINE ROUTINE|URINE EXAMINATION)$/.test(key)) return 'URINE'
  if (/^(BONE|BONES|BONE PROFILE)$/.test(key)) return 'BONE'

  return original
}

function categoryForBiomarker(o: Record<string, unknown>, fallback: string): string {
  const haystack = String(
    [
      o.description,
      o.name,
      o.parameter_name,
      o.test_code,
      o.report_group,
      o.group,
      o.category,
    ]
      .filter(v => v != null)
      .join(' '),
  )
    .replace(/[_-]+/g, ' ')
    .toLowerCase()

  if (/\b(apolipoprotein|apo\s*a|apo\s*b|lipoprotein|cholesterol|triglycerides?|hdl|ldl|vldl|troponin|nt\s*probnp|bnp|ck\s*mb|cardiac)\b/.test(haystack)) {
    return 'LIPID'
  }
  return fallback
}

function explicitReportGroupForBiomarker(o: Record<string, unknown>): string {
  const keys = ['report_group_id', 'reportGroupId', 'report_group', 'reportGroup', 'group_name', 'groupName']

  for (const key of keys) {
    const value = o[key]
    if (value != null && String(value).trim()) return String(value).trim()
  }
  return ''
}

const REPORT_ITEM_ARRAY_KEYS = [
  'biomarkers',
  'parameters',
  'results',
  'tests',
  'report_parameters',
  'analytes',
  'observations',
  'report_details',
  'report_lines',
  'test_results',
  'thyrocare_results',
  'lab_results',
  'line_items',
] as const

function firstReportItemArray(row: MyReportRow): unknown[] | null {
  for (const k of REPORT_ITEM_ARRAY_KEYS) {
    const v = row[k]
    if (Array.isArray(v) && v.length) return v
  }
  return null
}

/** Thyrocare-style line: description + test_value (+ optional test_code). */
function isThyrocareStyleLineRow(o: MyReportRow): boolean {
  const r = o as Record<string, unknown>
  const hasVal = r.test_value != null && String(r.test_value).trim() !== ''
  const hasName = !!(String(r.description ?? '').trim() || String(r.test_code ?? '').trim())
  return hasVal && hasName
}

function biomarkerFromReportItem(o: Record<string, unknown>): Biomarker | null {
  const name = String(
    o.description ??
      o.name ??
      o.parameter_name ??
      o.investigation ??
      o.label ??
      o.test_code ??
      '',
  ).trim()
  if (!name) return null

  const rawVal = o.value ?? o.result ?? o.observed_value ?? o.reading ?? o.test_value
  if (rawVal == null) return null
  if (typeof rawVal === 'string' && !rawVal.trim()) return null
  const displayValue = String(rawVal).trim()
  const value = numericValueFromResult(rawVal)

  const explicitLow = Number(o.low ?? o.min ?? o.reference_low ?? o.lower_bound ?? NaN)
  const explicitHigh = Number(o.high ?? o.max ?? o.reference_high ?? o.upper_bound ?? NaN)
  let low = explicitLow
  let high = explicitHigh
  const rangeSrc = String(
    o.normal_range ?? o.reference_range ?? o.range ?? o.normal_val ?? '',
  ).trim()
  let hasBoundedRange = Number.isFinite(explicitLow) && Number.isFinite(explicitHigh)
  if ((!Number.isFinite(low) || !Number.isFinite(high)) && rangeSrc) {
    const p = parseNormalValRangeString(rangeSrc)
    if (Number.isFinite(p.low) && Number.isFinite(p.high)) {
      low = p.low
      high = p.high
      hasBoundedRange = true
    }
  }

  const unit = String(o.unit ?? o.units ?? '')
  const normalRange =
    rangeSrc || (Number.isFinite(low) && Number.isFinite(high) ? `${low} – ${high}` : '—')

  let status: Status = 'Normal'
  const ind = String(o.indicator ?? '').trim().toUpperCase()
  if (Number.isFinite(value) && hasBoundedRange) {
    if (value > high) status = 'High'
    else if (value < low) status = 'Low'
  } else if (ind === 'LOW' || ind === 'L') status = 'Low'
  else if (ind === 'RED' || ind === 'HIGH' || ind === 'H') status = 'High'
  else {
    const st = String(o.status ?? o.flag ?? o.interpretation ?? '').toLowerCase()
    if (st.includes('high') || st === 'h') status = 'High'
    else if (st.includes('low') || st === 'l') status = 'Low'
  }

  const explicitGroup = explicitReportGroupForBiomarker(o)
  const catRaw = explicitGroup || (o.group ?? o.department ?? o.category)
  const category = explicitGroup
    ? normalizeReportCategory(explicitGroup)
    : categoryForBiomarker(o, normalizeReportCategory(catRaw))

  return {
    name,
    category,
    value: Number.isFinite(value) ? value : 0,
    displayValue,
    unit,
    normalRange,
    low: Number.isFinite(low) ? low : 0,
    high: Number.isFinite(high) ? high : 1,
    status,
    isNumeric: Number.isFinite(value),
    rangeKind: Number.isFinite(value) && hasBoundedRange ? 'bounded' : 'reference',
  }
}

function parseBiomarkersFromRow(row: MyReportRow | null): Biomarker[] {
  if (!row) return []
  const arr = firstReportItemArray(row)
  if (arr) {
    const out: Biomarker[] = []
    for (const item of arr) {
      if (item == null || typeof item !== 'object') continue
      const b = biomarkerFromReportItem(item as Record<string, unknown>)
      if (b) out.push(b)
    }
    return out
  }
  if (isThyrocareStyleLineRow(row)) {
    const b = biomarkerFromReportItem(row as Record<string, unknown>)
    return b ? [b] : []
  }
  return []
}

const NORMAL_RANGE_START_PCT = 14
const NORMAL_RANGE_END_PCT = 86
const OUT_OF_RANGE_MARKER_GAP_PCT = 6

function clampPct(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function resultPctForRange(value: number, low: number, high: number) {
  if (value < low) return NORMAL_RANGE_START_PCT - OUT_OF_RANGE_MARKER_GAP_PCT
  if (value > high) return NORMAL_RANGE_END_PCT + OUT_OF_RANGE_MARKER_GAP_PCT

  const span = high - low
  if (span <= 0) return (NORMAL_RANGE_START_PCT + NORMAL_RANGE_END_PCT) / 2
  const ratio = (value - low) / span
  return clampPct(
    NORMAL_RANGE_START_PCT + ratio * (NORMAL_RANGE_END_PCT - NORMAL_RANGE_START_PCT),
    NORMAL_RANGE_START_PCT,
    NORMAL_RANGE_END_PCT,
  )
}

function BiomarkerCard({ b }: { b: Biomarker }) {
  const ss = STATUS_STYLE[b.status]
  const hasScale = b.rangeKind === 'bounded'
  const p = hasScale ? resultPctForRange(b.value, b.low, b.high) : 0
  const normalStart = hasScale ? NORMAL_RANGE_START_PCT : 0
  const normalEnd = hasScale ? NORMAL_RANGE_END_PCT : 0
  const fmtVal = b.value >= 1000 ? b.value.toLocaleString('en-IN') : b.value.toString()
  const fmtLow = b.low >= 1000 ? b.low.toLocaleString('en-IN') : b.low.toString()
  const fmtHigh = b.high >= 1000 ? b.high.toLocaleString('en-IN') : b.high.toString()
  const displayValue = b.displayValue || fmtVal
  const showReferenceCards = b.rangeKind === 'reference' && b.isNumeric
  const isQualitative = !b.isNumeric

  return (
    <div className={isQualitative ? 'report-detail-biomarkerCard report-detail-biomarkerCardQualitative' : 'report-detail-biomarkerCard'} style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12,
      boxShadow: '0px 4px 27.3px 0px rgba(0,0,0,0.05)',
      padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div className="report-detail-biomarkerHead" style={{ background: ss.card_bg, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="report-detail-biomarkerTitleWrap" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: ss.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="2" viewBox="0 0 14 2" fill="none"><rect width="14" height="2" rx="1" fill="#fff"/></svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 500, color: '#161616', lineHeight: 1.3 }}>{b.name}</span>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, fontWeight: 400, color: '#828282' }}>{b.category}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 500, color: '#fff',
            background: ss.dot, borderRadius: 47, padding: '5px 16px',
            boxShadow: `0px 4px 27.3px 0px rgba(0,0,0,0.05)`,
          }}>{b.status}</span>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#828282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>

      {isQualitative ? (
        <div className="report-detail-qualitativeResult" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          background: '#FAFAFA',
          padding: '10px 12px',
        }}>
          <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, fontWeight: 400, color: '#828282' }}>Result</span>
          <span style={{
            fontFamily: 'Poppins,sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: '#161616',
            lineHeight: 1.2,
            textAlign: 'right',
            wordBreak: 'break-word',
          }}>{displayValue}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 11 }}>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 28, fontWeight: 600, color: '#161616', lineHeight: 1 }}>{displayValue}</span>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 400, color: '#828282', lineHeight: 1.4, paddingBottom: 2 }}>{b.unit}</span>
          </div>
          {hasScale ? (
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 400, color: '#828282' }}>Normal range: {b.normalRange}</span>
          ) : null}
        </div>
      )}

      {hasScale ? (
        <div className="report-detail-rangeScale" style={{ position: 'relative', height: 63 }}>
          <div className="report-detail-resultMarker" style={{ position: 'absolute', left: `${p}%`, top: 0, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ss.dot }} />
            <div style={{
              background: ss.dot, color: '#fff', fontFamily: 'Poppins,sans-serif',
              fontSize: 13, fontWeight: 500, borderRadius: 34, padding: '0 10px',
              whiteSpace: 'nowrap', lineHeight: 1.45, outline: `1px solid ${ss.dot}`,
            }}>{displayValue}</div>
          </div>
          <div className="report-detail-rangeTrack" style={{ position: 'absolute', top: 14, left: 0, right: 0, height: 9, borderRadius: 285, background: '#F9F9F9', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              left: `${normalStart}%`,
              top: 0,
              width: `${Math.max(1, normalEnd - normalStart)}%`,
              height: '100%',
              background: STATUS_STYLE.Normal.card_bg,
              borderRadius: 285,
            }} />
          </div>
          <div className="report-detail-rangeLabels" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20 }}>
            <span className="report-detail-rangeEdge report-detail-rangeEdgeLow" style={{ position: 'absolute', left: 0, fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 400, color: '#828282' }}>Low</span>
            <span style={{
              position: 'absolute',
              left: `${normalStart}%`,
              transform: 'translateX(-50%)',
              fontFamily: 'Poppins,sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: '#161616',
            }}>{fmtLow}</span>
            <span style={{
              position: 'absolute',
              left: `${normalEnd}%`,
              transform: 'translateX(-50%)',
              fontFamily: 'Poppins,sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: '#161616',
            }}>{fmtHigh}</span>
            <span className="report-detail-rangeEdge report-detail-rangeEdgeHigh" style={{ position: 'absolute', right: 0, fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 400, color: '#828282' }}>High</span>
          </div>
        </div>
      ) : showReferenceCards ? (
        <div
          className="report-detail-referenceStrip"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 10,
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            background: '#FAFAFA',
            padding: '10px 12px',
          }}
        >
          <div className="report-detail-referenceItem" style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: '#828282', marginBottom: 3 }}>Result</div>
            <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 600, color: '#161616', whiteSpace: 'normal', wordBreak: 'break-word' }}>
              {displayValue}{b.unit ? <span style={{ color: '#828282', fontWeight: 400, marginLeft: 6 }}>{b.unit}</span> : null}
            </div>
          </div>
          <div className="report-detail-referenceItem" style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: '#828282', marginBottom: 3 }}>Expected</div>
            <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 600, color: '#161616', whiteSpace: 'normal', wordBreak: 'break-word' }}>{b.normalRange}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function reportHasDownloadUrl(row: MyReportRow | null): boolean {
  return !!pickReportDownloadUrl(row)
}

type LocationState = {
  report?: MyReportRow
  reportTryIds?: string[]
  reportLinkContext?: ReportLinkContext
} | null

function ReportDetailSkeleton({ onCartClick }: { onCartClick: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Poppins', sans-serif" }}>
      <Navbar logoSrc="/favicon.svg" logoAlt="Nucleotide" links={NAV_LINKS} ctaLabel="My Cart" hideSearchOnMobile onCtaClick={onCartClick} />

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
        <div className="organ-detail-skeleton" style={{ width: 54, height: 14, borderRadius: 8 }} />
        <span style={{ fontSize: 14, color: '#D1D5DB' }}>›</span>
        <div className="organ-detail-skeleton" style={{ width: 92, height: 14, borderRadius: 8 }} />
        <span style={{ fontSize: 14, color: '#D1D5DB' }}>›</span>
        <div className="organ-detail-skeleton" style={{ width: 114, height: 14, borderRadius: 8 }} />
      </div>

      <div className="report-detail-pageInner" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px clamp(16px, 5vw, 56px) 60px', boxSizing: 'border-box' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #101129 0%, #27295B 100%)',
            borderRadius: 20,
            padding: '24px clamp(18px, 4vw, 32px)',
            marginBottom: 24,
            boxShadow: '0px 16px 40px rgba(16,17,41,0.16)',
          }}
        >
          <div className="organ-detail-skeleton" style={{ width: 'min(360px, 76%)', height: 26, borderRadius: 10, marginBottom: 14, opacity: 0.36 }} />
          <div className="organ-detail-skeleton" style={{ width: 'min(260px, 58%)', height: 15, borderRadius: 8, marginBottom: 28, opacity: 0.28 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.16)', borderRadius: 14, padding: 14, background: 'rgba(255,255,255,0.06)' }}>
                <div className="organ-detail-skeleton" style={{ width: 72, height: 12, borderRadius: 8, marginBottom: 10, opacity: 0.24 }} />
                <div className="organ-detail-skeleton" style={{ width: '85%', height: 16, borderRadius: 8, opacity: 0.34 }} />
              </div>
            ))}
          </div>
        </div>

        <div className="report-detail-summaryGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: '#fff', padding: 16, textAlign: 'center', borderRadius: 12, border: '1px solid #F0F0F0' }}>
              <div className="organ-detail-skeleton" style={{ width: 42, height: 30, borderRadius: 10, margin: '0 auto 8px' }} />
              <div className="organ-detail-skeleton" style={{ width: 70, height: 12, borderRadius: 8, margin: '0 auto' }} />
            </div>
          ))}
        </div>

        <div role="status" aria-label="Loading report details" style={{ display: 'grid', gap: 10 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0px 4px 27.3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="organ-detail-skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="organ-detail-skeleton" style={{ width: 'min(190px, 66%)', height: 15, borderRadius: 8, marginBottom: 9 }} />
                <div className="organ-detail-skeleton" style={{ width: 94, height: 12, borderRadius: 8 }} />
              </div>
              <div className="organ-detail-skeleton" style={{ width: 82, height: 24, borderRadius: 100 }} />
              <div className="organ-detail-skeleton" style={{ width: 8, height: 20, borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ReportPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user, currentMember } = useAuth()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const reportId = searchParams.get('id')?.trim() ?? ''
  const linkKey = searchParams.get('lk')?.trim() ?? ''
  const seedRow = (location.state as LocationState)?.report ?? null

  const [report, setReport] = useState<MyReportRow | null>(seedRow)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!reportId || !seedRow)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [groupFilters, setGroupFilters] = useState<Record<string, string>>({})
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 520)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => setIsMobile(window.innerWidth <= 520)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let cancelled = false
    void fetchMembers()
      .then(list => {
        if (!cancelled) setMembers(list)
      })
      .catch(() => {
        if (!cancelled) setMembers([])
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const rawLoc = (location.state as LocationState) ?? null
    const stashed = linkKey ? peekReportNavigation(linkKey) : null
    const queryContext = reportLinkContextFromQuery(searchParams)
    const merged: LocationState = {
      report: rawLoc?.report ?? stashed?.report ?? null,
      reportTryIds:
        Array.isArray(rawLoc?.reportTryIds) && rawLoc.reportTryIds.length
          ? rawLoc.reportTryIds
          : Array.isArray(stashed?.reportTryIds)
            ? stashed.reportTryIds
            : [],
      reportLinkContext: rawLoc?.reportLinkContext ?? stashed?.reportLinkContext ?? queryContext,
    }
    const sr = merged?.report ?? null
    const tryFromNav = Array.isArray(merged?.reportTryIds) ? merged.reportTryIds : []
    const tryIds = [...new Set([reportId, ...tryFromNav].map(s => String(s ?? '').trim()).filter(Boolean))]

    async function run() {
      if (!reportId && tryIds.length === 0 && !merged?.reportLinkContext) {
        if (sr) {
          if (!cancelled) {
            setReport(sr)
            setLoadError(null)
          }
        } else {
          if (!cancelled) {
            setReport(null)
            setLoadError('Open a report from My Reports.')
          }
        }
        if (!cancelled) setLoading(false)
        return
      }

      if (!cancelled) {
        setLoading(true)
        setLoadError(null)
        if (sr) setReport(sr)
      }

      try {
        let row: MyReportRow | null = null
        for (const id of tryIds) {
          if (!id || id.includes(':')) continue
          const low = id.toLowerCase()
          if (low === 'order-detail' || low === 'order_detail' || low === 'context') continue
          row = await fetchMyReportById(id)
          if (row) break
        }
        if (!row) {
          const list = await fetchMyReports()
          if (!row && merged?.reportLinkContext) {
            row = findMyReportByContext(list, merged.reportLinkContext)
          }
          if (!row) {
            for (const id of tryIds) {
              row = findMyReportInList(list, id)
              if (row) break
            }
          }
        }
        if (cancelled) return
        if (row) setReport(row)
        else {
          setLoadError('Report not found.')
          if (!sr) setReport(null)
        }
      } catch {
        if (!cancelled) {
          setLoadError('Could not load this report.')
          if (!sr) setReport(null)
        }
      } finally {
        if (!cancelled && linkKey) consumeReportNavigation(linkKey)
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => { cancelled = true }
  }, [reportId, location.key, linkKey, location.search, searchParams])

  const biomarkers = useMemo(() => parseBiomarkersFromRow(report), [report])
  const apiSummary = useMemo(() => reportSummaryEntries(report), [report])

  const normal = biomarkers.filter(b => b.status === 'Normal').length
  const high = biomarkers.filter(b => b.status === 'High').length
  const low = biomarkers.filter(b => b.status === 'Low').length
  const needs = high + low

  const categories = useMemo(() => [...new Set(biomarkers.map(b => b.category))], [biomarkers])

  const title =
    str(report, 'product_name', 'package_name', 'report_name', 'title', 'order_name')
    || 'Lab report'
  const patientDisplay = useMemo(() => {
    if (!report) return '—'
    const fromApi = str(
      report,
      'patient_name',
      'member_name',
      'patientName',
      'beneficiary_name',
      'member_full_name',
      'full_name',
    )
    if (fromApi) return fromApi
    const midRaw = report.member_id ?? report.memberId
    if (midRaw != null && String(midRaw).trim() !== '') {
      const id = Number(midRaw)
      const m = members.find(x => x.member_id === id)
      if (m?.name?.trim()) {
        const name = m.name.trim()
        const rel = (m.relation ?? '').trim()
        if (rel && !/^self$/i.test(rel)) return `${name} (${rel})`
        return name
      }
    }
    const pid = str(report, 'patient_id', 'patientId', 'lead_id', 'leadId')
    if (pid) return pid
    return '—'
  }, [report, members])
  /** Serviced / sample-collected status time first; same source for header date + Collected row. */
  const primaryReportDateRaw = useMemo(() => {
    if (!report) return ''
    const picked = pickSampleCollectedTimestampFromReport(report)
    if (picked) return picked
    return str(
      report,
      'collected_at',
      'collection_date',
      'sample_collected_at',
      'report_date',
      'sample_date',
      'completed_at',
      'created_at',
      'appointment_date',
      'reportDate',
    )
  }, [report])

  function downloadReportUrl(url: string, filename: string) {
    const t = url.trim()
    const abs =
      t.startsWith('http://') || t.startsWith('https://')
        ? t
        : `${API_BASE_URL}${t.startsWith('/') ? '' : '/'}${t}`
    const a = document.createElement('a')
    a.href = abs
    a.download = filename
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
  }

  const handleDownloadPdf = useCallback(async () => {
    if (!report) return
    setPdfLoading(true)
    setPdfError(null)
    try {
      const safeTitle = (title || 'report').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 80) || 'report'
      const filename = `${safeTitle}.pdf`
      let url = pickReportDownloadUrl(report)
      const pid = str(report, 'patient_id', 'lead_id', 'patientId', 'leadId', 'id')
      const tc = str(report, 'thyrocare_order_id', 'thyrocareOrderId')
      const lead = str(report, 'lead_id', 'leadId') || pid
      if (!url && pid) {
        url = pickReportDownloadUrl(await downloadPatientReport(pid))
      }
      if (!url && tc && lead) {
        url = pickReportDownloadUrl(await fetchThyrocareReport(tc, lead))
      }

      // Prefer direct binary download when we don't have a usable signed URL.
      // This ensures the button "integrates the endpoint" and works even when backend returns no URL.
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        downloadReportUrl(url, filename)
        return
      }
      if (tc && lead) {
        const blob = await downloadThyrocareReportPdfBlob(tc, lead)
        downloadBlob(blob, filename)
        return
      }
      if (pid) {
        const blob = await downloadPatientReportPdfBlob(pid)
        downloadBlob(blob, filename)
        return
      }

      setPdfError('Download is not available for this report yet.')
    } catch (e) {
      const anyE = e as any
      const st = anyE?.status
      const msg =
        (typeof anyE?.data?.message === 'string' && anyE.data.message.trim())
        || (typeof anyE?.data === 'string' && anyE.data.trim())
        || (typeof anyE?.message === 'string' && anyE.message.trim())
        || ''
      setPdfError(
        st ? `PDF download failed (${st}). ${msg || 'Try again later.'}` : (msg || 'Could not fetch PDF. Try again later.'),
      )
    } finally {
      setPdfLoading(false)
    }
  }, [report, title])

  const missingPieces = useMemo(() => {
    const missing: string[] = []
    const cleanPatient = String(patientDisplay ?? '').trim()
    const hasPatient = !!cleanPatient && !cleanPatient.includes('—') && !cleanPatient.includes('â€”') && !cleanPatient.includes('Ã¢')
    if (!title || title === 'Lab report') missing.push('product_name / test name')
    if (!hasPatient) missing.push('patient name')
    if (!primaryReportDateRaw) missing.push('sample date')
    if (biomarkers.length === 0) missing.push('structured results array')
    if (!reportHasDownloadUrl(report)) missing.push('patient PDF presigned_url')
    return missing
  }, [biomarkers.length, patientDisplay, primaryReportDateRaw, report, title])

  if (loading) {
    return <ReportDetailSkeleton onCartClick={() => navigate('/cart')} />
  }

  if (loadError || !report) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Poppins', sans-serif" }}>
        <Navbar logoSrc="/favicon.svg" logoAlt="Nucleotide" links={NAV_LINKS} ctaLabel="My Cart" hideSearchOnMobile onCtaClick={() => navigate('/cart')} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 48 }}>
          <p style={{ color: '#B91C1C', marginBottom: 16 }}>{loadError ?? 'Report not found.'}</p>
          <button type="button" onClick={() => navigate('/reports')} style={{ color: '#7C5CFC', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 15 }}>
            Back to My Reports
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Poppins', sans-serif" }}>
      <Navbar logoSrc="/favicon.svg" logoAlt="Nucleotide" links={NAV_LINKS} ctaLabel="My Cart" hideSearchOnMobile onCtaClick={() => navigate('/cart')} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '0 16px 32px' : '0 40px 40px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0 0', marginBottom: 20 }}>
          <span onClick={() => navigate('/reports')} style={{ fontSize: 15, color: '#9CA3AF', cursor: 'pointer', fontWeight: 400 }}>Reports</span>
          <span style={{ fontSize: 15, color: '#9CA3AF' }}>{'>'}</span>
          <span style={{ fontSize: 15, color: '#1B1F3B', fontWeight: 600 }}>Report Detail</span>
        </div>

        <div className="report-detail-heroCard" style={{ background: '#1B1F3B', borderRadius: 16, padding: isMobile ? '22px 16px 18px' : '36px 36px 32px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: '#fff', margin: 0 }}>{title}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 20 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="13" rx="2" stroke="#7C5CFC" strokeWidth="1.2"/><path d="M5 1v2M11 1v2M1 6h14" stroke="#7C5CFC" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>{formatLongDate(primaryReportDateRaw)}</span>
          </div>

          <div style={{ borderTop: '1px solid #2D3160', marginBottom: 20 }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6" r="4" stroke="#9CA3AF" strokeWidth="1.3"/><path d="M2 18c0-4 3.6-7 8-7s8 3 8 7" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/></svg>
                Patient: {patientDisplay}
              </span>
            </div>
            <div className="report-detail-heroActions" style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap', justifyContent: isMobile ? 'stretch' : 'flex-end', width: isMobile ? '100%' : undefined }}>
              <button
                type="button"
                onClick={() => void handleDownloadPdf()}
                disabled={pdfLoading}
                className="report-detail-heroActionBtn"
                style={{ background: 'none', border: '1.5px solid #4B5280', color: '#fff', borderRadius: 10, padding: '10px clamp(12px, 3.2vw, 20px)', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, flex: isMobile ? '1 1 100%' : '1 1 150px', width: isMobile ? '100%' : undefined, whiteSpace: isMobile ? 'normal' : 'nowrap' }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {pdfLoading ? 'Loading…' : 'Download PDF'}
              </button>
            </div>
            {pdfError && (
              <div
                role="status"
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid #4B5280',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#FCA5A5',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                }}
              >
                {pdfError}
              </div>
            )}
          </div>
        </div>

        {missingPieces.length > 0 && (
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '12px 14px', color: '#9A3412', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
            Missing report details: {missingPieces.join(', ')}.
          </div>
        )}

        {biomarkers.length > 0 ? (
          <>
            <div className="report-detail-summaryGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div className="report-detail-summaryTile" style={{ background: '#10B981', padding: '16px', textAlign: 'center', borderRadius: 12 }}>
                <div className="report-detail-summaryCount" style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{normal}</div>
                <div className="report-detail-summaryLabel" style={{ fontSize: 13, color: '#fff', opacity: 0.9, marginTop: 4 }}>Normal</div>
              </div>
              <div className="report-detail-summaryTile" style={{ background: '#E8845A', padding: '16px', textAlign: 'center', borderRadius: 12 }}>
                <div className="report-detail-summaryCount" style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{high}</div>
                <div className="report-detail-summaryLabel" style={{ fontSize: 13, color: '#fff', opacity: 0.9, marginTop: 4 }}>High</div>
              </div>
              <div className="report-detail-summaryTile" style={{ background: '#7C5CFC', padding: '16px', textAlign: 'center', borderRadius: 12 }}>
                <div className="report-detail-summaryCount" style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{low}</div>
                <div className="report-detail-summaryLabel" style={{ fontSize: 13, color: '#fff', opacity: 0.9, marginTop: 4 }}>Low</div>
              </div>
            </div>

            {categories.map(cat => {
              const catMarkers = biomarkers.filter(b => b.category === cat)
              const catNormal = catMarkers.filter(b => b.status === 'Normal').length
              const catAbnormal = catMarkers.filter(b => b.status !== 'Normal').length
              const isExpanded = expandedGroups[cat] ?? false
              const gf = groupFilters[cat] ?? 'All'
              const visible =
                gf === 'Normal' ? catMarkers.filter(b => b.status === 'Normal')
                : gf === 'Needs Attention' ? catMarkers.filter(b => b.status !== 'Normal')
                : catMarkers

              return (
                <div key={cat} style={{ background: '#fff', borderRadius: 16, marginBottom: 8, overflow: 'hidden', boxShadow: '0px 4px 27.3px 0px rgba(0,0,0,0.05)' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedGroups(prev => ({ ...prev, [cat]: !prev[cat] }))}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <img
                      src={paramIcon}
                      alt=""
                      aria-hidden="true"
                      style={{ width: 40, height: 40, display: 'block', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: 'Poppins,sans-serif' }}>{cat}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, fontFamily: 'Poppins,sans-serif' }}>{catMarkers.length} Parameters</div>
                    </div>
                    {catAbnormal > 0 ? (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#DC2626', background: '#FEE2E2', borderRadius: 20, padding: '4px 10px', flexShrink: 0, fontFamily: 'Poppins,sans-serif' }}>
                        {catAbnormal} Abnormal
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#D1FAE5', borderRadius: 20, padding: '4px 10px', flexShrink: 0, fontFamily: 'Poppins,sans-serif' }}>
                        All Normal
                      </span>
                    )}
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                      <path d="M1 1l6 6-6 6" stroke="#828282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F3F4F6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 12px', flexWrap: 'wrap' }}>
                        {(['All', 'Normal', 'Needs Attention'] as const).map(f => {
                          const count = f === 'All' ? catMarkers.length : f === 'Normal' ? catNormal : catAbnormal
                          return (
                            <button key={f} type="button"
                              onClick={e => {
                                e.stopPropagation()
                                trackGa4CustomEvent('bt_parameter_tab_click', {
                                  linkText: f,
                                  sectionTitle: cat,
                                  ...ga4CustomUserParams({ isLoggedIn, user, currentMember }),
                                })
                                setGroupFilters(prev => ({ ...prev, [cat]: f }))
                              }}
                              style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', background: gf === f ? '#7C5CFC' : '#F3F4F6', color: gf === f ? '#fff' : '#6B7280', fontFamily: 'Poppins,sans-serif' }}
                            >
                              {f}({count})
                            </button>
                          )
                        })}
                      </div>
                      {visible.map((b, i) => <BiomarkerCard key={`${cat}-${b.name}-${i}`} b={b} />)}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        ) : (
          <>
            {apiSummary.length > 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #E5E7EB', marginBottom: 16 }}>
                <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#1B1F3B' }}>Details from your report record</p>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                  The header above and this table come from the same row returned by <code style={{ fontSize: 12 }}>GET /thyrocare/reports/my-reports</code> (loaded into this page as <code style={{ fontSize: 12 }}>report</code> in React state). Parameter cards only render when that payload includes a lab results array (see below).
                </p>
                <dl style={{ margin: 0, display: 'grid', gap: 10 }}>
                  {apiSummary.map(({ key, value }) => (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 200px) 1fr', gap: 12, alignItems: 'start', fontSize: 13 }}>
                      <dt style={{ margin: 0, color: '#9CA3AF', fontWeight: 500, wordBreak: 'break-word' }}>{key}</dt>
                      <dd style={{ margin: 0, color: '#374151', wordBreak: 'break-word' }}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #E5E7EB', color: '#6B7280', fontSize: 15, lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 12px' }}>No structured parameters in this report yet. Use <strong>Download PDF</strong> for the full lab document.</p>
              <p style={{ margin: 0, fontSize: 13 }}>Cards here are built only from a <code style={{ fontSize: 12 }}>biomarkers</code>, <code style={{ fontSize: 12 }}>parameters</code>, or <code style={{ fontSize: 12 }}>results</code> <strong>array</strong> on the same row. If the API only returns metadata and a PDF link, that array is usually missing - you still see the header{apiSummary.length > 0 ? ' and the summary table above' : ''}, but not per-test rows.</p>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

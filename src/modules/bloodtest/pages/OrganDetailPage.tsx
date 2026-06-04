import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LineGraph, Navbar, Footer } from '../components'
import { fetchMyReports, pickSampleCollectedTimestampFromReport, type MyReportRow } from '../api/orders'
import { useAuth } from '../../../shared/auth/AuthContext'
import { BLOOD_TEST_HOME } from '../utils/routes'

import heartIcon from '../assets/figma/Health metrics/heart.svg'
import liverIcon from '../assets/figma/Health metrics/liver.svg'
import boneIcon from '../assets/figma/Health metrics/Bone.svg'
import gutIcon from '../assets/figma/Health metrics/gut.svg'
import thyroidIcon from '../assets/figma/Health metrics/thyroid.svg'
import bloodIcon from '../assets/figma/Health metrics/blood.svg'
import vitaminsIcon from '../assets/figma/Health metrics/vitamins.svg'

const NAV_LINKS = [
  { label: 'Tests',    href: '/' },
  { label: 'Packages', href: '/packages' },
  { label: 'Reports',  href: '/reports' },
  { label: 'Metrics',  href: '/metrics' },
  { label: 'Orders',   href: '/orders' },
]

type OrganName = 'Heart' | 'Liver' | 'Bone' | 'Gut' | 'Thyroid' | 'Blood' | 'Vitamins'
type Status = 'Normal' | 'High' | 'Low'
type StatusType = 'Normal' | 'High' | 'Low'

const ORGAN_ICON: Record<OrganName, string> = {
  Heart: heartIcon,
  Liver: liverIcon,
  Bone: boneIcon,
  Gut: gutIcon,
  Thyroid: thyroidIcon,
  Blood: bloodIcon,
  Vitamins: vitaminsIcon,
}

const STATUS_STYLE: Record<StatusType, { bg: string; color: string; label: string }> = {
  Normal: { bg: '#E6F6F3', color: '#41C9B3', label: 'Normal' },
  High: { bg: '#FFF0F0', color: '#E12D2D', label: 'High' },
  Low: { bg: '#FFF0F0', color: '#E12D2D', label: 'Low' },
}

function normalizeParamName(s: string): string {
  return String(s ?? '')
    .trim()
    .toUpperCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
}

function normalizeParamCode(s: string): string {
  return String(s ?? '').trim().toUpperCase().replace(/\s+/g, '')
}

function reportLineParamName(line: Record<string, unknown>): string {
  return String(
    line.description ??
      line.parameter_name ??
      line.name ??
      line.investigation ??
      line.label ??
      line.test_code ??
      '',
  ).trim()
}

function parameterIdentityKey(name: string, code?: string): string {
  const normalizedName = normalizeParamName(name)
  if (normalizedName) return `name:${normalizedName}`
  return code ? `code:${normalizeParamCode(code)}` : ''
}

function parseNormalValRangeString(s: string): { low: number; high: number } {
  const m = String(s)
    .trim()
    .match(/([\d.]+(?:[eE][+-]?\d+)?)\s*[-–—]\s*([\d.]+(?:[eE][+-]?\d+)?)/)
  if (!m) return { low: NaN, high: NaN }
  return { low: Number(m[1]), high: Number(m[2]) }
}

function statusFromItem(o: Record<string, unknown>, value?: number, normalRange?: string): Status {
  if (Number.isFinite(value) && normalRange) {
    const { low, high } = parseNormalValRangeString(normalRange)
    if (Number.isFinite(low) && value! < low) return 'Low'
    if (Number.isFinite(high) && value! > high) return 'High'
  }

  const ind = String(o.indicator ?? '').trim().toUpperCase()
  if (ind === 'RED' || ind === 'HIGH' || ind === 'H') return 'High'
  if (ind === 'LOW' || ind === 'L') return 'Low'
  const st = String(o.status ?? o.flag ?? o.interpretation ?? '').toLowerCase()
  if (st.includes('high') || st === 'h') return 'High'
  if (st.includes('low') || st === 'l') return 'Low'
  return 'Normal'
}

function toOrganName(raw: unknown): OrganName | null {
  const t = String(raw ?? '').trim()
  if (!t) return null
  const low = normalizeMetricText(t)
  for (const k of Object.keys(ORGAN_ICON) as OrganName[]) {
    if (k.toLowerCase() === low) return k
  }
  if (/\b(cardiac|cardio|cardiovascular|heart|lipid)\b/.test(low)) return 'Heart'
  if (/\b(liver|hepatic|bilirubin|sgot|sgpt|alt|ast)\b/.test(low)) return 'Liver'
  if (/\b(bone|orthopedic|calcium|phosphorus|vitamin d)\b/.test(low)) return 'Bone'
  if (/\b(gut|digestive|gastro|stool|pancreatic)\b/.test(low)) return 'Gut'
  if (/\b(thyroid|t3|t4|tsh)\b/.test(low)) return 'Thyroid'
  if (/\b(blood|hematology|haematology|hemogram|haemogram|cbc|diabetes|glucose|hba1c|urine)\b/.test(low)) return 'Blood'
  if (/\b(vitamin|mineral|iron|ferritin|b12|folate|electrolyte|toxic elements)\b/.test(low)) return 'Vitamins'
  return null
}

function normalizeMetricText(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
}

function organFromReportLine(line: Record<string, unknown>): OrganName | null {
  // `category` is persisted from thyrocare_lab_results.category, which is populated
  // from thyrocare_test_parameters.organ during XML ingestion. Treat it as the source
  // of truth before using any text fallback.
  const direct =
    toOrganName(line.category) ??
    toOrganName(line.organ) ??
    toOrganName(line.associated_category)
  if (direct) return direct

  const text = normalizeMetricText([
    line.name,
    line.parameter_name,
    line.description,
    line.test_code,
  ].filter(Boolean).join(' '))

  if (!text) return null
  if (/\b(lipid|cholesterol|triglyceride|hdl|ldl|vldl|cardiac|heart|crp|homocysteine)\b/.test(text)) return 'Heart'
  if (/\b(liver|bilirubin|sgot|sgpt|alt|ast|alkaline phosphatase|ggt|protein|albumin|globulin)\b/.test(text)) return 'Liver'
  if (/\b(bone|calcium|phosphorus|phosphate|alkaline phosphatase|vitamin d|uric acid)\b/.test(text)) return 'Bone'
  if (/\b(gut|stool|digest|abdomen|pancreatic|amylase|lipase)\b/.test(text)) return 'Gut'
  if (/\b(thyroid|t3|t4|tsh|thyroxine|triiodothyronine)\b/.test(text)) return 'Thyroid'
  if (/\b(hemogram|haemogram|cbc|blood|rbc|wbc|platelet|hemoglobin|haemoglobin|pcv|mcv|mch|rdw|neutrophil|lymphocyte|monocyte|eosinophil|basophil|diabetes|glucose|hba1c|urine)\b/.test(text)) return 'Blood'
  if (/\b(vitamin|b12|folate|ferritin|iron|deficiency|toxic elements|mineral|electrolyte|sodium|potassium|chloride|magnesium)\b/.test(text)) return 'Vitamins'
  return null
}

function parseDateValue(rawValue: unknown): Date | null {
  const raw = String(rawValue ?? '').trim()
  if (!raw) return null

  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s.*)?$/)
  if (dmy) {
    const day = Number(dmy[1])
    const month = Number(dmy[2]) - 1
    const year = Number(dmy[3])
    const d = new Date(year, month, day)
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) return d
  }

  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function parseReportDate(row: MyReportRow): Date | null {
  const picked = pickSampleCollectedTimestampFromReport(row)
  const raw = String(
    picked ??
      row.sample_date ??
      row.sampleDate ??
      row.report_date ??
      row.reportDate ??
      row.completed_at ??
      row.created_at ??
      '',
  ).trim()
  return parseDateValue(raw)
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatReportDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatMetricValue(value: number): string {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function changeSummary(from: SeriesPoint, to: SeriesPoint, unit: string): {
  direction: 'Increased' | 'Decreased' | 'No change'
  amount: string
  percent: string | null
  relativeText: string | null
  diff: number
} {
  const diff = to.value - from.value
  const absDiff = Math.abs(diff)
  const percent = from.value !== 0 ? Math.abs((diff / from.value) * 100) : null
  return {
    direction: diff > 0 ? 'Increased' : diff < 0 ? 'Decreased' : 'No change',
    amount: `${formatMetricValue(absDiff)}${unit ? ` ${unit}` : ''}`,
    percent: percent == null ? null : `${percent.toFixed(1)}%`,
    relativeText: null,
    diff,
  }
}

function valueStatus(value: number, normalRange: string): StatusType {
  const { low, high } = parseNormalValRangeString(normalRange)
  if (Number.isFinite(low) && value < low) return 'Low'
  if (Number.isFinite(high) && value > high) return 'High'
  return 'Normal'
}

function compareHeadline(from: SeriesPoint, to: SeriesPoint, normalRange: string): string {
  const fromStatus = valueStatus(from.value, normalRange)
  const toStatus = valueStatus(to.value, normalRange)

  if (fromStatus !== 'Normal' && toStatus === 'Normal') return 'Moved into normal range'
  if (fromStatus === 'Normal' && toStatus === 'Normal') return 'Still in normal range'
  if (fromStatus === 'Normal' && toStatus === 'High') return 'Moved above normal range'
  if (fromStatus === 'Normal' && toStatus === 'Low') return 'Moved below normal range'
  if (fromStatus === 'High' && toStatus === 'High') return 'Still above normal range'
  if (fromStatus === 'Low' && toStatus === 'Low') return 'Still below normal range'
  if (toStatus === 'High') return 'Moved above normal range'
  if (toStatus === 'Low') return 'Moved below normal range'

  return to.value === from.value ? 'No change in range status' : 'Range status changed'
}

function extractReportLines(row: MyReportRow): Record<string, unknown>[] {
  const keys = [
    'results',
    'lab_results',
    'thyrocare_results',
    'biomarkers',
    'parameters',
    'report_lines',
    'report_details',
    'tests',
  ] as const
  for (const k of keys) {
    const v = row[k]
    if (Array.isArray(v) && v.length) {
      return v.filter((x): x is Record<string, unknown> => x != null && typeof x === 'object' && !Array.isArray(x))
    }
  }
  return []
}

type SeriesPoint = { date: Date; label: string; value: number }
type ParamSeries = {
  key: string
  code?: string
  name: string
  unit: string
  normalRange: string
  status: StatusType
  changePct: string
  changeDir: 'up' | 'down' | null
  latestPoint: SeriesPoint | null
  previousPoint: SeriesPoint | null
  points: SeriesPoint[]
}

export default function OrganDetailPage({ cartCount }: { cartCount?: number } = {}) {
  const navigate = useNavigate()
  const { currentMember } = useAuth()
  const { organ } = useParams<{ organ: string }>()
  const organName = (organ ? (organ.charAt(0).toUpperCase() + organ.slice(1)) : 'Heart') as string
  const organKey = toOrganName(organName) ?? 'Heart'

  const [activeParamFilter, setActiveParamFilter] = useState<'All' | 'Normal' | 'Needs'>('All')
  const [compareParamKey, setCompareParamKey] = useState<string | null>(null)
  const [compareFromIndex, setCompareFromIndex] = useState(0)
  const [compareToIndex, setCompareToIndex] = useState(1)
  const [showCompareHistory, setShowCompareHistory] = useState(false)
  const [comparePickSide, setComparePickSide] = useState<'from' | 'to'>('from')
  const [openCompareDatePicker, setOpenCompareDatePicker] = useState<'from' | 'to' | null>(null)
  const [selectedParamKey, setSelectedParamKey] = useState<string>('') // optional "chip" selection
  const [reports, setReports] = useState<MyReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const compareResultRef = useRef<HTMLDivElement | null>(null)
  const comparePickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const memberId = currentMember?.member_id ?? undefined
    void fetchMyReports(memberId)
      .then(async list => {
        if (list.length === 0 && memberId != null) {
          return fetchMyReports(undefined)
        }
        return list
      })
      .then(list => {
        if (cancelled) return
        setReports(list)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load organ metrics yet.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [currentMember?.member_id])

  useEffect(() => {
    if (!openCompareDatePicker) return
    window.requestAnimationFrame(() => {
      comparePickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  }, [openCompareDatePicker])

  const paramSeries = useMemo<ParamSeries[]>(() => {
    // Collect points per parameter key across all reports for this organ
    const keyTo = new Map<string, { name: string; code?: string; unit: string; normalRange: string; points: SeriesPoint[]; latestStatus: Status }>()
    const debug = {
      organ: organKey,
      reports: reports.length,
      reportsWithoutDate: 0,
      totalLines: 0,
      matchingOrganLines: 0,
      numericLines: 0,
      unmappedSamples: [] as Array<{ category: unknown; report_group: unknown; description: unknown }>,
    }

    for (const r of reports) {
      const d = parseReportDate(r)
      if (!d) {
        debug.reportsWithoutDate += 1
        continue
      }
      const label = formatShortDate(d)
      const lines = extractReportLines(r)
      debug.totalLines += lines.length
      for (const line of lines) {
        const organFromLine = organFromReportLine(line)
        if (!organFromLine && debug.unmappedSamples.length < 8) {
          debug.unmappedSamples.push({
            category: line.category,
            report_group: line.report_group ?? line.report_group_id,
            description: line.description ?? line.name,
          })
        }
        if (organFromLine !== organKey) continue
        debug.matchingOrganLines += 1

        const codeRaw = line.test_code ?? line.testCode ?? line.code ?? line.parameter_code ?? line.parameterCode
        const code = codeRaw != null && String(codeRaw).trim() ? String(codeRaw).trim() : undefined

        const name = reportLineParamName(line)
        if (!name) continue

        const rawVal = line.value ?? line.result ?? line.observed_value ?? line.reading ?? line.test_value
        if (rawVal == null) continue
        const value = Number(String(rawVal).replace(/,/g, ''))
        if (!Number.isFinite(value)) continue
        debug.numericLines += 1

        const unit = String(line.unit ?? line.units ?? '').trim()
        const rangeSrc = String(line.normal_range ?? line.reference_range ?? line.range ?? line.normal_val ?? '').trim()
        let normalRange = rangeSrc
        if (!normalRange) {
          const low = Number(line.low ?? line.min ?? line.reference_low ?? line.lower_bound ?? NaN)
          const high = Number(line.high ?? line.max ?? line.reference_high ?? line.upper_bound ?? NaN)
          if (Number.isFinite(low) && Number.isFinite(high)) normalRange = `${low} – ${high}`
        }
        const st = statusFromItem(line, value, normalRange)

        const key = parameterIdentityKey(name, code)
        if (!key) continue
        const entry = keyTo.get(key) ?? { name, code, unit, normalRange, points: [], latestStatus: st }
        entry.name = entry.name || name
        entry.code = entry.code || code
        entry.unit = entry.unit || unit
        entry.normalRange = entry.normalRange || normalRange
        entry.points.push({ date: d, label, value })
        // keep the most recent status (by date)
        if (entry.points.length === 1 || d.getTime() >= Math.max(...entry.points.map(p => p.date.getTime()))) {
          entry.latestStatus = st
        }
        keyTo.set(key, entry)
      }
    }

    const out: ParamSeries[] = []
    for (const [key, v] of keyTo.entries()) {
      const sorted = [...v.points].sort((a, b) => a.date.getTime() - b.date.getTime())
      const last = sorted.at(-1)
      const prev = sorted.length >= 2 ? sorted.at(-2) : null
      const changeDir: 'up' | 'down' | null =
        prev && last ? (last.value > prev.value ? 'up' : last.value < prev.value ? 'down' : null) : null
      const changePct =
        prev && last && prev.value !== 0
          ? `${Math.abs(((last.value - prev.value) / prev.value) * 100).toFixed(1)}%`
          : '—'
      const status: StatusType = v.latestStatus
      out.push({
        key,
        code: v.code,
        name: v.name,
        unit: v.unit,
        normalRange: v.normalRange || '—',
        status,
        changePct,
        changeDir,
        latestPoint: last ?? null,
        previousPoint: prev ?? null,
        points: sorted,
      })
    }

    // sort: attention items first, then alphabetical
    out.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'Normal' ? 1 : b.status === 'Normal' ? -1 : 0
      return a.name.localeCompare(b.name)
    })
    return out
  }, [reports, organKey])

  const filteredParams = useMemo(() => {
    let arr = paramSeries
    if (activeParamFilter === 'Normal') arr = arr.filter(p => p.status === 'Normal')
    if (activeParamFilter === 'Needs') arr = arr.filter(p => p.status !== 'Normal')
    if (selectedParamKey) arr = arr.filter(p => p.key === selectedParamKey)
    return arr
  }, [paramSeries, activeParamFilter, selectedParamKey])

  const normalCount = useMemo(() => paramSeries.filter(p => p.status === 'Normal').length, [paramSeries])
  const abnormalCount = useMemo(() => paramSeries.filter(p => p.status !== 'Normal').length, [paramSeries])
  const allCount = paramSeries.length
  const hasNoData = !loading && !error && allCount === 0

  const organScore = useMemo(() => {
    if (allCount === 0) return null
    return Math.round((normalCount / Math.max(1, allCount)) * 100)
  }, [normalCount, allCount])

  const updatedLabel = useMemo(() => {
    const ds = reports.map(parseReportDate).filter((d): d is Date => d != null)
    if (!ds.length) return 'No Data Available'
    const latest = ds.sort((a, b) => b.getTime() - a.getTime())[0]!
    return `Updated ${latest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
  }, [reports])

  const chips = useMemo(() => paramSeries.slice(0, 6), [paramSeries])
  const compareParam = useMemo(
    () => paramSeries.find(p => p.key === compareParamKey) ?? null,
    [paramSeries, compareParamKey],
  )
  const comparePoints = compareParam?.points ?? []
  const safeFromIndex = Math.min(compareFromIndex, Math.max(0, comparePoints.length - 1))
  const safeToIndex = Math.min(compareToIndex, Math.max(0, comparePoints.length - 1))
  const latestCompareIndex = Math.max(0, comparePoints.length - 1)
  const previousCompareIndex = Math.max(0, comparePoints.length - 2)
  const isLatestComparison = safeFromIndex === previousCompareIndex && safeToIndex === latestCompareIndex
  const compareFromPoint = comparePoints[safeFromIndex]
  const compareToPoint = comparePoints[safeToIndex]
  const compareChange = compareParam && compareFromPoint && compareToPoint
    ? changeSummary(compareFromPoint, compareToPoint, compareParam.unit)
    : null
  const compareSummary = compareParam && compareFromPoint && compareToPoint
    ? compareHeadline(compareFromPoint, compareToPoint, compareParam.normalRange)
    : ''
  const compareToStatus = compareParam && compareToPoint
    ? valueStatus(compareToPoint.value, compareParam.normalRange)
    : 'Normal'
  const compareFromStatus = compareParam && compareFromPoint
    ? valueStatus(compareFromPoint.value, compareParam.normalRange)
    : 'Normal'

  const openCompare = (p: ParamSeries) => {
    if (p.points.length < 2) return
    setCompareParamKey(p.key)
    setShowCompareHistory(false)
    setComparePickSide('from')
    setOpenCompareDatePicker(null)
    setCompareFromIndex(Math.max(0, p.points.length - 2))
    setCompareToIndex(p.points.length - 1)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9F9F9', fontFamily: 'Poppins, sans-serif' }}>
      <Navbar logoSrc="/favicon.svg" logoAlt="Nucleotide" links={NAV_LINKS} ctaLabel="My Cart" cartCount={cartCount} hideSearchOnMobile onCtaClick={() => navigate('/cart')} />

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
        <span style={{ fontSize: 14, color: '#6B7280', cursor: 'pointer' }} onClick={() => navigate(BLOOD_TEST_HOME)}>Tests</span>
        <span style={{ fontSize: 14, color: '#6B7280' }}>›</span>
        <span style={{ fontSize: 14, color: '#6B7280', cursor: 'pointer' }} onClick={() => navigate('/metrics')}>Health Metrics</span>
        <span style={{ fontSize: 14, color: '#6B7280' }}>›</span>
        <span style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{organName}</span>
      </div>

      <div className="organ-detail-inner" style={{ flex: 1, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '32px 40px 60px', boxSizing: 'border-box' }}>

        {/* Header card */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: '20px 20px 16px',
          boxShadow: '0px 4px 27.3px rgba(0,0,0,0.05)',
          outline: '1px solid #E7E1FF', outlineOffset: -1,
          marginBottom: 20,
        }}>
          {/* Organ name + status + score */}
          <div className="organ-detail-headerRow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            {/* Left: icon | name row, then score, then date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Row 1: icon + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={ORGAN_ICON[organKey]} alt={organName} width={44} height={44} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 18, fontWeight: 500, color: '#161616' }}>{organName}</span>
              </div>
              {/* Row 2: score */}
              {!hasNoData && (
              <div className="organ-detail-scoreRow" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, paddingLeft: 56 }}>
                {loading ? (
                  <div className="organ-detail-skeleton" style={{ width: 88, height: 30, borderRadius: 8 }} />
                ) : (
                  <>
                    <span style={{ fontSize: 28, fontWeight: 500, color: '#161616', lineHeight: 1 }}>{organScore ?? '—'}</span>
                    <span style={{ fontSize: 14, color: '#828282', marginBottom: 2, fontFamily: 'Inter, sans-serif' }}>/100</span>
                  </>
                )}
              </div>
              )}
              {/* Row 3: date */}
              {loading ? (
                <div className="organ-detail-skeleton organ-detail-updated" style={{ width: 104, height: 14, borderRadius: 7, marginLeft: 56 }} />
              ) : (
                <span className="organ-detail-updated" style={{ fontSize: 12, color: '#828282', fontFamily: 'Inter, sans-serif', paddingLeft: 56 }}>{updatedLabel}</span>
              )}
            </div>

            {/* Right: insight banner */}
            <div className="organ-detail-insight" style={{
              flex: '0 0 340px', padding: '12px 14px',
              background: hasNoData ? '#F9F7FF' : 'linear-gradient(90deg, #101129 0%, #2A2C5B 100%)',
              border: hasNoData ? '1px solid #E7E1FF' : 'none',
              borderRadius: 14, display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 13, color: hasNoData ? '#414141' : '#fff', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                {error ? error : loading ? 'Loading your latest insights...' : hasNoData ? `No ${organName.toLowerCase()} metrics available yet.` : `${abnormalCount} parameter(s) need attention out of ${allCount}.`}
              </span>
            </div>
          </div>
        </div>

        {/* Parameters section */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: '28px 28px 28px',
          boxShadow: '0px 4px 27.3px rgba(0,0,0,0.05)',
          outline: '1px solid #E7E1FF', outlineOffset: -1,
          marginBottom: 20,
        }}>
          {/* Parameters header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 500, color: '#161616' }}>Parameters</span>
          </div>

          {/* Filter row */}
          <div className="organ-detail-filterRow" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <div className="organ-detail-filterGroup" style={{ display: 'flex', background: '#fff', boxShadow: '0px 4px 27.3px rgba(0,0,0,0.05)', borderRadius: 112, outline: '1px solid #E7E1FF', outlineOffset: -1, padding: 8 }}>
              {loading ? (
                [72, 92, 136].map((width, i) => (
                  <div key={i} className="organ-detail-skeleton" style={{ width, height: 32, borderRadius: 47, marginRight: i === 2 ? 0 : 4 }} />
                ))
              ) : (
                [
                  { key: 'All', label: `All(${allCount})` },
                  { key: 'Normal', label: `Normal(${normalCount})` },
                  { key: 'Needs', label: `Needs Attention(${abnormalCount})` },
                ].map(f => (
                  <button key={f.key} onClick={() => {
                    setActiveParamFilter(f.key as any)
                  }} style={{
                    padding: '6px 16px', borderRadius: 47, border: 'none',
                    background: activeParamFilter === f.key ? '#fff' : 'transparent',
                    boxShadow: activeParamFilter === f.key ? '0px 4px 27.3px rgba(0,0,0,0.05)' : 'none',
                    outline: activeParamFilter === f.key ? '1px solid #E7E1FF' : 'none', outlineOffset: -1,
                    color: activeParamFilter === f.key ? '#8B5CF6' : '#414141',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                  }}>{f.label}</button>
                ))
              )}
            </div>
            {!loading && (
              <>
                <div className="organ-detail-filterDivider" style={{ width: 1, height: 28, background: '#E7E1FF' }} />
                {chips.map(p => (
                  <button key={p.key} type="button" onClick={() => setSelectedParamKey(p.key)} style={{
                    padding: '6px 14px', borderRadius: 36, border: 'none',
                    background: selectedParamKey === p.key ? '#E7E1FF' : '#F9F9F9',
                    color: '#414141',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                  }}>{p.name}</button>
                ))}
              </>
            )}
          </div>

          {/* Parameter cards with charts */}
          {loading ? (
            <div aria-label="Loading parameters" role="status">
              {[0, 1].map(i => (
                <div
                  key={i}
                  className="organ-paramCard"
                  style={{
                    background: '#fff', borderRadius: 20, padding: '24px',
                    outline: '1px solid #E7E1FF', outlineOffset: -1,
                    marginBottom: 16,
                  }}
                >
                  <div className="organ-detail-skeleton" style={{ width: 'min(260px, 70%)', height: 20, borderRadius: 8, marginBottom: 18 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div className="organ-detail-skeleton" style={{ width: 72, height: 28, borderRadius: 8 }} />
                    <div className="organ-detail-skeleton" style={{ width: 52, height: 16, borderRadius: 8 }} />
                    <div className="organ-detail-skeleton" style={{ width: 70, height: 24, borderRadius: 100 }} />
                  </div>
                  <div className="organ-detail-skeleton" style={{ width: 'min(220px, 62%)', height: 14, borderRadius: 8, marginBottom: 24 }} />
                  <div className="organ-detail-chartSkeleton" aria-hidden="true">
                    <div className="organ-detail-chartSkeletonLine" style={{ top: '18%' }} />
                    <div className="organ-detail-chartSkeletonLine" style={{ top: '38%' }} />
                    <div className="organ-detail-chartSkeletonLine" style={{ top: '58%' }} />
                    <div className="organ-detail-chartSkeletonLine" style={{ top: '78%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div style={{ padding: 12, color: '#B91C1C' }}>{error}</div>
          ) : filteredParams.length === 0 ? (
            <div
              className="organ-detail-emptyState"
              style={{
                minHeight: 220,
                borderRadius: 18,
                background: '#FBFAFF',
                border: '1px dashed #DCD3FF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '32px 20px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 500, color: '#161616', marginBottom: 8 }}>
                No parameters found for {organName} yet.
              </div>
              <div style={{ maxWidth: 480, fontSize: 14, lineHeight: 1.6, color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
                Your trends will appear here after a report with {organName.toLowerCase()}-related parameters is available.
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => navigate(BLOOD_TEST_HOME)}
                  style={{
                    minHeight: 40,
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#8B5CF6',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Book a Test
                </button>
              </div>
            </div>
          ) : filteredParams.map(p => {
            const ss = STATUS_STYLE[p.status]
            const chartColor = '#8B5CF6'
            const chartPoints = p.points
            const last = p.latestPoint
            const prev = p.previousPoint
            const hasHistory = p.points.length >= 2
            const previousSummary = prev ? `Previous: ${formatMetricValue(prev.value)}${p.unit ? ` ${p.unit}` : ''} on ${formatReportDate(prev.date)}` : ''
            return (
              <div
                key={p.key}
                className="organ-paramCard"
                style={{
                  background: '#fff', borderRadius: 20, padding: '24px',
                  outline: '1px solid #E7E1FF', outlineOffset: -1,
                  marginBottom: 16,
                }}
              >
                {/* Param header */}
                <div className="organ-paramHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div className="organ-paramName" style={{ fontSize: 18, fontWeight: 500, color: '#161616', marginBottom: 8 }}>{p.name}</div>
                    <div className="organ-paramValueRow" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, rowGap: 8, flexWrap: 'wrap', marginBottom: 6, minWidth: 0 }}>
                      <span className="organ-paramValue" style={{ fontSize: 28, fontWeight: 600, color: p.status === 'Normal' ? '#161616' : '#E12D2D', lineHeight: 1 }}>{last ? formatMetricValue(last.value) : '—'}</span>
                      <span className="organ-paramUnit" style={{ fontSize: 15, color: '#828282', marginBottom: 2, fontFamily: 'Inter, sans-serif' }}>{p.unit}</span>
                      <span className="organ-paramStatusPill" style={{ padding: '3px 10px', borderRadius: 100, background: ss.bg, color: ss.color, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{ss.label}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 14, color: '#828282', fontFamily: 'Poppins, sans-serif' }}>
                        Normal range: <span style={{ color: '#161616' }}>{p.normalRange}</span>
                      </span>
                      {previousSummary && (
                        <span style={{ fontSize: 12, color: '#828282', fontFamily: 'Inter, sans-serif' }}>{previousSummary}</span>
                      )}
                    </div>
                  </div>
                  {hasHistory && (
                    <div className="organ-paramActions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8, flex: '0 1 300px' }}>
                      <button
                        type="button"
                        onClick={() => openCompare(p)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: 112,
                          border: '1px solid #E7E1FF',
                          background: '#F9F7FF',
                          color: '#8B5CF6',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        View change over time
                      </button>
                    </div>
                  )}
                </div>

                {/* Chart */}
                <div style={{ position: 'relative', width: '100%', minWidth: 1, minHeight: 196, marginTop: 4 }}>
                  <LineGraph
                    data={chartPoints.map(pt => ({ x: pt.label, y: pt.value, tooltipLabel: formatReportDate(pt.date) }))}
                    stroke={chartColor}
                    height={196}
                    showValueLabels={chartPoints.length <= 4}
                  />
                </div>

              </div>
            )
          })}
        </div>

      </div>

      {compareParam && (
        <div
          className="organ-compareOverlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${compareParam.name} value change`}
          onClick={() => setCompareParamKey(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(16,17,41,0.42)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            className="organ-compareSheet"
            onClick={e => e.stopPropagation()}
            style={{
              width: 'min(560px, 100%)',
              maxHeight: 'calc(100vh - 40px)',
              overflow: 'auto',
              background: '#fff',
              borderRadius: 24,
              boxShadow: '0px 22px 70px rgba(16,17,41,0.18)',
              border: '1px solid #E7E1FF',
              padding: 0,
              boxSizing: 'border-box',
            }}
          >
            <div className="organ-compareContent" style={{ padding: '22px 20px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#161616' }}>{compareParam.name}</div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: STATUS_STYLE[compareToStatus].bg,
                    color: STATUS_STYLE[compareToStatus].color,
                    fontSize: 10.5,
                    lineHeight: 1.2,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                  }}>
                    {STATUS_STYLE[compareToStatus].label}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: '#828282', fontFamily: 'Inter, sans-serif' }}>
                  {isLatestComparison ? 'Latest change from the previous report' : 'Custom comparison between report dates'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  aria-label={showCompareHistory ? 'Hide value history' : 'Show value history'}
                  title={showCompareHistory ? 'Hide history' : 'Show history'}
                  onClick={() => setShowCompareHistory(v => !v)}
                  style={{
                    width: 38,
                    height: 38,
                    display: 'grid',
                    placeItems: 'center',
                    border: '1px solid #E6E1F7',
                    background: showCompareHistory ? '#F4F0FF' : '#fff',
                    color: '#8B5CF6',
                    borderRadius: 11,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setCompareParamKey(null)}
                  style={{
                    border: '1px solid #ECECEC',
                    background: '#F7F7F7',
                    color: '#414141',
                    borderRadius: 11,
                    padding: '9px 13px',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {compareChange && compareFromPoint && compareToPoint ? (
              <>
                <div ref={compareResultRef} style={{
                  borderRadius: 16,
                  background: 'linear-gradient(180deg, #FBFAFF 0%, #FFFFFF 100%)',
                  border: '1px solid #E7E1FF',
                  padding: 14,
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                    <span style={{
                      width: 30,
                      height: 30,
                      borderRadius: 11,
                      display: 'grid',
                      placeItems: 'center',
                      background: compareToStatus === 'Normal' ? '#E6F6F3' : '#FFF0F0',
                      color: compareToStatus === 'Normal' ? '#179F8A' : '#E12D2D',
                      flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 16.5l5-5 4 4L20 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15 8h5v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span style={{ fontSize: 11.5, color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Report insight
                    </span>
                  </div>
                  <div style={{
                    fontSize: 20,
                    lineHeight: 1.22,
                    fontWeight: 600,
                    color: '#161616',
                    marginBottom: 7,
                  }}>
                    {compareSummary}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: '#414141', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>
                    {compareChange.direction === 'No change'
                      ? 'The selected reports show the same value.'
                      : `${compareChange.direction} by ${compareChange.amount} since ${formatReportDate(compareFromPoint.date)}.`}
                    {compareChange.relativeText ? ` ${compareChange.relativeText}` : ''}
                  </div>
                  <div className="organ-compareValueGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'stretch' }}>
                    <div style={{ padding: 12, borderRadius: 12, background: '#fff', border: '1px solid #E7E1FF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 12, color: '#828282', fontFamily: 'Inter, sans-serif' }}>
                          {isLatestComparison ? 'Previous' : 'From report'}
                        </div>
                        <span style={{ padding: '2px 8px', borderRadius: 99, background: STATUS_STYLE[compareFromStatus].bg, color: STATUS_STYLE[compareFromStatus].color, fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
                          {STATUS_STYLE[compareFromStatus].label}
                        </span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#161616' }}>
                        {formatMetricValue(compareFromPoint.value)}{compareParam.unit ? ` ${compareParam.unit}` : ''}
                      </div>
                      <div style={{ fontSize: 12, color: '#828282', fontFamily: 'Inter, sans-serif' }}>{formatReportDate(compareFromPoint.date)}</div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: '#fff', border: '1px solid #E7E1FF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 12, color: '#828282', fontFamily: 'Inter, sans-serif' }}>
                          {isLatestComparison ? 'Latest' : 'To report'}
                        </div>
                        <span style={{ padding: '2px 8px', borderRadius: 99, background: STATUS_STYLE[compareToStatus].bg, color: STATUS_STYLE[compareToStatus].color, fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
                          {STATUS_STYLE[compareToStatus].label}
                        </span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#161616' }}>
                        {formatMetricValue(compareToPoint.value)}{compareParam.unit ? ` ${compareParam.unit}` : ''}
                      </div>
                      <div style={{ fontSize: 12, color: '#828282', fontFamily: 'Inter, sans-serif' }}>{formatReportDate(compareToPoint.date)}</div>
                    </div>
                  </div>
                </div>

                {showCompareHistory && (
                  <div style={{
                    borderRadius: 16,
                    border: '1px solid #E7E1FF',
                    background: '#FCFBFF',
                    padding: 14,
                    marginBottom: 18,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#161616' }}>Report history</div>
                      <div style={{ fontSize: 12, color: '#828282', fontFamily: 'Inter, sans-serif' }}>{comparePoints.length} reports</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[...comparePoints].reverse().map((pt, reverseIndex) => {
                        const originalIndex = comparePoints.length - 1 - reverseIndex
                        const status = valueStatus(pt.value, compareParam.normalRange)
                        return (
                          <div
                            key={`${pt.date.getTime()}-${originalIndex}`}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr auto',
                              gap: 12,
                              alignItems: 'center',
                              border: '1px solid #F0ECFF',
                              borderRadius: 12,
                              background: '#fff',
                              padding: '10px 12px',
                              textAlign: 'left',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            <span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 15, fontWeight: 600, color: '#161616' }}>
                                {formatMetricValue(pt.value)}{compareParam.unit ? ` ${compareParam.unit}` : ''}
                              </span>
                              <span style={{ display: 'block', fontSize: 12, color: '#828282', marginTop: 2 }}>
                                {formatReportDate(pt.date)}
                              </span>
                            </span>
                            <span style={{ padding: '2px 8px', borderRadius: 99, background: STATUS_STYLE[status].bg, color: STATUS_STYLE[status].color, fontSize: 11 }}>
                              {STATUS_STYLE[status].label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 14, fontWeight: 600, color: '#161616', marginBottom: 10 }}>Compare reports</div>
                <div style={{
                  border: '1px solid #E7E1FF',
                  borderRadius: 16,
                  background: '#fff',
                  padding: 12,
                  marginBottom: 18,
                  display: 'none',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {([
                      { key: 'from' as const, label: 'From', point: compareFromPoint },
                      { key: 'to' as const, label: 'To', point: compareToPoint },
                    ]).map(item => {
                      const active = comparePickSide === item.key
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setComparePickSide(item.key)}
                          style={{
                            border: active ? '1px solid #8B5CF6' : '1px solid #F0ECFF',
                            borderRadius: 12,
                            background: active ? '#F6F2FF' : '#FBFBFD',
                            padding: '10px 11px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          <span style={{ display: 'block', fontSize: 11, color: active ? '#8B5CF6' : '#828282', fontWeight: 600, marginBottom: 4 }}>
                            {item.label}
                          </span>
                          <span style={{ display: 'block', fontSize: 13, color: '#161616', fontWeight: 700 }}>
                            {item.point ? formatReportDate(item.point.date) : '-'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="organ-compareDateScroller" style={{
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    paddingBottom: 2,
                  }}>
                    {comparePoints.map((pt, i) => {
                      const selected = comparePickSide === 'from' ? safeFromIndex === i : safeToIndex === i
                      return (
                        <button
                          key={`${pt.date.getTime()}-${i}`}
                          type="button"
                          onClick={() => {
                            if (comparePickSide === 'from') setCompareFromIndex(i)
                            else setCompareToIndex(i)
                          }}
                          style={{
                            flex: '0 0 auto',
                            border: selected ? '1px solid #8B5CF6' : '1px solid #EEEAFB',
                            borderRadius: 999,
                            background: selected ? '#8B5CF6' : '#fff',
                            color: selected ? '#fff' : '#414141',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: 'Inter, sans-serif',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatShortDate(pt.date)}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div style={{ display: 'none' }}>Compare another period</div>
                <div style={{ display: 'none', fontSize: 12, color: '#828282', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>
                  Pick the earlier and later report dates to compare.
                </div>
                <div className="organ-compareSelectGrid" style={{ display: 'none', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {(['From report', 'To report'] as const).map(label => {
                    const isFrom = label === 'From report'
                    const selectedIndex = isFrom ? safeFromIndex : safeToIndex
                    const setSelectedIndex = isFrom ? setCompareFromIndex : setCompareToIndex
                    return (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 12, color: '#828282', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{label}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {comparePoints.map((pt, i) => {
                            const selected = selectedIndex === i
                            const status = valueStatus(pt.value, compareParam.normalRange)
                            return (
                              <button
                                key={`${label}-${pt.date.getTime()}-${i}`}
                                type="button"
                                onClick={() => setSelectedIndex(i)}
                                aria-pressed={selected}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr auto',
                                  gap: 10,
                                  alignItems: 'center',
                                  border: selected ? '1px solid #8B5CF6' : '1px solid #EEEAFB',
                                  borderRadius: 14,
                                  background: selected ? '#F6F2FF' : '#fff',
                                  padding: '10px 11px',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontFamily: 'Inter, sans-serif',
                                  boxShadow: selected ? '0 8px 18px rgba(139,92,246,0.10)' : 'none',
                                }}
                              >
                                <span>
                                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#161616' }}>
                                    {formatReportDate(pt.date)}
                                  </span>
                                </span>
                                <span style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: 99,
                                  display: 'grid',
                                  placeItems: 'center',
                                  border: selected ? 'none' : '1px solid #DDD6FE',
                                  background: selected ? '#8B5CF6' : STATUS_STYLE[status].bg,
                                  color: selected ? '#fff' : STATUS_STYLE[status].color,
                                  flexShrink: 0,
                                }}>
                                  {selected && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                      <path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div ref={comparePickerRef} className="organ-compareNativeSelectGrid organ-compareSelectGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, overflow: 'visible', marginBottom: openCompareDatePicker ? 188 : 12 }}>
                  {([
                    { key: 'from' as const, label: 'From report', selectedIndex: safeFromIndex, setSelectedIndex: setCompareFromIndex },
                    { key: 'to' as const, label: 'To report', selectedIndex: safeToIndex, setSelectedIndex: setCompareToIndex },
                  ]).map(item => {
                    const selectedPoint = comparePoints[item.selectedIndex]
                    const isOpen = openCompareDatePicker === item.key
                    return (
                      <div
                        key={item.key}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          minWidth: 0,
                          fontSize: 12,
                          color: '#828282',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        <span>{item.label}</span>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenCompareDatePicker(isOpen ? null : item.key)}
                          style={{
                            width: '100%',
                            minWidth: 0,
                            border: '1px solid #E7E1FF',
                            borderRadius: 12,
                            padding: '10px 10px 10px 12px',
                            background: '#fff',
                            color: '#161616',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedPoint ? formatReportDate(selectedPoint.date) : 'Select date'}
                          </span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                            <path d="M6 9l6 6 6-6" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div
                            style={{
                              position: 'absolute',
                              zIndex: 5,
                              top: 'calc(100% + 6px)',
                              left: 0,
                              right: 0,
                              maxHeight: 168,
                              overflowY: 'auto',
                              border: '1px solid #E7E1FF',
                              borderRadius: 12,
                              background: '#fff',
                              boxShadow: '0 14px 30px rgba(16,17,41,0.14)',
                              padding: 4,
                            }}
                          >
                            {comparePoints.map((pt, i) => {
                              const selected = item.selectedIndex === i
                              return (
                                <button
                                  key={`${item.key}-${pt.date.getTime()}-${i}`}
                                  type="button"
                                  onClick={() => {
                                    item.setSelectedIndex(i)
                                    setOpenCompareDatePicker(null)
                                    window.requestAnimationFrame(() => {
                                      compareResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                    })
                                  }}
                                  style={{
                                    width: '100%',
                                    border: 'none',
                                    borderRadius: 9,
                                    background: selected ? '#F6F2FF' : '#fff',
                                    color: selected ? '#8B5CF6' : '#161616',
                                    padding: '9px 10px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: selected ? 600 : 500,
                                    fontFamily: 'Inter, sans-serif',
                                  }}
                                >
                                  {formatReportDate(pt.date)}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div style={{ padding: 18, borderRadius: 16, background: '#F9F9F9', color: '#828282', fontFamily: 'Inter, sans-serif' }}>
                No previous report to compare yet. Your next report will unlock change tracking.
              </div>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  )
}


import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar, Footer } from '../components'
import { fetchMyReports, pickSampleCollectedTimestampFromReport, type MyReportRow } from '../api/orders'
import { useAuth } from '../../../shared/auth/AuthContext'
import { ga4CustomUserParams, trackGa4CustomEvent } from '../utils/ga4CustomEvents'
import { BLOOD_TEST_HOME } from '../utils/routes'

import heartIcon    from '../assets/figma/Health metrics/heart.svg'
import liverIcon    from '../assets/figma/Health metrics/liver.svg'
import boneIcon     from '../assets/figma/Health metrics/Bone.svg'
import gutIcon      from '../assets/figma/Health metrics/gut.svg'
import thyroidIcon  from '../assets/figma/Health metrics/thyroid.svg'
import bloodIcon    from '../assets/figma/Health metrics/blood.svg'
import vitaminsIcon from '../assets/figma/Health metrics/vitamins.svg'
import bodyImg      from '../assets/figma/Health metrics/freepik__use-this-in-midjourney-leonardo-sdxlpromptultra-hi__47708 1.png'

const NAV_LINKS = [
  { label: 'Tests',    href: '/' },
  { label: 'Packages', href: '/packages' },
  { label: 'Reports',  href: '/reports' },
  { label: 'Metrics',  href: '/metrics' },
  { label: 'Orders',   href: '/orders' },
]

type StatusType = 'Good' | 'Monitor' | 'Attention' | 'No Data'

type OrganName = 'Heart' | 'Liver' | 'Bone' | 'Gut' | 'Thyroid' | 'Blood' | 'Vitamins'

const ORGAN_ICON: Record<OrganName, string> = {
  Heart: heartIcon,
  Liver: liverIcon,
  Bone: boneIcon,
  Gut: gutIcon,
  Thyroid: thyroidIcon,
  Blood: bloodIcon,
  Vitamins: vitaminsIcon,
}

const ORGAN_ORDER: OrganName[] = ['Heart', 'Liver', 'Bone', 'Gut', 'Thyroid', 'Blood', 'Vitamins']

type Trend = 'up' | 'down' | null

type OrganCardModel = {
  name: OrganName
  icon: string
  status: StatusType
  score: number | null
  updated: string
  trend: Trend
}

type Status = 'Normal' | 'High' | 'Low'

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

function formatUpdated(d: Date | null): string {
  if (!d) return 'No Data Available'
  return `Updated ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
}

function normalizeOrganName(raw: unknown): OrganName | null {
  const t = String(raw ?? '').trim()
  if (!t) return null
  const low = normalizeMetricText(t)
  for (const name of ORGAN_ORDER) {
    if (name.toLowerCase() === low) return name
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
  // Thyrocare rows historically use `category`; uploaded rows use `organ`.
  // Check both so Health Metrics can aggregate both sources.
  const direct =
    normalizeOrganName(line.category) ??
    normalizeOrganName(line.organ) ??
    normalizeOrganName(line.associated_category)
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

function computeStatusFromScore(score: number | null): StatusType {
  if (score == null) return 'No Data'
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Monitor'
  return 'Attention'
}

const FILTERS: Array<'All' | OrganName> = ['All', ...ORGAN_ORDER]

function MetricCardSkeleton() {
  return (
    <div style={{
      background: '#fff',
      boxShadow: '0px 4px 27.3px rgba(0,0,0,0.05)',
      borderRadius: 20,
      padding: '24px 16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      minHeight: 130,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="organ-detail-skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="organ-detail-skeleton" style={{ width: 'min(120px, 70%)', height: 16, borderRadius: 8, marginBottom: 12 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div className="organ-detail-skeleton" style={{ width: 48, height: 28, borderRadius: 8 }} />
            <div className="organ-detail-skeleton" style={{ width: 34, height: 13, borderRadius: 8 }} />
          </div>
        </div>
      </div>
      <div className="organ-detail-skeleton" style={{ width: 92, height: 12, borderRadius: 8, alignSelf: 'flex-end', marginTop: 'auto' }} />
    </div>
  )
}

function OrganCard({ organ, onClick }: { organ: OrganCardModel; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff',
      boxShadow: '0px 4px 27.3px rgba(0,0,0,0.05)',
      borderRadius: 20,
      padding: '24px 16px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
      cursor: 'pointer',
    }}>
      {/* Row 1: icon + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Icon — displayed directly, no background wrapper */}
          <img src={organ.icon} alt={organ.name} width={44} height={44} style={{ flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 16, fontWeight: 400, color: '#161616', fontFamily: 'Poppins, sans-serif', lineHeight: '22px' }}>
              {organ.name}
            </span>
            {organ.score !== null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 28, fontWeight: 500, color: '#161616', fontFamily: 'Poppins, sans-serif', lineHeight: '32px' }}>
                  {organ.score}
                </span>
                <span style={{ fontSize: 13, color: '#828282', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  /100
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 13, color: '#828282', fontFamily: 'Inter, sans-serif' }}>No data</span>
            )}
          </div>
        </div>
      </div>
      {/* Updated date bottom right */}
      <span style={{ fontSize: 12, color: '#828282', textAlign: 'right', fontFamily: 'Inter, sans-serif', display: 'block' }}>
        {organ.updated}
      </span>
    </div>
  )
}

export default function HealthMetricsPage({ cartCount }: { cartCount?: number } = {}) {
  const navigate = useNavigate()
  const { isLoggedIn, user, currentMember } = useAuth()
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reports, setReports] = useState<MyReportRow[]>([])

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
        if (!cancelled) setError('Could not load health metrics yet.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [currentMember?.member_id])

  const organCards = useMemo<OrganCardModel[]>(() => {
    const byOrgan = new Map<OrganName, Map<string, { date: Date; status: Status }>>()
    const prevByOrgan = new Map<OrganName, Map<string, { date: Date; status: Status }>>()
    const debug = {
      reports: reports.length,
      reportsWithoutDate: 0,
      totalLines: 0,
      mappedLines: 0,
      unmappedSamples: [] as Array<{ category: unknown; report_group: unknown; description: unknown }>,
    }

    for (const r of reports) {
      const d = parseReportDate(r)
      if (!d) {
        debug.reportsWithoutDate += 1
        continue
      }
      const lines = extractReportLines(r)
      if (!lines.length) continue
      debug.totalLines += lines.length

      for (const line of lines) {
        const organ = organFromReportLine(line)
        if (!organ) {
          if (debug.unmappedSamples.length < 8) {
            debug.unmappedSamples.push({
              category: line.category,
              report_group: line.report_group ?? line.report_group_id,
              description: line.description ?? line.name,
            })
          }
          continue
        }
        debug.mappedLines += 1

        const name = reportLineParamName(line)
        if (!name) continue

        const codeRaw = line.test_code ?? line.testCode ?? line.code ?? line.parameter_code ?? line.parameterCode
        const code = codeRaw != null && String(codeRaw).trim() ? String(codeRaw).trim() : undefined
        const key = parameterIdentityKey(name, code)
        if (!key) continue

        const rawVal = line.value ?? line.result ?? line.observed_value ?? line.reading ?? line.test_value
        if (rawVal == null) continue
        const value = Number(String(rawVal).replace(/,/g, ''))
        if (!Number.isFinite(value)) continue
        const rangeSrc = String(line.normal_range ?? line.reference_range ?? line.range ?? line.normal_val ?? '').trim()
        let normalRange = rangeSrc
        if (!normalRange) {
          const low = Number(line.low ?? line.min ?? line.reference_low ?? line.lower_bound ?? NaN)
          const high = Number(line.high ?? line.max ?? line.reference_high ?? line.upper_bound ?? NaN)
          if (Number.isFinite(low) && Number.isFinite(high)) normalRange = `${low} – ${high}`
        }
        const status = statusFromItem(line, value, normalRange)

        const latestForOrgan = byOrgan.get(organ) ?? new Map<string, { date: Date; status: Status }>()
        const previousForOrgan = prevByOrgan.get(organ) ?? new Map<string, { date: Date; status: Status }>()
        const currentLatest = latestForOrgan.get(key)
        if (!currentLatest || d.getTime() >= currentLatest.date.getTime()) {
          if (currentLatest) previousForOrgan.set(key, currentLatest)
          latestForOrgan.set(key, { date: d, status })
        } else {
          const currentPrev = previousForOrgan.get(key)
          if (!currentPrev || d.getTime() > currentPrev.date.getTime()) {
            previousForOrgan.set(key, { date: d, status })
          }
        }
        byOrgan.set(organ, latestForOrgan)
        prevByOrgan.set(organ, previousForOrgan)
      }
    }

    const out: OrganCardModel[] = []
    for (const organ of ORGAN_ORDER) {
      const latestParams = [...(byOrgan.get(organ)?.values() ?? [])]
      const prevParams = [...(prevByOrgan.get(organ)?.values() ?? [])]
      const latestDate = latestParams.length
        ? latestParams.reduce((max, item) => item.date.getTime() > max.getTime() ? item.date : max, latestParams[0]!.date)
        : null

      const latestNormal = latestParams.filter(item => item.status === 'Normal').length
      const prevNormal = prevParams.filter(item => item.status === 'Normal').length
      const scoreLatest = latestParams.length > 0 ? Math.round((latestNormal / latestParams.length) * 100) : null
      const scorePrev = prevParams.length > 0 ? Math.round((prevNormal / prevParams.length) * 100) : null

      const trend: Trend =
        scoreLatest != null && scorePrev != null
          ? (scoreLatest > scorePrev ? 'up' : scoreLatest < scorePrev ? 'down' : null)
          : null

      out.push({
        name: organ,
        icon: ORGAN_ICON[organ],
        score: scoreLatest,
        status: computeStatusFromScore(scoreLatest),
        updated: formatUpdated(latestDate),
        trend,
      })
    }
    return out
  }, [reports])

  const filtered = activeFilter === 'All' ? organCards : organCards.filter(o => o.name === activeFilter)
  const leftCol  = filtered.filter((_, i) => i < 4)
  const rightCol = filtered.filter((_, i) => i >= 4)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(0deg, #E7E1FF 0%, #fff 100%)',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <Navbar logoSrc="/favicon.svg" logoAlt="Nucleotide" links={NAV_LINKS} ctaLabel="My Cart" cartCount={cartCount} hideSearchOnMobile onCtaClick={() => navigate('/cart')} />

      {/* Breadcrumb */}
      <div
        className="cart-breadcrumb metrics-breadcrumb"
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
        <span style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>Health Metrics</span>
      </div>

      <div className="metrics-inner" style={{ flex: 1, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '32px 40px 60px', boxSizing: 'border-box' }}>

        {/* Header */}
        <div className="metrics-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div className="metrics-headerLeft" style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div className="metrics-titleRow" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <h1 className="metrics-title" style={{ fontSize: 28, fontWeight: 500, color: '#161616', margin: 0, lineHeight: 1.1 }}>
                Health Metrics
              </h1>
            </div>
            <p className="metrics-subtitle" style={{ fontSize: 15, color: '#828282', margin: '6px 0 0', fontFamily: 'Poppins, sans-serif' }}>
              Track your organ health over time with smart insights.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="metrics-filters" style={{
          display: 'flex', flexWrap: 'wrap',
          background: '#fff', boxShadow: '0px 4px 27.3px rgba(0,0,0,0.05)',
          borderRadius: 112, outline: '1px solid #E7E1FF', outlineOffset: -1,
          padding: 8, marginBottom: 32, width: 'fit-content',
        }}>
          {FILTERS.map(f => {
            const isActive = activeFilter === f
            return (
              <button
                key={f}
                onClick={() => {
                  trackGa4CustomEvent('bt_metrics_tab_change', {
                    linkText: f,
                    ...ga4CustomUserParams({ isLoggedIn, user, currentMember }),
                  })
                  setActiveFilter(f)
                }}
                className={`metrics-filterBtn ${isActive ? 'is-active' : ''}`}
                style={{
                padding: '8px 20px', borderRadius: 47, border: 'none',
                background: isActive ? '#fff' : 'transparent',
                boxShadow: isActive ? '0px 4px 27.3px rgba(0,0,0,0.05)' : 'none',
                outline: isActive ? '1px solid #E7E1FF' : 'none', outlineOffset: -1,
                color: isActive ? '#8B5CF6' : '#161616',
                fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
              }}
              >
                {f}
              </button>
            )
          })}
        </div>

        {/* Mobile grid (CSS shows on small screens) */}
        <div className="metrics-mobile-grid">
          {loading ? (
            [0, 1, 2, 3].map(i => <MetricCardSkeleton key={i} />)
          ) : error ? (
            <div style={{ padding: 18, color: '#B91C1C' }}>{error}</div>
          ) : (
            filtered.map(o => (
              <OrganCard key={o.name} organ={o} onClick={() => {
                trackGa4CustomEvent('bt_metrics_card_click', {
                  linkText: o.name,
                  ...ga4CustomUserParams({ isLoggedIn, user, currentMember }),
                })
                navigate(`/metrics/${o.name.toLowerCase()}`)
              }} />
            ))
          )}
        </div>

        {/* Desktop 3-column layout: left cards | body | right cards */}
        <div className="metrics-layout" style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'flex-start' }}>

          {/* Left column */}
          <div className="metrics-col metrics-col--left" style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              [0, 1, 2, 3].map(i => <MetricCardSkeleton key={i} />)
            ) : error ? (
              <div style={{ padding: 18, color: '#B91C1C' }}>{error}</div>
            ) : (
              leftCol.map(o => <OrganCard key={o.name} organ={o} onClick={() => {
                trackGa4CustomEvent('bt_metrics_card_click', {
                  linkText: o.name,
                  ...ga4CustomUserParams({ isLoggedIn, user, currentMember }),
                })
                navigate(`/metrics/${o.name.toLowerCase()}`)
              }} />)
            )}
          </div>

          {/* Body illustration — fixed center, vertically centered */}
          <div
            className="metrics-body"
            style={{
              width: 340,
              flexShrink: 0,
              position: 'relative',
              alignSelf: 'center',
              marginInline: 28,
            }}
          >
            <img src={bodyImg} alt="Body" style={{ width: '100%', display: 'block', borderRadius: 16, objectFit: 'contain' }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
              background: 'linear-gradient(180deg, rgba(233,228,255,0.12) 0%, #EBE7FF 100%)',
              borderRadius: '0 0 16px 16px',
            }} />
          </div>

          {/* Right column */}
          <div className="metrics-col metrics-col--right" style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? [0, 1, 2].map(i => <MetricCardSkeleton key={i} />) : error ? null : rightCol.map(o => (
              <OrganCard key={o.name} organ={o} onClick={() => {
                trackGa4CustomEvent('bt_metrics_card_click', {
                  linkText: o.name,
                  ...ga4CustomUserParams({ isLoggedIn, user, currentMember }),
                })
                navigate(`/metrics/${o.name.toLowerCase()}`)
              }} />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

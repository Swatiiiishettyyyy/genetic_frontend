const SESSION_KEY = 'nucleotide_utm_v1'
const FIRED_PREFIX = 'nucleotide_utm_fired_v2:'

export interface UtmParams {
  utm_source:   string | null
  utm_medium:   string | null
  utm_campaign: string | null
  utm_term:     string | null
  utm_content:  string | null
  utm_id:       string | null
}

export function readUtmFromUrl(): UtmParams {
  const p = new URLSearchParams(window.location.search)
  return {
    utm_source:   p.get('utm_source'),
    utm_medium:   p.get('utm_medium'),
    utm_campaign: p.get('utm_campaign'),
    utm_term:     p.get('utm_term'),
    utm_content:  p.get('utm_content'),
    utm_id:       p.get('utm_id'),
  }
}

export function hasUtmParams(u: UtmParams): boolean {
  return !!(u.utm_source || u.utm_medium || u.utm_campaign || u.utm_term || u.utm_content || u.utm_id)
}

export function saveUtmToSession(u: UtmParams): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
}

export function getUtmFromSession(): UtmParams | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as UtmParams) : null
  } catch { return null }
}

function hashString(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

export function utmFireKey(fingerprint: string, landingUrl: string, u: UtmParams): string {
  return `${FIRED_PREFIX}${hashString(JSON.stringify({
    fingerprint,
    landingUrl,
    utm_source: u.utm_source,
    utm_medium: u.utm_medium,
    utm_campaign: u.utm_campaign,
    utm_term: u.utm_term,
    utm_content: u.utm_content,
    utm_id: u.utm_id,
  }))}`
}

export function markUtmFired(key: string): void {
  sessionStorage.setItem(key, '1')
}

export function wasUtmFired(key: string): boolean {
  return sessionStorage.getItem(key) === '1'
}

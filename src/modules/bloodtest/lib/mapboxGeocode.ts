/**
 * Google Maps Geocoding helpers.
 * The legacy Mapbox-named exports are kept so existing components can migrate gradually.
 * Set `VITE_GOOGLE_MAPS_API_KEY` in `.env` with Maps JavaScript API and Geocoding API enabled.
 */

const GOOGLE_MAPS_JS_BASE = 'https://maps.googleapis.com/maps/api/js'

declare global {
  interface Window {
    google?: any
    __nucleotideGoogleMapsLoader?: Promise<void>
  }
}

function cleanToken(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const token = value.replace(/^\uFEFF/, '').trim().replace(/^["']|["']$/g, '')
  return token || null
}

function formatCoord(n: number): string {
  if (!Number.isFinite(n)) return '0'
  return Number(n.toFixed(8)).toString()
}

export function getGoogleMapsApiKey(): string | null {
  return cleanToken(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
}

export function getMapboxAccessToken(): string | null {
  return getGoogleMapsApiKey()
}

export function googleGeocodeErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) {
      return 'Could not reach Google Maps. Check internet access or API key restrictions for this origin.'
    }
    if (/REQUEST_DENIED|ApiNotActivatedMapError|RefererNotAllowedMapError|403|Forbidden/i.test(m)) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'this origin'
      return `Google Maps blocked this origin. Allow ${origin} in API key website restrictions.`
    }
    if (/OVER_QUERY_LIMIT|429/i.test(m)) return 'Google Maps rate limit reached. Try again shortly.'
    if (/INVALID_REQUEST|400/i.test(m)) return 'Invalid location query for Google Maps.'
    if (/ZERO_RESULTS/i.test(m)) return 'No address found for this location.'
  }
  return 'Search failed. Check your connection and Google Maps API key.'
}

export const mapboxGeocodeErrorMessage = googleGeocodeErrorMessage

export function newGoogleMapsSessionToken(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

export const newMapboxSessionToken = newGoogleMapsSessionToken

export async function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === 'undefined') throw new Error('Google Maps can only load in the browser.')
  if (window.google?.maps?.Map && window.google?.maps?.Geocoder) return
  if (window.__nucleotideGoogleMapsLoader) return window.__nucleotideGoogleMapsLoader

  const key = getGoogleMapsApiKey()
  if (!key) throw new Error('Google Maps API key missing (set VITE_GOOGLE_MAPS_API_KEY).')

  window.__nucleotideGoogleMapsLoader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-nucleotide-google-maps="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps JavaScript API.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.dataset.nucleotideGoogleMaps = 'true'
    script.async = true
    script.defer = true
    const params = new URLSearchParams({ key, v: 'weekly' })
    script.src = `${GOOGLE_MAPS_JS_BASE}?${params}`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps JavaScript API.'))
    document.head.appendChild(script)
  })

  return window.__nucleotideGoogleMapsLoader
}

export interface MapboxFeature {
  id: string
  type: 'Feature'
  place_name: string
  text: string
  center: [number, number]
  context?: Array<{ id: string; text: string; short_code?: string }>
  properties?: Record<string, unknown>
  geometry?: { type?: string; coordinates?: unknown }
}

export interface ParsedGeocodeResult {
  /** Street line only (no house number). */
  street_line: string
  locality: string
  city: string
  state: string
  postal_code: string
  place_name: string
  longitude: number
  latitude: number
}

function backendBaseUrl(): string {
  return String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '')
}

function componentText(components: any[], types: string[], short = false): string {
  if (!Array.isArray(components)) return ''
  for (const wanted of types) {
    const hit = components.find(c => Array.isArray(c?.types) && c.types.includes(wanted))
    if (hit) return String((short ? hit.short_name : hit.long_name) || hit.long_name || '')
  }
  return ''
}

function looksLikePlusCode(value: string): boolean {
  return /^[23456789CFGHJMPQRVWX]{2,}\w*\+\w{2,}/i.test(value.trim())
}

function firstReadableAddressSegment(formatted: string): string {
  return formatted
    .split(',')
    .map(part => part.trim())
    .find(part => part && !looksLikePlusCode(part) && !/^\d{6}$/.test(part) && !/^india$/i.test(part)) || ''
}

function googleResultLocation(result: any): [number, number] | null {
  const location = result?.geometry?.location
  if (!location) return null
  const lat = typeof location.lat === 'function' ? Number(location.lat()) : Number(location.lat)
  const lng = typeof location.lng === 'function' ? Number(location.lng()) : Number(location.lng)
  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null
}

function googleResultToFeature(result: any, index = 0): MapboxFeature | null {
  const center = googleResultLocation(result)
  if (!center) return null
  const components = Array.isArray(result.address_components) ? result.address_components : []
  const formatted = String(result.formatted_address ?? '').trim()
  const streetNumber = componentText(components, ['street_number'])
  const route = componentText(components, ['route'])
  const premise = componentText(components, ['premise', 'point_of_interest', 'establishment'])
  const firstReadable = firstReadableAddressSegment(formatted)
  const text = [streetNumber, route].filter(Boolean).join(' ').trim() || route || premise || firstReadable || formatted

  return {
    id: String(result.place_id || `google-geocode.${index}`),
    type: 'Feature',
    place_name: formatted,
    text,
    center,
    context: [
      { id: 'postcode.google', text: componentText(components, ['postal_code']) },
      { id: 'region.google', text: componentText(components, ['administrative_area_level_1']) },
      { id: 'place.google', text: componentText(components, ['locality', 'administrative_area_level_3', 'administrative_area_level_2']) },
      { id: 'district.google', text: componentText(components, ['administrative_area_level_2']) },
      { id: 'locality.google', text: componentText(components, ['sublocality_level_2', 'sublocality_level_1', 'sublocality', 'neighborhood']) },
    ].filter(x => x.text),
    properties: { googleResult: result },
    geometry: { type: 'Point', coordinates: center },
  }
}

export function normalizeGeocodeFeature(raw: Record<string, unknown>, index = 0): MapboxFeature | null {
  if ('formatted_address' in raw || 'address_components' in raw) return googleResultToFeature(raw, index)

  let lng: number | undefined
  let lat: number | undefined
  const c = raw.center
  if (Array.isArray(c) && c.length >= 2) {
    lng = Number(c[0])
    lat = Number(c[1])
  }
  const geometry = raw.geometry as { type?: string; coordinates?: unknown } | undefined
  if ((!Number.isFinite(lng) || !Number.isFinite(lat)) && geometry?.type === 'Point' && Array.isArray(geometry.coordinates)) {
    lng = Number(geometry.coordinates[0])
    lat = Number(geometry.coordinates[1])
  }
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
  return {
    id: String(raw.id || `geocode-fallback.${index}`),
    type: 'Feature',
    place_name: String(raw.place_name ?? ''),
    text: String(raw.text ?? ''),
    center: [lng!, lat!],
    context: raw.context as MapboxFeature['context'],
    properties: raw.properties as Record<string, unknown> | undefined,
    geometry,
  }
}

function contextText(ctx: MapboxFeature['context'], prefixes: string[]): string {
  if (!Array.isArray(ctx)) return ''
  for (const p of prefixes) {
    const hit = ctx.find(c => typeof c.id === 'string' && c.id.startsWith(p))
    if (hit?.text) return hit.text
  }
  return ''
}

export function parseMapboxFeature(f: MapboxFeature): ParsedGeocodeResult | null {
  if (!f?.center || !Array.isArray(f.center) || f.center.length < 2) return null
  const [lng, lat] = f.center
  const googleResult = f.properties?.googleResult as any
  const components = Array.isArray(googleResult?.address_components) ? googleResult.address_components : []

  const postalCode = componentText(components, ['postal_code']) || contextText(f.context, ['postcode'])
  const state = componentText(components, ['administrative_area_level_1']) || contextText(f.context, ['region'])
  const city =
    componentText(components, ['locality', 'administrative_area_level_3', 'administrative_area_level_2']) ||
    contextText(f.context, ['place']) ||
    contextText(f.context, ['district'])
  const locality =
    componentText(components, ['sublocality_level_2', 'sublocality_level_1', 'sublocality', 'neighborhood']) ||
    contextText(f.context, ['locality', 'neighborhood'])

  const placeName = String(f.place_name ?? '').trim()
  const route = componentText(components, ['route'])
  const premise = componentText(components, ['premise', 'point_of_interest', 'establishment'])
  const rawText = String(f.text ?? '').trim()
  const streetLine = (rawText && !looksLikePlusCode(rawText) ? rawText : '') || route || premise || firstReadableAddressSegment(placeName)

  return {
    street_line: streetLine,
    locality,
    city,
    state,
    postal_code: postalCode.replace(/\D/g, '').slice(0, 6) || postalCode,
    place_name: placeName,
    longitude: lng,
    latitude: lat,
  }
}

function parsedAddressScore(parsed: ParsedGeocodeResult): number {
  let score = 0
  if (parsed.postal_code.replace(/\D/g, '').length === 6) score += 8
  if (parsed.city.trim()) score += 4
  if (parsed.state.trim()) score += 3
  if (parsed.locality.trim()) score += 2
  if (parsed.street_line.trim()) score += 1
  if (!/^[A-Z0-9+]{4,}\b/i.test(parsed.street_line.trim())) score += 1
  return score
}

export const MAPBOX_FORWARD_MIN_LENGTH = 2

async function geocode(request: Record<string, unknown>): Promise<any[]> {
  await loadGoogleMapsScript()
  const geocoder = new window.google.maps.Geocoder()
  const response = await geocoder.geocode(request)
  return Array.isArray(response?.results) ? response.results : []
}

export async function mapboxForwardGeocode(
  query: string,
  opts: {
    proximity?: { lng: number; lat: number } | null
    limit?: number
    country?: string
    language?: string
    signal?: AbortSignal
  } = {},
): Promise<MapboxFeature[]> {
  if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  const q = query.trim()
  if (q.length < MAPBOX_FORWARD_MIN_LENGTH) return []

  const request: Record<string, unknown> = { address: q }
  if (opts.country?.trim()) request.componentRestrictions = { country: opts.country.trim().toUpperCase() }
  if (opts.proximity && Number.isFinite(opts.proximity.lng) && Number.isFinite(opts.proximity.lat)) {
    request.bounds = {
      east: opts.proximity.lng + 0.2,
      west: opts.proximity.lng - 0.2,
      north: opts.proximity.lat + 0.2,
      south: opts.proximity.lat - 0.2,
    }
  }

  const raw = await geocode(request)
  if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  return raw
    .slice(0, opts.limit ?? 5)
    .map((r, i) => googleResultToFeature(r, i))
    .filter((f): f is MapboxFeature => f != null)
}

async function googleReverseGeocodeViaBackend(
  lng: number,
  lat: number,
  opts?: { language?: string; signal?: AbortSignal },
): Promise<ParsedGeocodeResult | null> {
  const params = new URLSearchParams({
    lng: formatCoord(lng),
    lat: formatCoord(lat),
    language: opts?.language ?? 'en',
  })
  const res = await fetch(`${backendBaseUrl()}/config/reverse-geocode?${params}`, {
    credentials: 'include',
    signal: opts?.signal,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const detail =
      data && typeof data === 'object' && 'detail' in data
        ? String((data as { detail?: unknown }).detail)
        : `${res.status} ${res.statusText}`
    throw new Error(detail)
  }
  return data as ParsedGeocodeResult
}

export async function mapboxReverseGeocode(
  lng: number,
  lat: number,
  opts?: { language?: string; signal?: AbortSignal },
): Promise<ParsedGeocodeResult | null> {
  try {
    const raw = await geocode({ location: { lat, lng } })
    const features = raw.map((r, i) => googleResultToFeature(r, i)).filter((x): x is MapboxFeature => x != null)
    let best: ParsedGeocodeResult | null = null
    let bestScore = -1
    for (const feature of features) {
      const parsed = parseMapboxFeature(feature)
      if (!parsed) continue
      const candidate = { ...parsed, longitude: lng, latitude: lat }
      const score = parsedAddressScore(candidate)
      if (score > bestScore) {
        best = candidate
        bestScore = score
      }
    }
    return best
  } catch (error) {
    try {
      return await googleReverseGeocodeViaBackend(lng, lat, opts)
    } catch {
      throw error
    }
  }
}

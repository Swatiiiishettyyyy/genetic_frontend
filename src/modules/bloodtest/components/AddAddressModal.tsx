import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { flushSync } from 'react-dom'
import type { Address } from '../api/address'
import { saveThyrocareAddress, updateAddress } from '../api/address'
import { checkPincodeServiceability } from '../api/cart'
import {
  getMapboxAccessToken,
  loadGoogleMapsScript,
  MAPBOX_FORWARD_MIN_LENGTH,
  mapboxForwardGeocode,
  mapboxGeocodeErrorMessage,
  mapboxReverseGeocode,
  newMapboxSessionToken,
  parseMapboxFeature,
  type MapboxFeature,
  type ParsedGeocodeResult,
} from '../lib/mapboxGeocode'
import { appendRecentAddressSearch } from '../lib/addressRecentSearches'
import {
  clampThyrocareAddressInputValue,
  getThyrocareAddressLengthStatus,
  type ThyrocareAddressLengthField,
} from '../utils/thyrocareAddressLength'

const MAP_MOVE_DEBOUNCE_MS = 500

const OVERLAY: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
}
/** Full-screen map picker sits above the modal overlay. */
const MAP_FULLSCREEN_SHELL: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  display: 'flex',
  flexDirection: 'column',
  background: '#0f172a',
  boxSizing: 'border-box',
}
const MODAL: React.CSSProperties = {
  background: '#fff',
  borderRadius: 20,
  padding: '22px 22px 18px',
  width: 'min(520px, 100%)',
  maxHeight: 'min(92vh, 900px)',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  boxSizing: 'border-box',
  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.06)',
}
const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #E7E1FF',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  color: '#161616',
  boxSizing: 'border-box',
}
const LABEL: React.CSSProperties = {
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  color: '#414141',
  marginBottom: 4,
  display: 'block',
}
const SECTION_TITLE: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'Inter, sans-serif',
  color: '#111827',
  margin: 0,
  letterSpacing: '-0.01em',
}
const SECTION_DIVIDER: React.CSSProperties = {
  height: 1,
  background: '#F3F4F6',
  margin: '2px 0',
  border: 'none',
}
const FOOTER_ROW: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  marginTop: 4,
  paddingTop: 16,
  borderTop: '1px solid #F3F4F6',
}
const ADDRESS_LENGTH_HELPER: React.CSSProperties = {
  marginTop: -4,
  minHeight: 18,
  fontSize: 12,
  lineHeight: 1.4,
  fontFamily: 'Inter, sans-serif',
}

type Step = 'main' | 'map'

function IconSearchField() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth={2} />
      <path d="M20 20l-3-3" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function IconGps() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function rotateSessionToken(sessionRef: React.MutableRefObject<string>) {
  sessionRef.current = newMapboxSessionToken()
}

export interface AddAddressModalProps {
  open: boolean
  onClose: () => void
  onSaved: (address: Address) => void
  editingAddress?: Address | null
}

export function AddAddressModal({ open, onClose, onSaved, editingAddress }: AddAddressModalProps) {
  const isEditMode = !!editingAddress
  const googleMapsKeyPresent = !!getMapboxAccessToken()

  const [step, setStep] = useState<Step>('main')
  const sessionRef = useRef(newMapboxSessionToken())
  const [userCoords, setUserCoords] = useState<{ lng: number; lat: number } | null>(null)

  const [houseNumber, setHouseNumber] = useState('')
  const [form, setForm] = useState({
    address_label: 'Home' as string,
    custom_label: '',
    street_address: '',
    landmark: '',
    locality: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  })
  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null)
  const [lastSearchQuery, setLastSearchQuery] = useState('')

  const [pincodeCheck, setPincodeCheck] = useState<{
    checking: boolean
    serviceable: boolean | null
    message?: string
  }>({ checking: false, serviceable: null })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const resolvedAddressLabel = useMemo(() => {
    if (form.address_label === 'Other' && form.custom_label.trim()) {
      return `Other — ${form.custom_label.trim()}`
    }
    return form.address_label
  }, [form.address_label, form.custom_label])
  const addressLengthInput = useMemo(
    () => ({
      addressLabel: resolvedAddressLabel,
      houseNumber,
      streetAddress: form.street_address,
      landmark: form.landmark,
      locality: form.locality,
      city: form.city,
      state: form.state,
      country: form.country,
      postalCode: form.postal_code,
    }),
    [
      form.city,
      form.country,
      form.landmark,
      form.locality,
      form.postal_code,
      form.state,
      form.street_address,
      houseNumber,
      resolvedAddressLabel,
    ],
  )
  const addressLengthStatus = useMemo(() => getThyrocareAddressLengthStatus(addressLengthInput), [addressLengthInput])
  const clampAddressField = useCallback(
    (field: ThyrocareAddressLengthField, value: string) => clampThyrocareAddressInputValue(addressLengthInput, field, value),
    [addressLengthInput],
  )
  const clampCustomLabel = useCallback((value: string) => {
    const labelFor = (customLabel: string) => customLabel.trim() ? `Other — ${customLabel.trim()}` : 'Other'
    const candidateStatus = getThyrocareAddressLengthStatus({ ...addressLengthInput, addressLabel: labelFor(value) })
    const currentStatus = getThyrocareAddressLengthStatus(addressLengthInput)
    if (!candidateStatus.isOverLimit || candidateStatus.total <= currentStatus.total) return value

    let lo = 0
    let hi = value.length
    let best = ''
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      const prefix = value.slice(0, mid)
      const status = getThyrocareAddressLengthStatus({ ...addressLengthInput, addressLabel: labelFor(prefix) })
      if (!status.isOverLimit) {
        best = prefix
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return best
  }, [addressLengthInput])
  const addressLengthHelperColor =
    addressLengthStatus.severity === 'over'
      ? '#DC2626'
      : addressLengthStatus.severity === 'near'
        ? '#B45309'
        : '#6B7280'
  const addressLengthHelperText = addressLengthStatus.isOverLimit
    ? `Address is ${Math.abs(addressLengthStatus.remaining)} characters too long for lab booking. Shorten street, landmark, or locality.`
    : addressLengthStatus.severity === 'near'
      ? `Lab booking address: ${addressLengthStatus.total}/${addressLengthStatus.max} characters. Keep it short for home collection.`
      : `Lab booking address: ${addressLengthStatus.total}/${addressLengthStatus.max} characters`

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any | null>(null)
  const mapMarkerRef = useRef<any | null>(null)
  const reverseFromPinRef = useRef<(lng: number, lat: number, opts?: { immediate?: boolean }) => void>(() => {})
  const mapMoveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mapPreview, setMapPreview] = useState<ParsedGeocodeResult | null>(null)
  /** Latest resolved address at the pin (state can lag behind click; confirm reads this). */
  const mapPreviewRef = useRef<ParsedGeocodeResult | null>(null)
  /** After a search pick, forward-parse preview is kept if reverse geocode returns nothing. */
  const keepForwardPreviewRef = useRef(false)
  const [mapLoading, setMapLoading] = useState(false)
  const [mapSearchText, setMapSearchText] = useState('')
  const mapSearchDebounced = useDebouncedValue(mapSearchText, 350)
  const [mapReadyTick, setMapReadyTick] = useState(0)
  const [mapSearchSuggestions, setMapSearchSuggestions] = useState<MapboxFeature[]>([])
  const [mapSearchSuggestLoading, setMapSearchSuggestLoading] = useState(false)
  const [mapSearchSuggestError, setMapSearchSuggestError] = useState<string | null>(null)
  const [mapReverseError, setMapReverseError] = useState<string | null>(null)
  const [mapSearchListOpen, setMapSearchListOpen] = useState(false)
  const mapSearchSuggestAbortRef = useRef<AbortController | null>(null)

  const resetFlow = useCallback(() => {
    setStep('main')
    rotateSessionToken(sessionRef)
    setHouseNumber('')
    setForm({
      address_label: 'Home',
      custom_label: '',
      street_address: '',
      landmark: '',
      locality: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
    })
    setCoords(null)
    setLastSearchQuery('')
    setPincodeCheck({ checking: false, serviceable: null })
    setFormError(null)
    setMapPreview(null)
    mapPreviewRef.current = null
    keepForwardPreviewRef.current = false
    setMapSearchText('')
    setMapSearchSuggestions([])
    setMapSearchSuggestError(null)
    setMapReverseError(null)
    setMapSearchSuggestLoading(false)
    setMapSearchListOpen(false)
    mapSearchSuggestAbortRef.current?.abort()
    mapSearchSuggestAbortRef.current = null
    try {
      mapMarkerRef.current?.setMap?.(null)
    } catch {
      /* noop */
    }
    mapMarkerRef.current = null
    try {
      mapRef.current = null
    } catch {
      /* already removed or container gone */
    }
    mapRef.current = null
    setUserCoords(null)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    resetFlow()
    if (editingAddress) {
      const existingLabel = editingAddress.address_label ?? 'Home'
      let labelValue = 'Home'
      let customLabel = ''
      if (['Home', 'Work'].includes(existingLabel)) {
        labelValue = existingLabel
      } else if (existingLabel.startsWith('Other — ')) {
        labelValue = 'Other'
        customLabel = existingLabel.replace(/^Other — /, '')
      } else {
        labelValue = 'Other'
        customLabel = existingLabel
      }
      setForm(f => ({
        ...f,
        address_label: labelValue,
        custom_label: customLabel,
        street_address: editingAddress.street_address ?? '',
        landmark: editingAddress.landmark ?? '',
        locality: editingAddress.locality ?? '',
        city: editingAddress.city ?? '',
        state: editingAddress.state ?? '',
        postal_code: editingAddress.postal_code ?? '',
        country: editingAddress.country ?? 'India',
      }))
      const pin = (editingAddress.postal_code ?? '').replace(/\D/g, '').slice(0, 6)
      if (pin.length === 6) void verifyPin(pin)
      return
    }
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        const c = { lng: pos.coords.longitude, lat: pos.coords.latitude }
        setUserCoords(c)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    )
  }, [open, resetFlow, editingAddress])

  const applyParsedToForm = useCallback((p: ParsedGeocodeResult, pinCoords?: { lng: number; lat: number } | null) => {
    const readableStreet =
      p.street_line ||
      p.place_name
        .split(',')
        .map(part => part.trim())
        .find(part => part && !/^[23456789CFGHJMPQRVWX]{2,}\w*\+\w{2,}/i.test(part) && !/^\d{6}$/.test(part) && !/^india$/i.test(part)) ||
      ''
    setForm(f => ({
      ...f,
      street_address: readableStreet,
      locality: p.locality,
      city: p.city,
      state: p.state,
      postal_code: String(p.postal_code).replace(/\D/g, '').slice(0, 6),
    }))
    if (
      pinCoords &&
      Number.isFinite(pinCoords.lng) &&
      Number.isFinite(pinCoords.lat)
    ) {
      setCoords({ lng: pinCoords.lng, lat: pinCoords.lat })
    } else {
      setCoords({ lng: p.longitude, lat: p.latitude })
    }
  }, [])

  const verifyPin = useCallback(async (digits: string) => {
    if (digits.length !== 6) {
      setPincodeCheck({ checking: false, serviceable: null })
      return
    }
    setPincodeCheck({ checking: true, serviceable: null })
    try {
      const result = await checkPincodeServiceability(digits)
      setPincodeCheck({ checking: false, serviceable: result.serviceable, message: result.message })
    } catch {
      setPincodeCheck({
        checking: false,
        serviceable: false,
        message: 'Could not verify pincode. Try again.',
      })
    }
  }, [])

  const applyParsedToFormRef = useRef(applyParsedToForm)
  applyParsedToFormRef.current = applyParsedToForm
  const verifyPinRef = useRef(verifyPin)
  verifyPinRef.current = verifyPin

  const openMapStep = () => {
    const go = (lng: number, lat: number) => {
      setCoords({ lng, lat })
      setStep('map')
    }
    if (coords) {
      go(coords.lng, coords.lat)
      return
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const c = { lng: pos.coords.longitude, lat: pos.coords.latitude }
          setUserCoords(c)
          go(c.lng, c.lat)
        },
        () => {
          if (userCoords) {
            go(userCoords.lng, userCoords.lat)
            return
          }
          void resolveMapCenterFromForm(go)
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
      )
      return
    }
    if (userCoords) {
      go(userCoords.lng, userCoords.lat)
      return
    }
    void resolveMapCenterFromForm(go)
  }

  async function resolveMapCenterFromForm(go: (lng: number, lat: number) => void) {
    const parts = [form.locality, form.city, form.state, form.postal_code].filter(s => String(s ?? '').trim())
    const q = parts.join(', ').trim()
    if (q.length >= 3 && getMapboxAccessToken()) {
      try {
        const features = await mapboxForwardGeocode(q, { limit: 1, country: 'IN', language: 'en' })
        const f = features[0]
        if (f?.center?.length === 2) {
          go(f.center[0]!, f.center[1]!)
          return
        }
      } catch {
        /* fall through */
      }
    }
    if (form.city?.trim() && form.state?.trim() && getMapboxAccessToken()) {
      try {
        const features = await mapboxForwardGeocode(`${form.city.trim()}, ${form.state.trim()}, India`, {
          limit: 1,
          country: 'IN',
          language: 'en',
        })
        const f = features[0]
        if (f?.center?.length === 2) {
          go(f.center[0]!, f.center[1]!)
          return
        }
      } catch {
        /* fall through */
      }
    }
    alert('Allow location in the browser, or fill locality / city / pincode so we can center the map.')
  }

  useEffect(() => {
    if (!open || step !== 'map') return
    if (!getMapboxAccessToken() || !mapContainerRef.current || !coords) return
    mapRef.current = null

    let reverseCancelled = false
    let map: any = null
    let marker: any = null
    let dragEndListener: any = null
    const scheduleReverse = (lng: number, lat: number, ropts?: { immediate?: boolean }) => {
      if (mapMoveTimerRef.current) {
        clearTimeout(mapMoveTimerRef.current)
        mapMoveTimerRef.current = null
      }

      const run = async () => {
        if (reverseCancelled) return
        setMapLoading(true)
        try {
          const p = await mapboxReverseGeocode(lng, lat)
          if (reverseCancelled) return
          setCoords({ lng, lat })
          if (p) {
            const hasUsableAddress = !!(p.postal_code || p.city || p.state || p.locality || p.street_line)
            setMapReverseError(hasUsableAddress ? null : 'Google found this pin but did not return address fields. Move the pin slightly or use search.')
            mapPreviewRef.current = p
            setMapPreview(p)
            applyParsedToFormRef.current(p, { lng, lat })
            const pinDigits = String(p.postal_code).replace(/\D/g, '').slice(0, 6)
            if (pinDigits.length === 6) void verifyPinRef.current(pinDigits)
          } else if (!keepForwardPreviewRef.current) {
            mapPreviewRef.current = null
            setMapPreview(null)
          }
        } catch (e: unknown) {
          if (!reverseCancelled) {
            if (!keepForwardPreviewRef.current) {
              mapPreviewRef.current = null
              setMapPreview(null)
            }
            setMapReverseError(mapboxGeocodeErrorMessage(e))
          }
        } finally {
          keepForwardPreviewRef.current = false
          if (!reverseCancelled) setMapLoading(false)
        }
      }

      if (ropts?.immediate) {
        void run()
      } else {
        mapMoveTimerRef.current = setTimeout(() => void run(), MAP_MOVE_DEBOUNCE_MS)
      }
    }
    reverseFromPinRef.current = (lng, lat, ropts) => scheduleReverse(lng, lat, ropts)

    void loadGoogleMapsScript()
      .then(() => {
        if (reverseCancelled || !mapContainerRef.current || !coords) return
        const center = { lat: coords.lat, lng: coords.lng }
        map = new window.google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        })
        mapRef.current = map
        marker = new window.google.maps.Marker({
          position: center,
          map,
          draggable: true,
          title: 'Collection will happen here. Drag the pin to move it.',
        })
        mapMarkerRef.current = marker
        dragEndListener = marker.addListener('dragend', () => {
          keepForwardPreviewRef.current = false
          const pos = marker.getPosition()
          const lat = typeof pos?.lat === 'function' ? pos.lat() : pos?.lat
          const lng = typeof pos?.lng === 'function' ? pos.lng() : pos?.lng
          if (Number.isFinite(lng) && Number.isFinite(lat)) scheduleReverse(lng, lat)
        })
        scheduleReverse(center.lng, center.lat, { immediate: true })
        setMapReadyTick(t => t + 1)
      })
      .catch(() => {
        if (!reverseCancelled) {
          setMapReverseError('Could not load Google Maps. Check the browser API key and allowed referrers.')
          setMapLoading(false)
        }
      })

    return () => {
      reverseCancelled = true
      reverseFromPinRef.current = () => {}
      if (mapMoveTimerRef.current) clearTimeout(mapMoveTimerRef.current)
      try {
        dragEndListener?.remove?.()
        marker?.setMap?.(null)
      } catch {
        /* noop */
      }
      mapMarkerRef.current = null
      if (mapRef.current === map) mapRef.current = null
    }
    /** Only re-init map when opening the map step — not when `coords` updates from form. */
  }, [open, step])

  useEffect(() => {
    if (!open || step !== 'map' || !googleMapsKeyPresent) return
    const q = mapSearchDebounced.trim()
    if (q.length < MAPBOX_FORWARD_MIN_LENGTH) {
      mapSearchSuggestAbortRef.current?.abort()
      setMapSearchSuggestions([])
      setMapSearchSuggestLoading(false)
      setMapSearchSuggestError(null)
      return
    }

    let cancelled = false
    mapSearchSuggestAbortRef.current?.abort()
    const ac = new AbortController()
    mapSearchSuggestAbortRef.current = ac

    const proximity = (() => {
      try {
        const mk = mapMarkerRef.current
        if (mk) {
          const pos = mk.getPosition?.()
          const lat = typeof pos?.lat === 'function' ? pos.lat() : pos?.lat
          const lng = typeof pos?.lng === 'function' ? pos.lng() : pos?.lng
          if (Number.isFinite(lng) && Number.isFinite(lat)) return { lng, lat }
        }
        const m = mapRef.current
        if (m) {
          const c = m.getCenter()
          const lat = typeof c?.lat === 'function' ? c.lat() : c?.lat
          const lng = typeof c?.lng === 'function' ? c.lng() : c?.lng
          if (Number.isFinite(lng) && Number.isFinite(lat)) return { lng, lat }
        }
      } catch {
        /* fall through */
      }
      return userCoords
    })()

    setMapSearchSuggestLoading(true)
    setMapSearchSuggestError(null)
    const run = async () => {
      try {
        const feats = await mapboxForwardGeocode(q, {
          limit: 8,
          proximity,
          country: 'IN',
          language: 'en',
          signal: ac.signal,
        })
        if (cancelled) return
        setMapSearchSuggestions(feats)
      } catch (e: unknown) {
        if (cancelled || (e as { name?: string })?.name === 'AbortError') return
        setMapSearchSuggestions([])
        setMapSearchSuggestError(mapboxGeocodeErrorMessage(e))
      } finally {
        if (!cancelled) setMapSearchSuggestLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [open, step, mapSearchDebounced, googleMapsKeyPresent, userCoords?.lng, userCoords?.lat, mapReadyTick])

  useEffect(() => {
    if (!open || step !== 'map') return
    const onResize = () => {
      const center = mapRef.current?.getCenter?.()
      if (center) mapRef.current?.setCenter?.(center)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open, step, mapReadyTick])

  const locateMeOnMap = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        keepForwardPreviewRef.current = false
        const lng = pos.coords.longitude
        const lat = pos.coords.latitude
        setUserCoords({ lng, lat })
        mapMarkerRef.current?.setPosition?.({ lat, lng })
        mapRef.current?.panTo?.({ lat, lng })
        mapRef.current?.setZoom?.(16)
        reverseFromPinRef.current(lng, lat, { immediate: true })
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
    )
  }, [])

  const goBackFromMap = useCallback(() => {
    setMapSearchText('')
    setMapSearchSuggestions([])
    setMapSearchSuggestError(null)
    setMapReverseError(null)
    setMapSearchListOpen(false)
    mapSearchSuggestAbortRef.current?.abort()
    setStep('main')
  }, [])

  const onPickMapSearchSuggestion = useCallback(
    (f: MapboxFeature) => {
      const [lng, lat] = f.center
      mapMarkerRef.current?.setPosition?.({ lat, lng })
      mapRef.current?.panTo?.({ lat, lng })
      mapRef.current?.setZoom?.(16)
      setMapSearchText(f.text || f.place_name.split(',')[0]?.trim() || f.place_name)
      setMapSearchListOpen(false)

      const parsed = parseMapboxFeature(f)
      if (parsed) {
        setMapReverseError(null)
        const atPin: ParsedGeocodeResult = { ...parsed, longitude: lng, latitude: lat }
        mapPreviewRef.current = atPin
        setMapPreview(atPin)
        applyParsedToForm(atPin, { lng, lat })
        const pinDigits = String(atPin.postal_code).replace(/\D/g, '').slice(0, 6)
        if (pinDigits.length === 6) void verifyPin(pinDigits)
        keepForwardPreviewRef.current = true
      } else {
        keepForwardPreviewRef.current = false
      }
      reverseFromPinRef.current(lng, lat, { immediate: true })
    },
    [applyParsedToForm, verifyPin],
  )

  const confirmMapLocation = async () => {
    const pos = mapMarkerRef.current?.getPosition?.()
    const ll = pos
      ? {
          lng: typeof pos.lng === 'function' ? pos.lng() : pos.lng,
          lat: typeof pos.lat === 'function' ? pos.lat() : pos.lat,
        }
      : null
    const pinCoords =
      ll && Number.isFinite(ll.lng) && Number.isFinite(ll.lat) ? { lng: ll.lng, lat: ll.lat } : null

    let preview = mapPreviewRef.current
    const pinMoved =
      !!preview &&
      !!pinCoords &&
      (Math.abs(preview.longitude - pinCoords.lng) > 1e-6 || Math.abs(preview.latitude - pinCoords.lat) > 1e-6)
    const needsReverseAtPin = !!pinCoords && (!preview || pinMoved)
    if (needsReverseAtPin && pinCoords) {
      try {
        setMapLoading(true)
        preview = await mapboxReverseGeocode(pinCoords.lng, pinCoords.lat)
        mapPreviewRef.current = preview
        setMapPreview(preview)
        const hasUsableAddress = !!(preview?.postal_code || preview?.city || preview?.state || preview?.locality || preview?.street_line)
        setMapReverseError(hasUsableAddress ? null : 'Google found this pin but did not return address fields. Move the pin slightly or use search.')
      } catch (e: unknown) {
        setMapReverseError(mapboxGeocodeErrorMessage(e))
        preview = mapPreviewRef.current
      } finally {
        setMapLoading(false)
      }
    }

    if (preview) {
      flushSync(() => {
        setHouseNumber('')
        applyParsedToForm(preview, pinCoords)
      })
      const digits = String(preview.postal_code).replace(/\D/g, '').slice(0, 6)
      if (digits.length === 6) void verifyPin(digits)
    } else if (pinCoords) {
      setCoords(pinCoords)
      setMapReverseError('Could not detect address details for this pin. Move the pin slightly or use search.')
      return
    }
    setMapSearchText('')
    setMapSearchSuggestions([])
    setMapSearchSuggestError(null)
    setMapReverseError(null)
    setMapSearchListOpen(false)
    mapMarkerRef.current?.setMap?.(null)
    mapMarkerRef.current = null
    if (mapContainerRef.current) mapContainerRef.current.innerHTML = ''
    mapRef.current = null
    setStep('main')
  }

  const handleSave = async () => {
    setFormError(null)
    if (!isEditMode && !houseNumber.trim()) {
      setFormError('Flat / floor number is required.')
      return
    }
    if (!form.street_address.trim() || !form.locality.trim() || !form.city.trim() || !form.state.trim()) {
      setFormError('Street, locality, city, and state are required.')
      return
    }
    const pin = form.postal_code.replace(/\D/g, '').slice(0, 6)
    if (pin.length !== 6) {
      setFormError('Enter a valid 6-digit pincode.')
      return
    }
    if (pincodeCheck.serviceable !== true || pincodeCheck.checking) {
      setFormError('Pincode must be verified for home collection.')
      return
    }
    if (addressLengthStatus.isOverLimit) {
      setFormError(`Address is ${Math.abs(addressLengthStatus.remaining)} characters too long for lab booking. Shorten street, landmark, or locality.`)
      return
    }
    const label = resolvedAddressLabel

    const streetComposed = [houseNumber.trim(), form.street_address.trim()].filter(Boolean).join(', ')

    setSaving(true)
    try {
      const payload: Address = {
        address_id: isEditMode ? editingAddress!.address_id : 0,
        address_label: label,
        street_address: streetComposed,
        landmark: form.landmark,
        locality: form.locality,
        city: form.city,
        state: form.state,
        postal_code: pin,
        country: form.country,
        save_for_future: true,
        ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
      }
      const saved = isEditMode
        ? await updateAddress(editingAddress!.address_id, payload)
        : await saveThyrocareAddress(payload)
      if (!isEditMode && lastSearchQuery.trim()) {
        appendRecentAddressSearch({
          query: lastSearchQuery.trim(),
          place_name: `${streetComposed}, ${form.locality}`,
          lat: coords?.lat,
          lng: coords?.lng,
          street_line: form.street_address,
          locality: form.locality,
          city: form.city,
          state: form.state,
          postal_code: pin,
        })
      }
      onSaved(saved)
      onClose()
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        (err instanceof Error ? err.message : 'Failed to save address.')
      setFormError(String(msg))
    } finally {
      setSaving(false)
    }
  }

  const saveDisabled = saving || pincodeCheck.checking || pincodeCheck.serviceable !== true || addressLengthStatus.isOverLimit

  if (!open) return null

  if (step === 'map' && googleMapsKeyPresent && !coords) {
    return (
      <div
        style={{
          ...MAP_FULLSCREEN_SHELL,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#1e293b',
        }}
      >
        <p style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>Couldn’t load the map. Go back and try again.</p>
        <button
          type="button"
          onClick={goBackFromMap}
          style={{
            marginTop: 16,
            padding: '12px 20px',
            borderRadius: 12,
            border: 'none',
            background: '#8B5CF6',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Back
        </button>
      </div>
    )
  }

  if (step === 'map' && googleMapsKeyPresent && coords) {
    return (
      <div style={MAP_FULLSCREEN_SHELL} role="dialog" aria-modal="true" aria-label="Choose location on map">
        <div style={{ flex: 1, position: 'relative', minHeight: 0, background: '#1e293b' }}>
          <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 2,
              paddingTop: 'max(10px, env(safe-area-inset-top, 0px))',
              paddingLeft: 12,
              paddingRight: 12,
              paddingBottom: 8,
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, pointerEvents: 'auto' }}>
              <button
                type="button"
                onClick={goBackFromMap}
                aria-label="Back to address form"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: 'none',
                  background: '#fff',
                  color: '#5B21B6',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <IconChevronLeft />
              </button>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 3 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#fff',
                    borderRadius: 14,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    paddingLeft: 14,
                    paddingRight: 10,
                    minHeight: 48,
                  }}
                >
                  <input
                    value={mapSearchText}
                    onChange={e => {
                      setMapSearchText(e.target.value)
                      setMapSearchListOpen(true)
                    }}
                    onFocus={() => setMapSearchListOpen(true)}
                    onBlur={() => {
                      window.setTimeout(() => setMapSearchListOpen(false), 200)
                    }}
                    placeholder="Search area, street, landmark…"
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={mapSearchListOpen}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: 'none',
                      outline: 'none',
                      fontSize: 15,
                      fontFamily: 'Inter, sans-serif',
                      color: '#111827',
                      background: 'transparent',
                      padding: '12px 0',
                    }}
                  />
                  {mapSearchText.trim().length > 0 && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        setMapSearchText('')
                        setMapSearchSuggestions([])
                        setMapSearchSuggestError(null)
                      }}
                      style={{
                        border: 'none',
                        background: '#F3F4F6',
                        color: '#6B7280',
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 16,
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  )}
                  <span style={{ display: 'flex', opacity: 0.45, flexShrink: 0 }}>
                    <IconSearchField />
                  </span>
                </div>

                {mapSearchListOpen &&
                  mapSearchText.trim().length < MAPBOX_FORWARD_MIN_LENGTH &&
                  typeof navigator !== 'undefined' &&
                  navigator.geolocation && (
                    <div
                      role="listbox"
                      aria-label="Start with your location"
                      style={{
                        background: '#fff',
                        borderRadius: 14,
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 12px 40px rgba(15, 23, 42, 0.15)',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        role="option"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          locateMeOnMap()
                          setMapSearchListOpen(false)
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 14px',
                          border: 'none',
                          background: '#FAF5FF',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#5B21B6', display: 'flex' }} aria-hidden>
                            <IconGps />
                          </span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Current location</div>
                            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 1.35 }}>
                              Center the map on your device location, then search if needed
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                {mapSearchListOpen && mapSearchText.trim().length >= MAPBOX_FORWARD_MIN_LENGTH && (
                  <div
                    role="listbox"
                    aria-label="Place suggestions"
                    style={{
                      background: '#fff',
                      borderRadius: 14,
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 12px 40px rgba(15, 23, 42, 0.15)',
                      maxHeight: 'min(280px, 42vh)',
                      overflow: 'auto',
                    }}
                  >
                    {mapSearchSuggestLoading && (
                      <div style={{ padding: 14, fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Searching…</div>
                    )}
                    {!mapSearchSuggestLoading && mapSearchSuggestError && (
                      <div style={{ padding: 14, fontSize: 13, color: '#B91C1C', fontFamily: 'Inter, sans-serif' }}>{mapSearchSuggestError}</div>
                    )}
                    {!mapSearchSuggestLoading &&
                      !mapSearchSuggestError &&
                      mapSearchSuggestions.length === 0 && (
                        <div style={{ padding: 14, fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>No results. Try another phrase.</div>
                      )}
                    {mapSearchSuggestions.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        role="option"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => onPickMapSearchSuggestion(f)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 14px',
                          border: 'none',
                          borderBottom: '1px solid #F3F4F6',
                          background: '#fff',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{f.text || f.place_name}</div>
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 1.35 }}>{f.place_name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            background: '#fff',
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            marginTop: -18,
            boxShadow: '0 -12px 40px rgba(15, 23, 42, 0.14)',
            padding: '20px 18px calc(16px + env(safe-area-inset-bottom, 0px))',
            position: 'relative',
            zIndex: 3,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Your location is set to</span>
            <button
              type="button"
              onClick={locateMeOnMap}
              style={{
                border: '1px solid #C4B5FD',
                background: '#FAF5FF',
                color: '#5B21B6',
                fontSize: 12,
                fontWeight: 600,
                padding: '8px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              <IconGps />
              Locate me
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              marginBottom: 16,
              minHeight: 56,
            }}
          >
            <span style={{ color: '#8B5CF6', marginTop: 2, flexShrink: 0 }} aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10z"
                  stroke="currentColor"
                  strokeWidth={2}
                />
                <circle cx="12" cy="11" r="2.5" fill="currentColor" />
              </svg>
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              {mapLoading && <span style={{ color: '#6B7280', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Resolving address…</span>}
              {!mapLoading && mapPreview && (
                <>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: 15, lineHeight: 1.35, fontFamily: 'Inter, sans-serif' }}>
                    {mapPreview.place_name.split(',')[0]?.trim() || mapPreview.place_name}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: '#6B7280', lineHeight: 1.45, fontFamily: 'Inter, sans-serif' }}>
                    {mapPreview.place_name}
                  </div>
                  {mapReverseError && (
                    <div style={{ marginTop: 6, color: '#B45309', fontSize: 12, lineHeight: 1.35, fontFamily: 'Inter, sans-serif' }}>
                      {mapReverseError}
                    </div>
                  )}
                </>
              )}
              {!mapLoading && !mapPreview && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: '#6B7280', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                    Drag the purple pin on the map or pick a search result to set this address.
                  </span>
                  {mapReverseError && (
                    <span style={{ color: '#B45309', fontSize: 12, lineHeight: 1.35, fontFamily: 'Inter, sans-serif' }}>
                      {mapReverseError}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void confirmMapLocation()}
            style={{
              width: '100%',
              height: 50,
              borderRadius: 14,
              border: 'none',
              background: '#8B5CF6',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            Use this location
          </button>
          <button
            type="button"
            onClick={goBackFromMap}
            style={{
              display: 'block',
              width: '100%',
              border: 'none',
              background: 'none',
              color: '#7C3AED',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              padding: '10px',
            }}
          >
            Enter address manually
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={OVERLAY} onClick={() => onClose()}>
      <div style={MODAL} onClick={e => e.stopPropagation()}>
        {step === 'main' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: '#161616',
                    fontFamily: 'Poppins, sans-serif',
                    display: 'block',
                    lineHeight: 1.25,
                  }}
                >
                  {isEditMode ? 'Edit address' : 'Add address'}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 24, color: '#6B7280', lineHeight: 1, padding: 4, flexShrink: 0 }}
              >
                ×
              </button>
            </div>

            {!googleMapsKeyPresent && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: '#B45309',
                  fontFamily: 'Inter, sans-serif',
                  background: '#FFFBEB',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #FDE68A',
                }}
              >
                Set <code style={{ fontSize: 11 }}>VITE_GOOGLE_MAPS_API_KEY</code> in <code style={{ fontSize: 11 }}>.env</code> for search and map. You can still enter the address manually.
              </p>
            )}

            {googleMapsKeyPresent && (
              <button
                type="button"
                onClick={() => openMapStep()}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid #DDD6FE',
                  background: '#FAF5FF',
                  color: '#5B21B6',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <IconGps />
                Choose location on map
              </button>
            )}

            <div style={SECTION_DIVIDER} role="presentation" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={SECTION_TITLE}>Address details</h3>
              {formError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 10, fontSize: 13, color: '#B91C1C' }}>{formError}</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                    <label style={LABEL}>Label *</label>
                    <select
                      aria-label="Address label"
                      style={INPUT}
                      value={form.address_label}
                      onChange={e => setForm(f => ({ ...f, address_label: e.target.value }))}
                    >
                      {['Home', 'Work', 'Other'].map(l => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.address_label === 'Other' && (
                    <div style={{ flex: '2 1 200px', minWidth: 0 }}>
                      <label style={LABEL}>Custom label</label>
                      <input
                        aria-label="Custom label"
                        style={INPUT}
                        value={form.custom_label}
                        onChange={e => setForm(f => ({ ...f, custom_label: clampCustomLabel(e.target.value) }))}
                        placeholder="e.g. Parents’ home"
                      />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 120px', minWidth: 0 }}>
                    <label style={LABEL}>Flat / floor *</label>
                    <input
                      aria-label="Flat / floor"
                      style={INPUT}
                      value={houseNumber}
                      onChange={e => setHouseNumber(clampAddressField('houseNumber', e.target.value))}
                      placeholder="No. / floor"
                    />
                  </div>
                  <div style={{ flex: '2 1 200px', minWidth: 0 }}>
                    <label style={LABEL}>Street *</label>
                    <input
                      aria-label="Street"
                      style={INPUT}
                      value={form.street_address}
                      onChange={e => setForm(f => ({ ...f, street_address: clampAddressField('streetAddress', e.target.value) }))}
                      placeholder="Road / street name"
                    />
                  </div>
                </div>
                <div>
                  <label style={LABEL}>Landmark</label>
                  <input
                    aria-label="Landmark"
                    style={INPUT}
                    value={form.landmark}
                    onChange={e => setForm(f => ({ ...f, landmark: clampAddressField('landmark', e.target.value) }))}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label style={LABEL}>Locality *</label>
                  <input
                    aria-label="Locality"
                    style={INPUT}
                    value={form.locality}
                    onChange={e => setForm(f => ({ ...f, locality: clampAddressField('locality', e.target.value) }))}
                    placeholder="Area / neighbourhood"
                  />
                </div>
                <div
                  aria-live="polite"
                  role={addressLengthStatus.isOverLimit ? 'alert' : 'status'}
                  style={{ ...ADDRESS_LENGTH_HELPER, color: addressLengthHelperColor }}
                >
                  {addressLengthHelperText}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={LABEL}>City *</label>
                    <input
                      aria-label="City"
                      style={INPUT}
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: clampAddressField('city', e.target.value) }))}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={LABEL}>State *</label>
                    <input
                      aria-label="State"
                      style={INPUT}
                      value={form.state}
                      onChange={e => setForm(f => ({ ...f, state: clampAddressField('state', e.target.value) }))}
                    />
                  </div>
                </div>
                <div>
                  <label style={LABEL}>Pincode *</label>
                  <input
                    aria-label="Pincode"
                    style={{ ...INPUT, borderColor: pincodeCheck.serviceable === false ? '#DC2626' : '#E7E1FF' }}
                    value={form.postal_code}
                    onChange={e => {
                      const digits = clampAddressField('postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))
                      setForm(f => ({ ...f, postal_code: digits }))
                      void verifyPin(digits)
                    }}
                    maxLength={6}
                    placeholder="6 digits"
                  />
                  <div style={{ marginTop: 6, minHeight: 18 }}>
                    {pincodeCheck.checking && <span style={{ fontSize: 12, color: '#6B7280' }}>Checking serviceability…</span>}
                    {!pincodeCheck.checking && pincodeCheck.serviceable === true && (
                      <span style={{ fontSize: 12, color: '#059669' }}>✓ Home collection available</span>
                    )}
                    {!pincodeCheck.checking && pincodeCheck.serviceable === false && (
                      <span style={{ fontSize: 12, color: '#DC2626' }}>✗ {pincodeCheck.message ?? 'Not serviceable'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={FOOTER_ROW}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 12,
                  border: '1px solid #E7E1FF',
                  background: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saveDisabled}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 12,
                  border: 'none',
                  background: saveDisabled ? '#E7E1FF' : '#8B5CF6',
                  color: saveDisabled ? '#828282' : '#fff',
                  cursor: saveDisabled ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {saving ? 'Saving…' : isEditMode ? 'Update address' : 'Save address'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function useDebouncedValue<T>(value: T, ms: number): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

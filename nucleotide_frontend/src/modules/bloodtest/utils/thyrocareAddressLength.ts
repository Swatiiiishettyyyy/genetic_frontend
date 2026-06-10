export const THYROCARE_ADDRESS_MAX = 175
export const THYROCARE_ADDRESS_MIN = 25
export const THYROCARE_ADDRESS_NEAR_LIMIT = 150

export type ThyrocareAddressLengthSeverity = 'short' | 'ok' | 'near' | 'over'

export interface ThyrocareAddressLengthInput {
  addressLabel?: unknown
  houseNumber?: unknown
  streetAddress?: unknown
  landmark?: unknown
  locality?: unknown
  city?: unknown
  state?: unknown
  country?: unknown
  postalCode?: unknown
}

export interface EstimatedThyrocareAddressParts {
  houseNo: string
  street: string
  addressLine1: string
  addressLine2: string
  landmark: string
  city: string
  state: string
  country: string
  pincode: string
}

export interface ThyrocareAddressLengthStatus {
  total: number
  max: number
  remaining: number
  isTooShort: boolean
  isOverLimit: boolean
  severity: ThyrocareAddressLengthSeverity
}

export type ThyrocareAddressLengthField = keyof ThyrocareAddressLengthInput

export function normalizeAddressPart(value: unknown): string {
  return String(value ?? '')
    .replace(/[\s,]*,[\s,]*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/^,\s*|\s*,\s*$/g, '')
    .trim()
}

function joinAddressParts(parts: unknown[], separator: string): string {
  return normalizeAddressPart(parts.map(normalizeAddressPart).filter(Boolean).join(separator))
}

export function buildEstimatedThyrocareAddressParts(input: ThyrocareAddressLengthInput): EstimatedThyrocareAddressParts {
  const houseNo = normalizeAddressPart(input.addressLabel)
  const street = joinAddressParts([input.houseNumber, input.streetAddress], ', ')
  const landmark = normalizeAddressPart(input.landmark)
  const locality = normalizeAddressPart(input.locality)
  const city = normalizeAddressPart(input.city)
  const state = normalizeAddressPart(input.state)
  const country = normalizeAddressPart(input.country)
  const pincode = normalizeAddressPart(input.postalCode)

  return {
    // The backend currently maps address_label to Thyrocare houseNo.
    houseNo,
    // The saved street_address currently prepends Flat / floor before Street.
    street,
    // Mirrors services/thyrocare/thyrocare_booking.py addressLine1 composition.
    addressLine1: joinAddressParts([houseNo, street, landmark, city], ' '),
    // Estimate a secondary line from landmark, falling back to locality for user guidance.
    addressLine2: landmark || locality,
    landmark,
    city,
    state,
    country,
    pincode,
  }
}

export function getThyrocareAddressLengthStatus(input: ThyrocareAddressLengthInput): ThyrocareAddressLengthStatus {
  const parts = buildEstimatedThyrocareAddressParts(input)
  const total = Object.values(parts).reduce((sum, part) => sum + part.length, 0)
  const remaining = THYROCARE_ADDRESS_MAX - total
  const isTooShort = total > 0 && total < THYROCARE_ADDRESS_MIN
  const isOverLimit = total > THYROCARE_ADDRESS_MAX
  const severity: ThyrocareAddressLengthSeverity = isOverLimit
    ? 'over'
    : total >= THYROCARE_ADDRESS_NEAR_LIMIT
      ? 'near'
      : isTooShort
        ? 'short'
        : 'ok'

  return {
    total,
    max: THYROCARE_ADDRESS_MAX,
    remaining,
    isTooShort,
    isOverLimit,
    severity,
  }
}

export function clampThyrocareAddressInputValue(
  input: ThyrocareAddressLengthInput,
  field: ThyrocareAddressLengthField,
  nextValue: unknown,
): string {
  const raw = String(nextValue ?? '')
  const candidateInput = { ...input, [field]: raw }
  const candidateStatus = getThyrocareAddressLengthStatus(candidateInput)
  if (!candidateStatus.isOverLimit) return raw

  const currentTotal = getThyrocareAddressLengthStatus(input).total
  if (candidateStatus.total <= currentTotal) return raw

  let lo = 0
  let hi = raw.length
  let best = ''

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const prefix = raw.slice(0, mid)
    const status = getThyrocareAddressLengthStatus({ ...input, [field]: prefix })
    if (!status.isOverLimit) {
      best = prefix
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return best
}

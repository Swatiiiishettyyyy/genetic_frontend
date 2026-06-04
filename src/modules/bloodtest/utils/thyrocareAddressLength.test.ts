import { describe, expect, it } from 'vitest'
import {
  THYROCARE_ADDRESS_MAX,
  buildEstimatedThyrocareAddressParts,
  clampThyrocareAddressInputValue,
  getThyrocareAddressLengthStatus,
  normalizeAddressPart,
} from './thyrocareAddressLength'

describe('thyrocareAddressLength', () => {
  it('calculates an under-limit address', () => {
    const status = getThyrocareAddressLengthStatus({
      addressLabel: 'Home',
      houseNumber: '1st Floor',
      streetAddress: 'Old Madras Rd',
      landmark: '',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560038',
    })

    expect(status.total).toBeLessThanOrEqual(THYROCARE_ADDRESS_MAX)
    expect(status.isOverLimit).toBe(false)
    expect(status.severity).toBe('ok')
  })

  it('flags the failed long address as over the Thyrocare limit', () => {
    const status = getThyrocareAddressLengthStatus({
      addressLabel: 'Home',
      streetAddress: '1st Floor, Salapuria Adonis, 315 work avenue, 648/1/J, Old Madras Rd, Binnamangala, Hoysala Nagar,, Old Madras Road',
      landmark: '',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560038',
    })

    expect(status.total).toBeGreaterThan(THYROCARE_ADDRESS_MAX)
    expect(status.isOverLimit).toBe(true)
    expect(status.severity).toBe('over')
  })

  it('handles an empty optional landmark without adding phantom characters', () => {
    const parts = buildEstimatedThyrocareAddressParts({
      addressLabel: 'Work',
      houseNumber: '42',
      streetAddress: 'MG Road',
      landmark: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560001',
    })

    expect(parts.addressLine2).toBe('')
    expect(parts.landmark).toBe('')
  })

  it('normalizes repeated commas and whitespace before counting', () => {
    expect(normalizeAddressPart('  Hoysala Nagar,,   Old   Madras Road,  ')).toBe('Hoysala Nagar, Old Madras Road')

    const noisy = getThyrocareAddressLengthStatus({
      addressLabel: 'Home',
      streetAddress: 'Old   Madras   Rd,,',
      landmark: '  Near   Metro,, Gate  2 ',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560038',
    })
    const normalized = getThyrocareAddressLengthStatus({
      addressLabel: 'Home',
      streetAddress: 'Old Madras Rd',
      landmark: 'Near Metro, Gate 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560038',
    })

    expect(noisy.total).toBe(normalized.total)
  })

  it('clamps pasted input to the longest value that fits the total limit', () => {
    const base = {
      addressLabel: 'Home',
      houseNumber: '1st Floor',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560038',
    }
    const longStreet = 'Salapuria Adonis, 315 work avenue, 648/1/J, Old Madras Rd, Binnamangala, Hoysala Nagar, Old Madras Road'
    const clamped = clampThyrocareAddressInputValue(base, 'streetAddress', longStreet)
    const status = getThyrocareAddressLengthStatus({ ...base, streetAddress: clamped })

    expect(clamped.length).toBeLessThan(longStreet.length)
    expect(status.total).toBeLessThanOrEqual(THYROCARE_ADDRESS_MAX)
  })

  it('allows shortening an already over-limit address', () => {
    const overLimit = {
      addressLabel: 'Home',
      streetAddress: '1st Floor, Salapuria Adonis, 315 work avenue, 648/1/J, Old Madras Rd, Binnamangala, Hoysala Nagar,, Old Madras Road',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560038',
    }

    expect(getThyrocareAddressLengthStatus(overLimit).isOverLimit).toBe(true)
    expect(clampThyrocareAddressInputValue(overLimit, 'streetAddress', 'Old Madras Rd')).toBe('Old Madras Rd')
  })
})

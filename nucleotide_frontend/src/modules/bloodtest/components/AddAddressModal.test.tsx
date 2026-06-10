import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { AddAddressModal } from './AddAddressModal'
import { checkPincodeServiceability } from '../api/cart'

vi.mock('../../../shared/lib/mapboxGeocode', () => ({
  MAPBOX_FORWARD_MIN_LENGTH: 3,
  getMapboxAccessToken: () => '',
  loadGoogleMapsScript: vi.fn(),
  mapboxForwardGeocode: vi.fn(),
  mapboxGeocodeErrorMessage: () => 'Could not search for this address.',
  mapboxReverseGeocode: vi.fn(),
  newMapboxSessionToken: () => 'test-session-token',
  parseMapboxFeature: vi.fn(),
}))

vi.mock('../api/address', () => ({
  saveThyrocareAddress: vi.fn(),
  updateAddress: vi.fn(),
}))

vi.mock('../api/cart', () => ({
  checkPincodeServiceability: vi.fn(),
}))

function renderAddressModal(props: Partial<ComponentProps<typeof AddAddressModal>> = {}) {
  return render(
    <AddAddressModal
      open
      onClose={vi.fn()}
      onSaved={vi.fn()}
      {...props}
    />,
  )
}

async function fillServiceableBaseAddress(streetAddress = 'Old Madras Rd') {
  fireEvent.change(screen.getByLabelText('Flat / floor'), { target: { value: '1st Floor' } })
  fireEvent.change(screen.getByLabelText('Locality'), { target: { value: 'Indiranagar' } })
  fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Bengaluru' } })
  fireEvent.change(screen.getByLabelText('State'), { target: { value: 'Karnataka' } })
  fireEvent.change(screen.getByLabelText('Pincode'), { target: { value: '560038' } })
  fireEvent.change(screen.getByLabelText('Street'), { target: { value: streetAddress } })

  await waitFor(() => {
    expect(checkPincodeServiceability).toHaveBeenCalledWith('560038')
  })
  await screen.findByText(/Home collection available/i)
}

const overLimitEditingAddress = {
  address_id: 1,
  address_label: 'Home',
  street_address: '1st Floor, Salapuria Adonis, 315 work avenue, 648/1/J, Old Madras Rd, Binnamangala, Hoysala Nagar,, Old Madras Road',
  landmark: '',
  locality: 'Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  postal_code: '560038',
  country: 'India',
  save_for_future: true,
}

describe('AddAddressModal address length guidance', () => {
  beforeEach(() => {
    vi.mocked(checkPincodeServiceability).mockResolvedValue({
      serviceable: true,
      message: 'Home collection available',
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows a live lab booking address character count', () => {
    renderAddressModal()

    fireEvent.change(screen.getByLabelText('Street'), { target: { value: 'Old Madras Rd' } })

    expect(screen.getByText(/Lab booking address: \d+\/175 characters/i)).toBeInTheDocument()
  })

  it('stops accepting pasted characters once the total address reaches the limit', async () => {
    renderAddressModal()

    const longStreet = 'Salapuria Adonis, 315 work avenue, 648/1/J, Old Madras Rd, Binnamangala, Hoysala Nagar,, Old Madras Road'
    await fillServiceableBaseAddress(longStreet)

    const streetInput = screen.getByLabelText('Street') as HTMLInputElement
    expect(streetInput.value.length).toBeLessThan(longStreet.length)
    expect(screen.getByText(/Lab booking address: \d+\/175 characters/i)).toBeInTheDocument()
    expect(screen.queryByText(/too long for lab booking/i)).not.toBeInTheDocument()
  })

  it('shows an over-limit prompt and disables save for an existing long address', async () => {
    renderAddressModal({ editingAddress: overLimitEditingAddress })

    expect(screen.getByText(/Address is \d+ characters too long for lab booking/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Update address/i })).toBeDisabled()
  })

  it('re-enables save after shortening the address under the limit', async () => {
    renderAddressModal({ editingAddress: overLimitEditingAddress })

    await screen.findByText(/Home collection available/i)
    const saveButton = screen.getByRole('button', { name: /Update address/i })
    expect(saveButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Street'), { target: { value: 'Old Madras Rd' } })

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled()
    })
  })
})

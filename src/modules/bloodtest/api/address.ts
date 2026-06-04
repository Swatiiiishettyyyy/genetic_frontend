import { api } from '../../../shared/api/client'

export interface Address {
  address_id: number
  address_label: string
  street_address: string
  landmark?: string
  locality: string
  city: string
  state: string
  postal_code: string
  country: string
  save_for_future?: boolean
  /** Optional: from map search / device; backend may ignore. */
  latitude?: number
  longitude?: number
}


export async function fetchAddresses(): Promise<Address[]> {
  const res = await api.get<Address[]>('/addresses/')
  const list = Array.isArray(res) ? res : []
  return list.map((a: any) => ({
    address_id:     a.id,
    address_label:  a.label ?? '',
    street_address: a.line1 ?? '',
    landmark:       a.landmark,
    locality:       a.line2 ?? '',
    city:           a.city,
    state:          a.state,
    postal_code:    a.pincode ?? '',
    country:        a.country ?? 'India',
    save_for_future: a.save_for_future,
  }))
}

export async function saveAddress(data: Address): Promise<Address> {
  return _saveAddressToEndpoint('/thyrocare/address/save', data)
}

export async function saveThyrocareAddress(data: Address): Promise<Address> {
  return _saveAddressToEndpoint('/thyrocare/address/save', data)
}

export async function updateAddress(addressId: number, data: Omit<Address, 'address_id'>): Promise<Address> {
  const payload: Record<string, unknown> = {
    label:    data.address_label,
    line1:    data.street_address,
    line2:    data.locality,
    pincode:  data.postal_code,
    city:     data.city,
    state:    data.state,
    landmark: data.landmark ?? '',
  }
  const res = await api.put<any>(`/addresses/${addressId}`, payload)
  const a = res.data ?? res
  return {
    address_id:     a.id ?? addressId,
    address_label:  a.label ?? data.address_label,
    street_address: a.line1 ?? data.street_address,
    landmark:       a.landmark,
    locality:       a.line2 ?? data.locality,
    city:           a.city ?? data.city,
    state:          a.state ?? data.state,
    postal_code:    a.pincode ?? data.postal_code,
    country:        a.country ?? data.country,
    save_for_future: a.save_for_future,
  }
}

export async function deleteAddress(addressId: number): Promise<void> {
  await api.delete<any>(`/addresses/${addressId}`)
}

async function _saveAddressToEndpoint(endpoint: string, data: Address): Promise<Address> {
  const payload: Record<string, unknown> = {
    address_id: 0,
    address_label: data.address_label,
    street_address: data.street_address,
    landmark: data.landmark ?? '',
    locality: data.locality,
    city: data.city,
    state: data.state,
    postal_code: data.postal_code,
    country: data.country,
    save_for_future: true,
  }
  if (data.latitude != null && Number.isFinite(data.latitude)) payload.latitude = data.latitude
  if (data.longitude != null && Number.isFinite(data.longitude)) payload.longitude = data.longitude
  const res = await api.post<any>(endpoint, payload)
  const a = res.data ?? res
  return {
    address_id: a.address_id,
    address_label: a.address_label,
    street_address: a.street_address,
    landmark: a.landmark,
    locality: a.locality ?? data.locality,
    city: a.city,
    state: a.state,
    postal_code: a.postal_code,
    country: a.country,
    save_for_future: a.save_for_future,
  }
}

import { api } from './client'

export interface ServiceabilityResult {
  serviceable: boolean
  message?: string
}

type ServiceabilityResponse = {
  serviceable?: boolean
  is_serviceable?: boolean
  status?: string
  message?: string
  data?: {
    serviceable?: boolean
    is_serviceable?: boolean
    message?: string
  }
}

export async function checkPincodeServiceability(pincode: string): Promise<ServiceabilityResult> {
  const res = await api.get<ServiceabilityResponse>(
    `/thyrocare/check-serviceable?pincode=${encodeURIComponent(pincode)}`,
  )
  const serviceable =
    res?.serviceable === true ||
    res?.is_serviceable === true ||
    res?.data?.serviceable === true ||
    res?.data?.is_serviceable === true ||
    res?.status === 'serviceable'

  return { serviceable, message: res?.message ?? res?.data?.message }
}

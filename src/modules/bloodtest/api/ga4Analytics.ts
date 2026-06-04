import { api } from '../../../shared/api/client'

export interface Ga4AuditItem {
  item_id?: string
  thyrocare_product_id?: number
  item_name?: string
  item_brand?: string
  item_category?: string
  item_variant?: string
  item_list_name?: string
  item_list_id?: string
  index?: number
  price?: number
  quantity?: number
  coupon?: string
  discount?: number
}

export interface Ga4AuditPayload {
  client_event_id: string
  event_name: string
  fingerprint?: string
  cart_id?: number
  order_id?: number
  order_number?: string | null
  razorpay_order_id?: string
  razorpay_payment_id?: string
  transaction_id?: string
  currency?: string
  value?: number
  coupon?: string
  payment_type?: string
  affiliation?: string
  page_location?: string
  page_referrer?: string
  user_agent?: string
  ecommerce: Record<string, unknown>
  items: Ga4AuditItem[]
}

export async function recordGa4EcommerceEvent(payload: Ga4AuditPayload): Promise<void> {
  await api.post('/analytics/ga4/events', payload)
}

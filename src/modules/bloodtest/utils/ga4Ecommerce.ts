import type { CartItem, TestCardProps } from '../types'
import { recordGa4EcommerceEvent, type Ga4AuditItem } from '../api/ga4Analytics'
import { getDeviceId } from '../../../shared/utils/deviceUtil'
import { parseMoney } from './money'

export type Ga4EcommerceEventName =
  | 'select_item'
  | 'view_item'
  | 'add_to_cart'
  | 'view_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'add_shipping_info'
  | 'add_appointment_info'
  | 'add_payment_info'
  | 'purchase'

export interface Ga4ItemInput {
  thyrocareProductId?: number
  name: string
  type: 'Package' | 'Single'
  price: string | number
  quantity?: number
  analyticsListName?: string
  analyticsListId?: string
  analyticsIndex?: number
  coupon?: string | null
  discount?: number | null
}

export interface Ga4EventOptions {
  value?: number
  coupon?: string | null
  discount?: number | null
  paymentType?: string
  cartId?: number | null
  orderId?: number | null
  orderNumber?: string | null
  razorpayOrderId?: string | null
  razorpayPaymentId?: string | null
  transactionId?: string | null
  affiliation?: string
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

const CURRENCY = 'INR'
const BRAND = 'Nucleotide'
const CATEGORY = 'Blood Test'
const AFFILIATION = 'Nucleotide Store'

function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function cleanNumber(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

function cleanPositiveInt(value: unknown): number | undefined {
  const n = Math.floor(typeof value === 'number' ? value : Number(value))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function clientEventId(eventName: Ga4EcommerceEventName): string {
  return `${eventName}:${Date.now()}:${Math.random().toString(36).slice(2, 12)}`
}

function itemVariant(type: Ga4ItemInput['type']): string {
  return type === 'Package' ? 'Package Blood Test' : 'Individual Blood Test'
}

function itemId(productId: number | undefined): string | undefined {
  return productId != null && Number.isFinite(productId) && productId > 0 ? `BT_${productId}` : undefined
}

export function ga4ItemFromInput(input: Ga4ItemInput): Ga4AuditItem {
  const productId = cleanPositiveInt(input.thyrocareProductId)
  const price = cleanNumber(parseMoney(input.price))
  const quantity = cleanPositiveInt(input.quantity) ?? 1
  return {
    item_id: itemId(productId),
    thyrocare_product_id: productId,
    item_name: cleanString(input.name),
    item_brand: BRAND,
    item_category: CATEGORY,
    item_variant: itemVariant(input.type),
    item_list_name: cleanString(input.analyticsListName),
    item_list_id: cleanString(input.analyticsListId),
    index: cleanPositiveInt(input.analyticsIndex),
    price,
    quantity,
    coupon: cleanString(input.coupon),
    discount: cleanNumber(input.discount),
  }
}

export function ga4ItemFromTestCard(test: TestCardProps, overrides: Partial<Ga4ItemInput> = {}): Ga4AuditItem {
  return ga4ItemFromInput({
    thyrocareProductId: test.thyrocareProductId,
    name: test.name,
    type: test.type,
    price: test.price,
    quantity: test.quantity ?? 1,
    analyticsListName: test.analyticsListName,
    analyticsListId: test.analyticsListId,
    analyticsIndex: test.analyticsIndex,
    ...overrides,
  })
}

export function ga4ItemsFromCart(
  items: CartItem[],
  defaults: { listName?: string; listId?: string; coupon?: string | null; discount?: number | null } = {},
): Ga4AuditItem[] {
  return items.map((item, idx) =>
    ga4ItemFromInput({
      thyrocareProductId: item.thyrocareProductId,
      name: item.name,
      type: item.type,
      price: item.price,
      quantity: item.quantity,
      analyticsListName: defaults.listName,
      analyticsListId: defaults.listId,
      analyticsIndex: idx + 1,
      coupon: defaults.coupon,
      discount: defaults.discount,
    }),
  )
}

function compact<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function dataLayerItem(item: Ga4AuditItem): Record<string, unknown> {
  return compact({
    item_id: item.item_id,
    item_name: item.item_name,
    affiliation: AFFILIATION,
    coupon: item.coupon,
    discount: item.discount,
    index: item.index,
    item_brand: item.item_brand,
    item_category: item.item_category,
    item_list_id: item.item_list_id,
    item_list_name: item.item_list_name,
    item_variant: item.item_variant,
    price: item.price,
    quantity: item.quantity,
  })
}

export function trackGa4EcommerceEvent(
  eventName: Ga4EcommerceEventName,
  items: Ga4AuditItem[],
  options: Ga4EventOptions = {},
): void {
  if (typeof window === 'undefined') return

  const cleanItems = items.filter(item => cleanString(item.item_name))
  if (cleanItems.length === 0) return

  const eventId = clientEventId(eventName)
  const ecommerce = compact({
    currency: CURRENCY,
    value: cleanNumber(options.value),
    coupon: cleanString(options.coupon),
    payment_type: cleanString(options.paymentType),
    transaction_id: cleanString(options.transactionId),
    affiliation: cleanString(options.affiliation) ?? AFFILIATION,
    items: cleanItems.map(dataLayerItem),
  })

  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ ecommerce: null })
  window.dataLayer.push({ event: eventName, ecommerce })

  const payload = compact({
    client_event_id: eventId,
    event_name: eventName,
    fingerprint: getDeviceId(),
    cart_id: options.cartId ?? undefined,
    order_id: options.orderId ?? undefined,
    order_number: cleanString(options.orderNumber),
    razorpay_order_id: cleanString(options.razorpayOrderId),
    razorpay_payment_id: cleanString(options.razorpayPaymentId),
    transaction_id: cleanString(options.transactionId),
    currency: CURRENCY,
    value: cleanNumber(options.value),
    coupon: cleanString(options.coupon),
    payment_type: cleanString(options.paymentType),
    affiliation: cleanString(options.affiliation) ?? AFFILIATION,
    page_location: window.location.href,
    page_referrer: document.referrer || undefined,
    user_agent: navigator.userAgent || undefined,
    ecommerce,
    items: cleanItems,
  })

  recordGa4EcommerceEvent(payload as unknown as Parameters<typeof recordGa4EcommerceEvent>[0]).catch(() => {})
}

export function cartValue(items: CartItem[]): number {
  return Math.round(
    items.reduce((sum, item) => {
      const qty = cleanPositiveInt(item.quantity) ?? 1
      return sum + parseMoney(item.price) * qty
    }, 0),
  )
}

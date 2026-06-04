import type { CartItem, TestCardProps } from '../types'
import type { UserData } from '../../../shared/auth/authStorage'
import type { MemberProfile } from '../../../shared/auth/memberService'
import { parseMoney } from './money'

export type Ga4CustomEventName =
  | 'top_nav_menu_click'
  | 'home_tab_change'
  | 'genetic_login_explore'
  | 'blood_login_explore'
  | 'footer_link_click'
  | 'social_icon_click'
  | 'subscribe_to_email'
  | 'bt_top_nav_login'
  | 'bt_top_nav_cart'
  | 'top_nav_report_searched'
  | 'blood_test_click'
  | 'bt_sub_tab_change'
  | 'bt_key_test_category_click'
  | 'bt_comp_package_card_click'
  | 'bt_view_all_packages'
  | 'bt_book_test'
  | 'bt_metrics_tab_change'
  | 'bt_metrics_card_click'
  | 'bt_parameter_tab_click'
  | 'bt_order_tab_change'
  | 'bt_order_card_click'
  | 'mobile_popup_view'
  | 'mobile_num_continue'
  | 'mobile_num_otp_verified'
  | 'mobile_num_otp_invalid'
  | 'add_member_continue'
  | 'logout_click'
  | 'explore_packages_click'
  | 'bt_add_to_cart'
  | 'bt_cart_continue'
  | 'bt_address_continue'
  | 'bt_back_click'
  | 'bt_appointment_continue'
  | 'bt_apply_coupon_click'
  | 'bt_place_order_continue'
  | 'bt_payment_success'
  | 'bt_payment_failure'
  | 'bt_payment_pending'

export type Ga4CustomEventParams = Record<string, string | number | boolean | undefined | null>

type AuthSnapshot = {
  isLoggedIn?: boolean
  user?: UserData | null
  currentMember?: MemberProfile | null
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

const BRAND = 'Nucleotide'
const CATEGORY = 'Blood Test'

function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function cleanNumber(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

function compact(params: Ga4CustomEventParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Record<string, string | number | boolean>
}

const USER_KEYS = new Set(['userID', 'leadID', 'userType', 'custType', 'userProfile', 'gender'])
const PRODUCT_KEYS = new Set([
  'testType',
  'testIncluded',
  'testCategory',
  'testCollection',
  'testFor',
  'testTimeSlot',
  'prodName',
  'prodCategory',
  'prodPrice',
  'prodID',
  'prodBrand',
  'prodVarient',
  'prodQuantity',
])

function pdfPayload(event: Ga4CustomEventName, params: Ga4CustomEventParams): Record<string, unknown> {
  const cleanParams = compact(params)
  const product: Ga4CustomEventParams = {}
  const user: Ga4CustomEventParams = {}
  const data: Ga4CustomEventParams = {}

  Object.entries(cleanParams).forEach(([key, value]) => {
    if (PRODUCT_KEYS.has(key)) {
      product[key] = value
    } else if (USER_KEYS.has(key)) {
      user[key] = value
    } else {
      data[key] = value
    }
  })

  return compact({
    event,
    product: Object.keys(product).length ? compact(product) : undefined,
    user: Object.keys(user).length ? compact(user) : undefined,
    data: Object.keys(data).length ? compact(data) : undefined,
  } as Ga4CustomEventParams)
}

function normalizeGender(gender: unknown): string | undefined {
  const value = cleanString(gender)
  if (!value) return undefined
  const upper = value.toUpperCase()
  if (upper === 'M') return 'Male'
  if (upper === 'F') return 'Female'
  if (upper === 'O') return 'Other'
  return value
}

function normalizeProfile(member: MemberProfile | null | undefined): string | undefined {
  return cleanString(member?.relation) ?? (member ? 'Self' : undefined)
}

function productId(productIdValue: number | undefined): string | undefined {
  return productIdValue != null && Number.isFinite(productIdValue) && productIdValue > 0
    ? `BT_${productIdValue}`
    : undefined
}

export function ga4CustomUserParams(auth: AuthSnapshot): Ga4CustomEventParams {
  const userId = cleanString(auth.user?.id)
  return {
    userID: userId ? `U_${userId}` : undefined,
    userType: auth.isLoggedIn ? 'logged-in' : 'guest',
    custType: auth.user?.is_new_user === true ? 'New' : auth.isLoggedIn ? 'Existing' : undefined,
    userProfile: normalizeProfile(auth.currentMember),
    gender: normalizeGender(auth.currentMember?.gender),
  }
}

export function ga4CustomProductParams(input: TestCardProps | CartItem): Ga4CustomEventParams {
  const price = cleanNumber(parseMoney(input.price))
  const quantity = 'quantity' in input ? cleanNumber(input.quantity) : undefined
  const tests = 'tests' in input ? cleanNumber(input.tests) : undefined
  return {
    testType: input.type,
    testIncluded: tests,
    testCategory: input.type,
    testCollection: 'Home Collection',
    prodName: cleanString(input.name),
    prodCategory: CATEGORY,
    prodPrice: price,
    prodID: productId(input.thyrocareProductId),
    prodBrand: BRAND,
    prodVarient: input.fasting,
    prodQuantity: quantity,
  }
}

export function ga4CustomCartParams(items: CartItem[]): Ga4CustomEventParams {
  if (items.length === 0) return {}
  const names = items.map(item => cleanString(item.name)).filter(Boolean).join(', ')
  const ids = items.map(item => productId(item.thyrocareProductId)).filter(Boolean).join(', ')
  const types = [...new Set(items.map(item => item.type).filter(Boolean))].join(', ')
  const quantity = items.reduce((sum, item) => sum + (cleanNumber(item.quantity) ?? 1), 0)
  const value = items.reduce((sum, item) => sum + parseMoney(item.price) * (cleanNumber(item.quantity) ?? 1), 0)
  return {
    testType: types,
    testIncluded: items.length,
    testCategory: types,
    testCollection: 'Home Collection',
    prodName: names,
    prodCategory: CATEGORY,
    prodPrice: Math.round(value),
    prodID: ids,
    prodBrand: BRAND,
    prodVarient: types,
    prodQuantity: quantity,
  }
}

export function trackGa4CustomEvent(event: Ga4CustomEventName, params: Ga4CustomEventParams = {}): void {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(pdfPayload(event, params))
}

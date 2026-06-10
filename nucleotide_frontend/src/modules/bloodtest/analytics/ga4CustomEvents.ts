import type { CartItem, TestCardProps } from '../types'
import {
  cleanGa4Number,
  cleanGa4String,
  ga4CustomUserParams,
  trackGa4CustomEvent as trackSharedGa4CustomEvent,
  type Ga4CustomEventParams,
} from '../../../shared/analytics/ga4CustomEvents'
import { parseMoney } from '../utils/money'

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

const BRAND = 'Nucleotide'
const CATEGORY = 'Blood Test'

function productId(productIdValue: number | undefined): string | undefined {
  return productIdValue != null && Number.isFinite(productIdValue) && productIdValue > 0
    ? `BT_${productIdValue}`
    : undefined
}

export { ga4CustomUserParams }

export function ga4CustomProductParams(input: TestCardProps | CartItem): Ga4CustomEventParams {
  const price = cleanGa4Number(parseMoney(input.price))
  const quantity = 'quantity' in input ? cleanGa4Number(input.quantity) : undefined
  const tests = 'tests' in input ? cleanGa4Number(input.tests) : undefined
  return {
    testType: input.type,
    testIncluded: tests,
    testCategory: input.type,
    testCollection: 'Home Collection',
    prodName: cleanGa4String(input.name),
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
  const names = items.map(item => cleanGa4String(item.name)).filter(Boolean).join(', ')
  const ids = items.map(item => productId(item.thyrocareProductId)).filter(Boolean).join(', ')
  const types = [...new Set(items.map(item => item.type).filter(Boolean))].join(', ')
  const quantity = items.reduce((sum, item) => sum + (cleanGa4Number(item.quantity) ?? 1), 0)
  const value = items.reduce((sum, item) => sum + parseMoney(item.price) * (cleanGa4Number(item.quantity) ?? 1), 0)
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
  trackSharedGa4CustomEvent(event, params)
}

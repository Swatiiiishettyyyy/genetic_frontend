export const minimumCheckoutTotal = 19999;
const GENETIC_DUMMY_PRODUCT_ID_BASE = 900001;

export function getPanelPriceValue(panel) {
  return Number(panel.price.replace(/[^\d]/g, "")) || 0;
}

export function formatInr(value) {
  return `\u20B9${value.toLocaleString("en-IN")}`;
}

export function buildGeneticCheckoutSession(selectedPanels) {
  const panels = selectedPanels;
  const cartItems = panels.map((panel, index) => {
    const priceValue = getPanelPriceValue(panel);
    return {
      thyrocareProductId: GENETIC_DUMMY_PRODUCT_ID_BASE + index,
      name: `${panel.title} Genetic Test`,
      type: "Package",
      price: formatInr(priceValue),
      originalPrice: formatInr(priceValue),
      quantity: 1,
      maxBeneficiaries: 6,
    };
  });

  return {
    checkoutKind: "genetic-test",
    cartItems,
    groups: cartItems.map((item) => ({
      group_id: `genetic-${item.thyrocareProductId}`,
      thyrocare_product_id: item.thyrocareProductId,
      product_name: item.name,
      member_ids: [],
      address_id: null,
      appointment_date: "",
      appointment_start_time: "",
      appointment_time_hourly: "",
      items: [],
    })),
    netPayableAmount: cartItems.reduce((sum, item) => sum + getPanelPriceValue(item), 0),
    thyrocarePricing: null,
    pricingSnapshotKey: null,
    checkoutSyncError: null,
  };
}
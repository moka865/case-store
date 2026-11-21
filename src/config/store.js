/**
 * Single placeholder store configuration constant.
 * Swap name, pricing, production window, or defaults here without touching any UI component.
 */
export const STORE_CONFIG = {
  name: 'غلاف',
  currencyLabel: 'ج.م',
  currencyCode: 'EGP',
  paymentMethod: 'cash_on_delivery',
  paymentLabelAr: 'الدفع عند الاستلام',
  customCasePrice: 320,
  productionDays: 2,
  defaultMaterialId: 'matte-hard-shell',
  defaultPreviewModelId: 'iphone-16-pro',
  /**
   * Demo-only handoff flag for local JSON export into `../case-store-admin`.
   * Flip to `false` (or remove the block) once a real backend API exists.
   */
  DEMO_HANDOFF: true,
};

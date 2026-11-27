/**
 * Single store configuration constant.
 * Swap name, pricing, namePrintFee, production window, contact details, or defaults here without touching UI components.
 */
export const STORE_CONFIG = {
  name: 'غلاف',
  taglineAr: 'طبعات قاهرية على مقاس موبايلك بالملّي',
  siteUrl: 'https://ghilaf.eg',
  currencyLabel: 'ج.م',
  currencyCode: 'EGP',
  paymentMethod: 'cash_on_delivery',
  paymentLabelAr: 'الدفع عند الاستلام',
  customCasePrice: 320,
  namePrintFee: 50,
  productionDays: 2,
  defaultMaterialId: 'matte-hard-shell',
  defaultPreviewModelId: 'iphone-16-pro',
  contact: {
    supportNoteAr: 'خدمة العملاء بتكلمك تأكد الموديل والعنوان قبل الطباعة',
    hoursAr: 'يومياً ١١ ص – ١٠ م',
  },
  /**
   * Demo-only handoff flag for local JSON export into `../case-store-admin`.
   * Flip to `false` (or remove the block) once a real backend API exists.
   */
  DEMO_HANDOFF: true,
};

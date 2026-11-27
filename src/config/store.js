/**
 * Single store configuration constant.
 * Swap name, pricing, namePrintFee, production window, contact details, or defaults here without touching UI components.
 */
export const STORE_CONFIG = {
  name: 'غلاف',
  taglineAr: 'طبعات قاهرية على مقاس موبايلك بالملي',
  siteUrl: 'https://ghilaf.eg',
  currencyLabel: 'ج.م',
  currencyCode: 'EGP',
  paymentMethod: 'cash_on_delivery',
  paymentLabelAr: 'الدفع عند الاستلام',
  customCasePrice: 320,
  namePrintFee: 50,
  productionDays: 2,
  /** Maximum order execution window stated in the Terms & Conditions page. */
  maxProductionDays: 7,
  /** Orders with this many pieces or more require an upfront deposit (see Terms page). */
  depositMinItems: 4,
  defaultMaterialId: 'matte-hard-shell',
  defaultPreviewModelId: 'iphone-16-pro',
  contact: {
    supportNoteAr: 'خدمة العملاء بتكلمك تأكد الموديل والعنوان قبل الطباعة',
    hoursAr: 'يوميا ١١ ص – ١٠ م',
  },
  /**
   * Social profile links shown in the Footer and the Terms page.
   * PLACEHOLDERS: replace each '#' with the real profile URL (e.g. 'https://instagram.com/ghilaf').
   * While a value is '#', the icon renders but clicking it does nothing.
   */
  social: {
    instagram: '#',
    facebook: '#',
    tiktok: '#',
  },
  /**
   * Demo-only handoff flag for local JSON export into `../case-store-admin`.
   * Flip to `false` (or remove the block) once a real backend API exists.
   */
  DEMO_HANDOFF: true,
};

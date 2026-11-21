import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../components/common/PageHeading';
import { ChevronDownIcon } from '../components/icons/Icons';
import { PhoneCaseMockup } from '../components/mockup/PhoneCaseMockup';
import { STORE_CONFIG } from '../config/store';
import { useStore } from '../context/StoreContext';
import {
  EGYPT_MOBILE_REGEX,
  computeTotalDeliveryDays,
} from '../contracts/handoffSchema';
import { storeService } from '../services/storeService';

function OrderItemsList({ items, allPhoneModels, fallbackModel }) {
  const resolveModel = (printSpec) => {
    if (printSpec?.phoneModelId) {
      const found = allPhoneModels.find((m) => m.id === printSpec.phoneModelId);
      if (found) return found;
    }
    return fallbackModel;
  };

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const spec = item.printSpec;
        const itemModel = resolveModel(spec);
        const hasCustomImage = Boolean(spec?.designSource?.imageUrl);
        const printedName = spec?.printedName?.enabled ? spec.printedName : null;

        return (
          <li key={item.cartItemId || item.id} className="flex items-start gap-3.5 text-start">
            <div className="w-[46px] shrink-0">
              <PhoneCaseMockup
                model={itemModel}
                artworkId={spec?.designSource?.artworkId || null}
                customImage={
                  hasCustomImage
                    ? {
                        url: spec.designSource.imageUrl,
                        ...spec.imageTransform,
                      }
                    : null
                }
                printedName={printedName}
                className="w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[15px] font-semibold text-[var(--charcoal)]">
                  <bdi dir="ltr">{item.name || item.title}</bdi>
                </p>
                <span className="shrink-0 text-[14px] font-semibold tabular-nums text-[var(--charcoal)]">
                  {(item.price ?? item.unitPrice) * item.quantity} {STORE_CONFIG.currencyLabel}
                </span>
              </div>

              <p className="type-caption text-[13px]">
                {spec?.phoneModelStatus === 'pending' ? (
                  <span>
                    موديلك بيتأكد:{' '}
                    <bdi dir="ltr">{spec.phoneModelName}</bdi>
                  </span>
                ) : (
                  <bdi dir="ltr">{spec?.phoneModelName || item.phoneModelName || itemModel.name}</bdi>
                )}
                {item.quantity > 1 ? (
                  <span className="ms-2 tabular-nums">× {item.quantity}</span>
                ) : null}
              </p>

              {printedName?.text ? (
                <p className="type-caption text-[13px] text-[var(--charcoal)]">
                  الاسم:{' '}
                  <bdi dir={printedName.script === 'latin' ? 'ltr' : 'rtl'}>
                    {printedName.text}
                  </bdi>
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Real COD Checkout & Order Confirmation page (`/checkout`).
 * - Desktop: Asymmetric 7-col open plaster form + 5-col sticky gallery-white receipt
 * - Mobile: Collapsible summary bar at top (total always visible) so form stays above the fold
 */
export function CheckoutPage() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    governorates,
    allPhoneModels,
    visualPreviewModel,
    placeOrder,
  } = useStore();

  const firstCodGov = useMemo(
    () => governorates.find((g) => g.codAvailable) || governorates[0],
    [governorates]
  );

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [governorateId, setGovernorateId] = useState(firstCodGov?.id || '');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile summary collapsed by default so delivery form sits above the fold
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState('');

  const selectedGov = useMemo(
    () => governorates.find((g) => g.id === governorateId) || null,
    [governorates, governorateId]
  );

  const unavailableGovs = useMemo(
    () => governorates.filter((g) => !g.codAvailable),
    [governorates]
  );

  const hasPendingModel = useMemo(
    () => cartItems.some((item) => item.printSpec?.phoneModelStatus === 'pending'),
    [cartItems]
  );

  const shippingFee = selectedGov?.codAvailable ? selectedGov.shippingFee : 0;
  const orderTotal = cartSubtotal + shippingFee;
  const totalEstimatedDays = selectedGov
    ? computeTotalDeliveryDays(STORE_CONFIG.productionDays, selectedGov.estimatedDays)
    : `${STORE_CONFIG.productionDays + 2}-${STORE_CONFIG.productionDays + 4}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (fullName.trim().length < 3) {
      nextErrors.fullName = 'اكتب اسمك بالكامل عشان المندوب يعرف يتواصل معاك.';
    }
    const cleanMobile = mobileNumber.replace(/\s+/g, '');
    if (!EGYPT_MOBILE_REGEX.test(cleanMobile)) {
      nextErrors.mobileNumber =
        'اكتب رقم موبايل مصري صحيح من 11 رقم بيبدأ بـ 010 أو 011 أو 012 أو 015.';
    }
    if (!selectedGov || !selectedGov.codAvailable) {
      nextErrors.governorateId =
        'اختار محافظة متاح فيها الدفع عند الاستلام عشان نقدر نشحنلك.';
    }
    if (address.trim().length < 8) {
      nextErrors.address = 'اكتب العنوان بالتفصيل (المنطقة، الشارع، ورقم العمارة أو الشقة).';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const res = await placeOrder({
        fullName,
        mobileNumber: cleanMobile,
        governorateId: selectedGov.id,
        address,
        notes,
      });

      if (!res.ok) {
        setSubmitError(res.error || 'حصل مشكلة أثناء حفظ الطلب. جرّب تاني.');
        return;
      }

      setConfirmedOrder(res.order);
      window.scrollTo({ top: 0, behavior: 'auto' });
      requestAnimationFrame(() => {
        const heading = document.querySelector('main h1');
        if (heading instanceof HTMLElement) heading.focus({ preventScroll: true });
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Demo-only handoff download (guarded behind STORE_CONFIG.DEMO_HANDOFF).
   * Remove once storefront and admin share a live backend API.
   */
  const handleDemoExportOrder = async () => {
    if (!STORE_CONFIG.DEMO_HANDOFF || !confirmedOrder) return;
    const res = await storeService.buildDemoHandoffEnvelope(confirmedOrder);
    if (!res) return;

    const blob = new Blob([res.serialized], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${confirmedOrder.id}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloadStatus(res.sizeWarning || 'تم تنزيل ملف الطلب.');
  };

  // ---------- Confirmation View ----------
  if (confirmedOrder) {
    return (
      <section className="py-12 md:py-24">
        <div className="page-container">
          <div className="max-w-[60ch] text-start">
            <PageHeading
              title="تم استلام طلبك"
              description="خدمة العملاء هتكلمك لتأكيد الطلب قبل الطباعة."
            />

            <p className="mt-6 text-[24px] font-bold text-[var(--charcoal)] sm:text-[28px]">
              رقم الطلب:{' '}
              <bdi dir="ltr" className="latin-title">
                {confirmedOrder.id}
              </bdi>
            </p>

            {confirmedOrder.pendingModel ? (
              <p className="mt-4 rounded-[4px] bg-[var(--gallery-white)] px-4 py-3 text-[15px] font-medium text-[var(--charcoal)]">
                موديل موبايلك لسه بيتأكد — خدمة العملاء هتكلمك لتأكيد المقاس قبل الطباعة.
              </p>
            ) : null}

            {/* Snapshot summary directly on --plaster (zero cards, zero middle dots) */}
            <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <dt className="type-caption text-[13px]">الإجمالي ({STORE_CONFIG.paymentLabelAr})</dt>
                <dd className="mt-1 text-[22px] font-bold tabular-nums text-[var(--charcoal)]">
                  {confirmedOrder.pricing.total} {STORE_CONFIG.currencyLabel}
                </dd>
                <dd className="type-caption mt-0.5 text-[13px] tabular-nums">
                  شامل {confirmedOrder.pricing.shippingFee} {STORE_CONFIG.currencyLabel} شحن لـ{' '}
                  {confirmedOrder.customer.governorateNameAr}
                </dd>
              </div>

              <div>
                <dt className="type-caption text-[13px]">التوصيل المتوقع</dt>
                <dd className="mt-1 text-[20px] font-bold tabular-nums text-[var(--charcoal)]">
                  خلال {confirmedOrder.customer.estimatedTotalDays} أيام عمل
                </dd>
                <dd className="type-caption mt-0.5 text-[13px] tabular-nums">
                  يشمل {STORE_CONFIG.productionDays} يوم طباعة وتجهيز
                </dd>
              </div>

              <div>
                <dt className="type-caption text-[13px]">بيانات التوصيل</dt>
                <dd className="mt-1 text-[16px] font-semibold text-[var(--charcoal)]">
                  {confirmedOrder.customer.fullName}
                </dd>
                <dd className="type-caption mt-0.5 text-[13px]">
                  <bdi dir="ltr">{confirmedOrder.customer.mobileNumber}</bdi>
                </dd>
              </div>
            </dl>

            {/* Primary & secondary navigation + Demo-only JSON export */}
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link to="/categories" className="btn-primary">
                شوف الجرابات
              </Link>
              <Link to="/" className="btn-secondary">
                ارجع للرئيسية
              </Link>
              {STORE_CONFIG.DEMO_HANDOFF ? (
                <button
                  type="button"
                  onClick={handleDemoExportOrder}
                  className="btn-secondary text-[var(--graphite)]"
                >
                  نزّل ملف الطلب (JSON)
                </button>
              ) : null}
            </div>

            {downloadStatus ? (
              <p role="status" className="type-caption mt-3 text-[13px]">
                {downloadStatus}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  // ---------- Empty Cart State ----------
  if (cartItems.length === 0) {
    return (
      <section className="py-16 md:py-28">
        <div className="page-container">
          <PageHeading
            title="سلتك فاضية دلوقتي"
            description="اختار تصميم من الجرابات أو ارفع صورتك وصمّم جرابك الأول عشان تكمل الطلب."
          />
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link to="/categories" className="btn-primary">
              شوف الجرابات
            </Link>
            <Link to="/customize" className="btn-secondary">
              صمم جرابك
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ---------- Main Checkout View ----------
  return (
    <div className="pt-6 pb-16 md:pt-12 md:pb-28">
      <div className="page-container">
        <PageHeading
          title="تأكيد الطلب"
          description="اكتب بيانات التوصيل وهنكلمك نأكد الأوردر قبل الطباعة. الدفع كاش عند الاستلام."
        />

        {/* Mobile-only collapsible summary bar (collapsed by default so form sits above the fold) */}
        <div className="mt-6 rounded-[4px] bg-[var(--gallery-white)] p-4 lg:hidden">
          <button
            type="button"
            aria-expanded={mobileSummaryOpen}
            onClick={() => setMobileSummaryOpen((prev) => !prev)}
            className="flex min-h-[44px] w-full items-center justify-between gap-3 text-start cursor-pointer"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold text-[var(--charcoal)]">
                ملخص طلبك ({cartCount})
              </span>
              <span className="type-caption text-[13px]">
                {mobileSummaryOpen ? 'إخفاء' : 'عرض التفاصيل'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold tabular-nums text-[var(--charcoal)]">
                {orderTotal} {STORE_CONFIG.currencyLabel}
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 text-[var(--charcoal)] transition-transform duration-200 ${
                  mobileSummaryOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {mobileSummaryOpen ? (
            <div className="mt-4 space-y-4 pt-2">
              <OrderItemsList
                items={cartItems}
                allPhoneModels={allPhoneModels}
                fallbackModel={visualPreviewModel}
              />
              <div className="space-y-1.5 pt-2 text-[14px]">
                <div className="flex justify-between text-[var(--graphite)]">
                  <span>المنتجات</span>
                  <span className="tabular-nums">
                    {cartSubtotal} {STORE_CONFIG.currencyLabel}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--graphite)]">
                  <span>الشحن ({selectedGov?.nameAr || '—'})</span>
                  <span className="tabular-nums">
                    {shippingFee} {STORE_CONFIG.currencyLabel}
                  </span>
                </div>
                <p className="type-caption pt-1 text-[13px]">
                  التوصيل المتوقع خلال {totalEstimatedDays} أيام عمل ({STORE_CONFIG.paymentLabelAr})
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Asymmetric 7 + 5 Desktop Grid */}
        <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-12">
          {/* START COLUMN (7 cols): Delivery form directly on --plaster */}
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-6 text-start lg:col-span-7"
          >
            {hasPendingModel ? (
              <div
                role="status"
                className="rounded-[4px] bg-[var(--gallery-white)] px-4 py-3.5 text-[15px] font-medium text-[var(--charcoal)]"
              >
                موديل موبايلك لسه بيتأكد — خدمة العملاء هتكلمك قبل الطباعة.
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="checkout-name"
                  className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
                >
                  الاسم بالكامل
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors((p) => ({ ...p, fullName: undefined }));
                  }}
                  placeholder="مثلاً: أحمد سامي محمود"
                  aria-invalid={Boolean(errors.fullName)}
                  className="min-h-[48px] w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] px-3.5 text-[15px] text-[var(--charcoal)] placeholder:text-[var(--graphite)]"
                />
                {errors.fullName ? (
                  <p className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">
                    {errors.fullName}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="checkout-mobile"
                  className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
                >
                  رقم الموبايل
                </label>
                <input
                  id="checkout-mobile"
                  type="tel"
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={11}
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value.replace(/[^\d]/g, '').slice(0, 11));
                    setErrors((p) => ({ ...p, mobileNumber: undefined }));
                  }}
                  placeholder="01012345678"
                  aria-invalid={Boolean(errors.mobileNumber)}
                  className="min-h-[48px] w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] px-3.5 text-start text-[15px] tabular-nums text-[var(--charcoal)] placeholder:text-[var(--graphite)]"
                />
                {errors.mobileNumber ? (
                  <p className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">
                    {errors.mobileNumber}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label
                htmlFor="checkout-gov"
                className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
              >
                المحافظة
              </label>
              <select
                id="checkout-gov"
                value={governorateId}
                onChange={(e) => {
                  setGovernorateId(e.target.value);
                  setErrors((p) => ({ ...p, governorateId: undefined }));
                }}
                aria-invalid={Boolean(errors.governorateId)}
                className="min-h-[48px] w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] px-3.5 text-[15px] text-[var(--charcoal)]"
              >
                {governorates.map((gov) => (
                  <option key={gov.id} value={gov.id} disabled={!gov.codAvailable}>
                    {gov.codAvailable
                      ? `${gov.nameAr} — شحن ${gov.shippingFee} ${STORE_CONFIG.currencyLabel} (${gov.estimatedDays} أيام)`
                      : `${gov.nameAr} — الدفع عند الاستلام غير متاح حالياً`}
                  </option>
                ))}
              </select>
              {unavailableGovs.length > 0 ? (
                <p className="type-caption mt-1.5 text-[13px]">
                  الدفع المتاح حالياً هو الدفع عند الاستلام فقط، والمحافظات غير المتاحة مقفولة
                  مؤقتاً.
                </p>
              ) : null}
              {errors.governorateId ? (
                <p className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">
                  {errors.governorateId}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="checkout-address"
                className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
              >
                العنوان بالتفصيل
              </label>
              <textarea
                id="checkout-address"
                rows={3}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setErrors((p) => ({ ...p, address: undefined }));
                }}
                placeholder="المنطقة، اسم الشارع، رقم العمارة والدور والشقة، وعلامة مميزة"
                aria-invalid={Boolean(errors.address)}
                className="w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] p-3.5 text-[15px] leading-[1.6] text-[var(--charcoal)] placeholder:text-[var(--graphite)]"
              />
              {errors.address ? (
                <p className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">
                  {errors.address}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="checkout-notes"
                className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
              >
                ملاحظات للمندوب (اختياري)
              </label>
              <input
                id="checkout-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلاً: كلمني قبل ما توصل بنص ساعة"
                className="min-h-[48px] w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] px-3.5 text-[15px] text-[var(--charcoal)] placeholder:text-[var(--graphite)]"
              />
            </div>

            {submitError ? (
              <p role="alert" className="text-[14px] font-medium text-[var(--klein)]">
                {submitError}
              </p>
            ) : null}

            {/* Mobile primary CTA right below form */}
            <div className="pt-2 lg:hidden">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full tabular-nums"
              >
                {isSubmitting
                  ? 'بنجهز طلبك...'
                  : `أكّد الطلب — ${orderTotal} ${STORE_CONFIG.currencyLabel}`}
              </button>
              <p className="type-caption mt-2.5 text-center text-[13px]">
                {STORE_CONFIG.paymentLabelAr} — التوصيل خلال {totalEstimatedDays} أيام عمل
              </p>
            </div>
          </form>

          {/* END COLUMN (5 cols, desktop sticky): Gallery-white COD receipt */}
          <aside className="hidden rounded-[4px] bg-[var(--gallery-white)] p-7 text-start lg:sticky lg:top-[104px] lg:col-span-5 lg:block">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="type-h3 text-[var(--charcoal)]">ملخص طلبك</h2>
              <span className="type-caption tabular-nums">{cartCount} قطع</span>
            </div>

            <div className="mt-6">
              <OrderItemsList
                items={cartItems}
                allPhoneModels={allPhoneModels}
                fallbackModel={visualPreviewModel}
              />
            </div>

            <div className="mt-7 space-y-2.5 pt-4 text-[15px]">
              <div className="flex items-baseline justify-between text-[var(--graphite)]">
                <span>إجمالي المنتجات</span>
                <span className="tabular-nums text-[var(--charcoal)]">
                  {cartSubtotal} {STORE_CONFIG.currencyLabel}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-[var(--graphite)]">
                <span>الشحن ({selectedGov?.nameAr || '—'})</span>
                <span className="tabular-nums text-[var(--charcoal)]">
                  {shippingFee} {STORE_CONFIG.currencyLabel}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-3">
                <span className="text-[17px] font-bold text-[var(--charcoal)]">الإجمالي</span>
                <span className="text-[22px] font-bold tabular-nums text-[var(--charcoal)]">
                  {orderTotal} {STORE_CONFIG.currencyLabel}
                </span>
              </div>
            </div>

            <p className="type-caption mt-4 text-[13px]">
              {STORE_CONFIG.paymentLabelAr}. التوصيل المتوقع خلال {totalEstimatedDays} أيام عمل
              (شامل {STORE_CONFIG.productionDays} يوم طباعة وتجهيز).
            </p>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="btn-primary mt-6 w-full"
            >
              {isSubmitting ? 'بنجهز طلبك...' : 'أكّد الطلب'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

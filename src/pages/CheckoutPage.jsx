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
import { computeItemPricing } from '../utils/pricing';

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
        const spec = item.printSpec || {};
        const itemModel = resolveModel(spec);
        const hasCustomImage =
          Boolean(spec?.designSource?.imageUrl) &&
          !String(spec.designSource.imageUrl).startsWith('idb://');
        const pricing = computeItemPricing(item);
        const printedName = pricing.hasName ? spec.printedName : null;

        return (
          <li
            key={item.cartItemId || item.id}
            className="flex items-start gap-3.5 border-b border-[var(--border-subtle)] pb-3.5 last:border-b-0 last:pb-0 text-start"
          >
            <div className="product-stage w-[50px] shrink-0 p-1.5">
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
                interactive={false}
                className="w-full"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[15px] font-bold text-[var(--ink)]">
                  <bdi dir="ltr" className="latin-title">{item.name || item.title}</bdi>
                </p>
                <span className="shrink-0 text-[14.5px] font-extrabold tabular-nums text-[var(--ink)]">
                  {pricing.lineTotal} {STORE_CONFIG.currencyLabel}
                </span>
              </div>

              <p className="type-caption text-[12.5px]">
                {spec?.phoneModelStatus === 'pending' ? (
                  <span>
                    موديل بيتأكد:{' '}
                    <bdi dir="ltr" className="font-semibold text-[var(--ink)]">
                      {spec.phoneModelName || item.phoneModelName}
                    </bdi>
                  </span>
                ) : (
                  <>
                    الموبايل:{' '}
                    <bdi dir="ltr" className="latin-title font-semibold text-[var(--ink)]">
                      {spec?.phoneModelName || item.phoneModelName || itemModel.name}
                    </bdi>
                  </>
                )}
                {pricing.quantity > 1 ? (
                  <span className="ms-2 font-semibold tabular-nums text-[var(--ink)]">
                    × {pricing.quantity}
                  </span>
                ) : null}
              </p>

              {printedName?.text ? (
                <p className="type-caption text-[12.5px] text-[var(--ink)]">
                  الاسم على الجراب:{' '}
                  <bdi dir={printedName.script === 'latin' ? 'ltr' : 'rtl'} className="font-bold">
                    {printedName.text}
                  </bdi>
                </p>
              ) : null}

              {/* Separate price breakdown per line */}
              <div className="space-y-0.5 pt-0.5 text-[12px] text-[var(--ink-muted)] tabular-nums">
                <div className="flex justify-between">
                  <span>سعر الجراب</span>
                  <span>
                    {pricing.designUnitPrice} {STORE_CONFIG.currencyLabel}
                    {pricing.quantity > 1 ? ` × ${pricing.quantity}` : ''}
                  </span>
                </div>
                {pricing.hasName ? (
                  <div className="flex justify-between font-semibold text-[var(--ink)]">
                    <span>طباعة الاسم</span>
                    <span>
                      +{pricing.unitNameFee} {STORE_CONFIG.currencyLabel}
                      {pricing.quantity > 1 ? ` × ${pricing.quantity}` : ''}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * COD Checkout & Order Confirmation page (`/checkout`).
 * Displays per-line phone models, printed names, and separated design / +50 EGP name fees
 * across the mobile summary, desktop receipt, and final order confirmation.
 */
export function CheckoutPage() {
  const {
    cartItems,
    cartCount,
    cartDesignSubtotal,
    cartNameFeesSubtotal,
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
        setSubmitError(res.error || 'حصل مشكلة أثناء حفظ الطلب. جرب تاني.');
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
    const confirmedDesignSubtotal =
      confirmedOrder.pricing.designSubtotal ??
      confirmedOrder.pricing.subtotal - (confirmedOrder.pricing.namePrintFees || 0);
    const confirmedNameFees = confirmedOrder.pricing.namePrintFees || 0;

    return (
      <section className="page-band-single">
        <div className="page-container">
          <div className="text-start">
            <PageHeading
              title="تم استلام طلبك"
              description="خدمة العملاء هتكلمك لتأكيد الطلب قبل الطباعة."
            />

            <p className="mt-4 text-[22px] font-bold text-[var(--ink)] sm:text-[26px]">
              رقم الطلب:{' '}
              <bdi dir="ltr" className="latin-title">
                {confirmedOrder.id}
              </bdi>
            </p>

            {confirmedOrder.pendingModel ? (
              <p className="mt-4 max-w-[60ch] rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--brand-yellow-tint)] px-4 py-3 text-[14.5px] font-semibold text-[var(--ink)]">
                فيه موديل موبايل في طلبك لسه بيتأكد — خدمة العملاء هتكلمك لتأكيد المقاس قبل الطباعة.
              </p>
            ) : null}

            <div className="mt-[var(--heading-to-content)] grid grid-cols-1 items-start gap-7 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
              {/* Ordered Items with per-line model, name, and separated fees */}
              <div className="rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 sm:p-6 lg:col-span-7">
                <h2 className="type-h3 mb-4 text-[var(--ink)]">تفاصيل القطع المطلوبة</h2>
                <OrderItemsList
                  items={confirmedOrder.items}
                  allPhoneModels={allPhoneModels}
                  fallbackModel={visualPreviewModel}
                />
              </div>

              {/* Stored Pricing & Delivery Snapshot */}
              <div className="space-y-5 rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 sm:p-6 lg:col-span-5">
                <h2 className="type-h3 text-[var(--ink)]">ملخص الحساب والتوصيل</h2>

                <dl className="space-y-2 text-[14.5px] tabular-nums">
                  <div className="flex justify-between text-[var(--ink-muted)]">
                    <dt>سعر الجرابات</dt>
                    <dd className="font-semibold text-[var(--ink)]">
                      {confirmedDesignSubtotal} {STORE_CONFIG.currencyLabel}
                    </dd>
                  </div>

                  {confirmedNameFees > 0 ? (
                    <div className="flex justify-between text-[var(--ink-muted)]">
                      <dt>طباعة الأسماء</dt>
                      <dd className="font-semibold text-[var(--ink)]">
                        +{confirmedNameFees} {STORE_CONFIG.currencyLabel}
                      </dd>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-[var(--ink-muted)]">
                    <dt>الشحن ({confirmedOrder.customer.governorateNameAr})</dt>
                    <dd className="font-semibold text-[var(--ink)]">
                      {confirmedOrder.pricing.shippingFee} {STORE_CONFIG.currencyLabel}
                    </dd>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-3">
                    <dt className="text-[16.5px] font-bold text-[var(--ink)]">
                      الإجمالي ({STORE_CONFIG.paymentLabelAr})
                    </dt>
                    <dd className="text-[22px] font-extrabold text-[var(--ink)]">
                      {confirmedOrder.pricing.total} {STORE_CONFIG.currencyLabel}
                    </dd>
                  </div>
                </dl>

                <div className="space-y-1 border-t border-[var(--border-subtle)] pt-4 text-[13.5px] text-[var(--ink-muted)]">
                  <p className="font-semibold text-[var(--ink)]">
                    {confirmedOrder.customer.fullName} ·{' '}
                    <bdi dir="ltr">{confirmedOrder.customer.mobileNumber}</bdi>
                  </p>
                  <p>
                    {confirmedOrder.customer.governorateNameAr} — {confirmedOrder.customer.address}
                  </p>
                  <p className="tabular-nums">
                    التوصيل المتوقع خلال {confirmedOrder.customer.estimatedTotalDays} أيام عمل
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/categories" className="btn-primary">
                شوف الجرابات
              </Link>
              <Link to="/" className="btn-outline">
                ارجع للرئيسية
              </Link>
              {STORE_CONFIG.DEMO_HANDOFF ? (
                <button
                  type="button"
                  onClick={handleDemoExportOrder}
                  className="btn-secondary text-[var(--ink-muted)]"
                >
                  نزل ملف الطلب (JSON)
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
      <section className="page-band-single">
        <div className="page-container">
          <PageHeading
            title="سلتك فاضية دلوقتي"
            description="اختار تصميم من الجرابات أو ارفع صورتك وصمم جرابك الأول عشان تكمل الطلب."
          />
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link to="/categories" className="btn-primary">
              شوف الجرابات
            </Link>
            <Link to="/customize" className="btn-outline">
              صمم جرابك
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ---------- Main Checkout View ----------
  return (
    <div className="page-band-single">
      <div className="page-container">
        <PageHeading
          title="تأكيد الطلب"
          description="اكتب بيانات التوصيل وهنكلمك نأكد الأوردر قبل الطباعة. الدفع كاش عند الاستلام."
        />

        {/* Mobile collapsible summary */}
        <div className="mt-6 rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-4 lg:hidden">
          <button
            type="button"
            aria-expanded={mobileSummaryOpen}
            onClick={() => setMobileSummaryOpen((prev) => !prev)}
            className="flex min-h-[44px] w-full items-center justify-between gap-3 text-start cursor-pointer"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-[var(--ink)]">
                ملخص طلبك ({cartCount})
              </span>
              <span className="type-caption text-[13px]">
                {mobileSummaryOpen ? 'إخفاء' : 'عرض التفاصيل'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-extrabold tabular-nums text-[var(--ink)]">
                {orderTotal} {STORE_CONFIG.currencyLabel}
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 text-[var(--ink)] transition-transform duration-200 ${
                  mobileSummaryOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {mobileSummaryOpen ? (
            <div className="mt-4 space-y-4 border-t border-[var(--border-subtle)] pt-4">
              <OrderItemsList
                items={cartItems}
                allPhoneModels={allPhoneModels}
                fallbackModel={visualPreviewModel}
              />
              <div className="space-y-1.5 border-t border-[var(--border-subtle)] pt-3 text-[14px] tabular-nums">
                <div className="flex justify-between text-[var(--ink-muted)]">
                  <span>سعر الجرابات</span>
                  <span>
                    {cartDesignSubtotal} {STORE_CONFIG.currencyLabel}
                  </span>
                </div>
                {cartNameFeesSubtotal > 0 ? (
                  <div className="flex justify-between text-[var(--ink-muted)]">
                    <span>طباعة الأسماء</span>
                    <span>
                      +{cartNameFeesSubtotal} {STORE_CONFIG.currencyLabel}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between text-[var(--ink-muted)]">
                  <span>الشحن ({selectedGov?.nameAr || '—'})</span>
                  <span>
                    {shippingFee} {STORE_CONFIG.currencyLabel}
                  </span>
                </div>
                <p className="type-caption pt-1 text-[12.5px]">
                  التوصيل المتوقع خلال {totalEstimatedDays} أيام عمل ({STORE_CONFIG.paymentLabelAr})
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-[var(--heading-to-content)] grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
          {/* START COLUMN (7 cols): Delivery form */}
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5 rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 sm:p-6 text-start lg:col-span-7"
          >
            {hasPendingModel ? (
              <div
                role="status"
                className="rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--brand-yellow-tint)] px-4 py-3 text-[14.5px] font-semibold text-[var(--ink)]"
              >
                فيه موديل موبايل لسه بيتأكد — خدمة العملاء هتكلمك قبل الطباعة.
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="checkout-name"
                  className="mb-1.5 block text-[14px] font-semibold text-[var(--ink)]"
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
                  placeholder="مثلا: أحمد سامي محمود"
                  aria-invalid={Boolean(errors.fullName)}
                  className="min-h-[48px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] px-3.5 text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
                />
                {errors.fullName ? (
                  <p className="mt-1.5 text-[13px] font-bold text-[var(--brand)]">
                    {errors.fullName}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="checkout-mobile"
                  className="mb-1.5 block text-[14px] font-semibold text-[var(--ink)]"
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
                  className="min-h-[48px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] px-3.5 text-start text-[15px] tabular-nums text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
                />
                {errors.mobileNumber ? (
                  <p className="mt-1.5 text-[13px] font-bold text-[var(--brand)]">
                    {errors.mobileNumber}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label
                htmlFor="checkout-gov"
                className="mb-1.5 block text-[14px] font-semibold text-[var(--ink)]"
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
                className="min-h-[48px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] px-3.5 text-[15px] text-[var(--ink)]"
              >
                {governorates.map((gov) => (
                  <option key={gov.id} value={gov.id} disabled={!gov.codAvailable}>
                    {gov.codAvailable
                      ? `${gov.nameAr} — شحن ${gov.shippingFee} ${STORE_CONFIG.currencyLabel} (${gov.estimatedDays} أيام)`
                      : `${gov.nameAr} — الدفع عند الاستلام غير متاح حاليا`}
                  </option>
                ))}
              </select>
              {unavailableGovs.length > 0 ? (
                <p className="type-caption mt-1.5 text-[12.5px]">
                  الدفع المتاح حاليا هو الدفع عند الاستلام فقط، والمحافظات غير المتاحة مقفولة مؤقتا.
                </p>
              ) : null}
              {errors.governorateId ? (
                <p className="mt-1.5 text-[13px] font-bold text-[var(--brand)]">
                  {errors.governorateId}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="checkout-address"
                className="mb-1.5 block text-[14px] font-semibold text-[var(--ink)]"
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
                className="w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] p-3.5 text-[15px] leading-[1.6] text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
              />
              {errors.address ? (
                <p className="mt-1.5 text-[13px] font-bold text-[var(--brand)]">
                  {errors.address}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="checkout-notes"
                className="mb-1.5 block text-[14px] font-semibold text-[var(--ink)]"
              >
                ملاحظات للمندوب (اختياري)
              </label>
              <input
                id="checkout-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلا: كلمني قبل ما توصل بنص ساعة"
                className="min-h-[48px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] px-3.5 text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
              />
            </div>

            {submitError ? (
              <p role="alert" className="text-[14px] font-bold text-[var(--brand)]">
                {submitError}
              </p>
            ) : null}

            <div className="pt-2 lg:hidden">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full tabular-nums"
              >
                {isSubmitting
                  ? 'بنجهز طلبك...'
                  : `أكد الطلب — ${orderTotal} ${STORE_CONFIG.currencyLabel}`}
              </button>
              <p className="type-caption mt-2.5 text-center text-[12.5px]">
                {STORE_CONFIG.paymentLabelAr} — التوصيل خلال {totalEstimatedDays} أيام عمل
              </p>
            </div>
          </form>

          {/* END COLUMN (5 cols, desktop sticky): Receipt */}
          <aside className="hidden rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-6 text-start lg:sticky lg:top-[var(--header-offset)] lg:col-span-5 lg:block">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="type-h3 text-[var(--ink)]">ملخص طلبك</h2>
              <span className="type-caption tabular-nums">{cartCount} قطع</span>
            </div>

            <div className="mt-5">
              <OrderItemsList
                items={cartItems}
                allPhoneModels={allPhoneModels}
                fallbackModel={visualPreviewModel}
              />
            </div>

            <div className="mt-6 space-y-2 border-t border-[var(--border-subtle)] pt-4 text-[14.5px] tabular-nums">
              <div className="flex items-baseline justify-between text-[var(--ink-muted)]">
                <span>سعر الجرابات</span>
                <span className="font-semibold text-[var(--ink)]">
                  {cartDesignSubtotal} {STORE_CONFIG.currencyLabel}
                </span>
              </div>

              {cartNameFeesSubtotal > 0 ? (
                <div className="flex items-baseline justify-between text-[var(--ink-muted)]">
                  <span>طباعة الأسماء</span>
                  <span className="font-semibold text-[var(--ink)]">
                    +{cartNameFeesSubtotal} {STORE_CONFIG.currencyLabel}
                  </span>
                </div>
              ) : null}

              <div className="flex items-baseline justify-between text-[var(--ink-muted)]">
                <span>الشحن ({selectedGov?.nameAr || '—'})</span>
                <span className="font-semibold text-[var(--ink)]">
                  {shippingFee} {STORE_CONFIG.currencyLabel}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-3">
                <span className="text-[17px] font-bold text-[var(--ink)]">الإجمالي</span>
                <span className="text-[22px] font-extrabold text-[var(--ink)]">
                  {orderTotal} {STORE_CONFIG.currencyLabel}
                </span>
              </div>
            </div>

            <p className="type-caption mt-4 text-[12.5px]">
              {STORE_CONFIG.paymentLabelAr}. التوصيل المتوقع خلال {totalEstimatedDays} أيام عمل
              (شامل {STORE_CONFIG.productionDays} يوم طباعة وتجهيز).
            </p>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="btn-primary mt-5 w-full tabular-nums"
            >
              {isSubmitting
                ? 'بنجهز طلبك...'
                : `أكد الطلب — ${orderTotal} ${STORE_CONFIG.currencyLabel}`}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

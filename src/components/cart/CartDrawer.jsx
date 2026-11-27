import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { useOverlayDialog } from '../../hooks/useMobileViewportState';
import { storeService } from '../../services/storeService';
import { computeItemPricing } from '../../utils/pricing';
import {
  NamePrintControl,
  createInitialNamePrintState,
  resolveNamePrintState,
  validateNamePrintState,
} from '../customizer/NamePrintControl';
import {
  PhoneModelFields,
  createItemPhoneState,
} from '../header/PhoneModelFields';
import { CloseIcon } from '../icons/Icons';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

const EASE = [0.22, 1, 0.36, 1];

function CartLineItem({
  item,
  allPhoneModels,
  visualPreviewModel,
  onUpdateQuantity,
  onRemove,
  onUpdateSpec,
}) {
  const spec = item.printSpec || {};
  const src = spec.designSource || {};
  const isCatalog = src.type === 'catalog';
  const catalogProduct = isCatalog ? storeService.getProductBySlug(src.productId) : null;
  const isTextOnlyCustom = src.type === 'custom-text-only' && !src.imageUrl;

  const itemModel =
    (spec.phoneModelId && allPhoneModels.find((m) => m.id === spec.phoneModelId)) ||
    visualPreviewModel;

  const hasCustomImage = Boolean(src.imageUrl);
  const pricing = computeItemPricing(item);
  const printedName = pricing.hasName ? spec.printedName : null;

  const [editingMode, setEditingMode] = useState(null); // null | 'phone' | 'name'
  const [draftPhone, setDraftPhone] = useState(() =>
    createItemPhoneState(spec, allPhoneModels)
  );
  const [phoneError, setPhoneError] = useState('');

  const [draftNameState, setDraftNameState] = useState(() =>
    createInitialNamePrintState(spec.printedName, spec.printedName?.ink || 'light')
  );
  const [nameError, setNameError] = useState('');

  const openPhoneEditor = () => {
    setDraftPhone(createItemPhoneState(spec, allPhoneModels));
    setPhoneError('');
    setEditingMode((prev) => (prev === 'phone' ? null : 'phone'));
  };

  const openNameEditor = () => {
    const initial = createInitialNamePrintState(
      spec.printedName,
      spec.printedName?.ink || 'light'
    );
    setDraftNameState({ ...initial, enabled: true });
    setNameError('');
    setEditingMode((prev) => (prev === 'name' ? null : 'name'));
  };

  const isDraftIncompatible =
    draftPhone.status === 'selected' &&
    Boolean(draftPhone.modelId) &&
    Boolean(catalogProduct) &&
    !catalogProduct.compatibleModelIds.includes(draftPhone.modelId);

  const handleSavePhone = () => {
    if (
      draftPhone.status === 'none' ||
      (draftPhone.status === 'selected' && !draftPhone.modelId)
    ) {
      setPhoneError('اختار الماركة والموديل الأول.');
      return;
    }
    if (isDraftIncompatible) return;
    onUpdateSpec(item.cartItemId, { itemPhone: draftPhone });
    setEditingMode(null);
  };

  const handleSaveName = () => {
    const check = validateNamePrintState({ ...draftNameState, enabled: true });
    if (!check.ok) {
      setNameError(check.error);
      return;
    }
    const { spec: nextNameSpec } = resolveNamePrintState({
      ...draftNameState,
      enabled: true,
    });
    onUpdateSpec(item.cartItemId, { printedName: nextNameSpec });
    setEditingMode(null);
  };

  const handleRemoveName = () => {
    if (isTextOnlyCustom) {
      setNameError('الجراب ده عبارة عن اسم مطبوع بس — عدل الاسم أو شيل القطعة من السلة.');
      return;
    }
    onUpdateSpec(item.cartItemId, {
      printedName: {
        ...spec.printedName,
        enabled: false,
        text: '',
      },
    });
    setEditingMode(null);
  };

  // Live thumbnail reflects active draft edits immediately
  const liveThumbPrintedName =
    editingMode === 'name'
      ? resolveNamePrintState({ ...draftNameState, enabled: true }).livePreview
      : printedName;

  const liveThumbModel =
    editingMode === 'phone' && draftPhone.status === 'selected' && draftPhone.modelId
      ? allPhoneModels.find((m) => m.id === draftPhone.modelId) || itemModel
      : itemModel;

  return (
    <li className="rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--paper)] p-3.5">
      <div className="flex items-start gap-3.5">
        {/* Live miniature preview on unified `.product-stage` */}
        <div className="product-stage w-[58px] shrink-0 p-1.5">
          <PhoneCaseMockup
            model={liveThumbModel}
            artworkId={src.artworkId || null}
            customImage={
              hasCustomImage
                ? {
                    url: src.imageUrl,
                    ...spec.imageTransform,
                  }
                : null
            }
            printedName={liveThumbPrintedName}
            interactive={false}
            className="w-full"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Title & total for this line */}
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-[15.5px] font-bold text-[var(--ink)]">
              <bdi dir="ltr" className="latin-title">{item.name}</bdi>
            </h3>
            <span className="shrink-0 text-[15.5px] font-extrabold tabular-nums text-[var(--ink)]">
              {pricing.lineTotal} {STORE_CONFIG.currencyLabel}
            </span>
          </div>

          {/* Separate price lines: Design price and Name fee */}
          <div className="space-y-0.5 text-[12.5px] text-[var(--ink-muted)] tabular-nums">
            <div className="flex items-center justify-between">
              <span>سعر الجراب</span>
              <span>
                {pricing.designUnitPrice} {STORE_CONFIG.currencyLabel}
                {pricing.quantity > 1 ? ` × ${pricing.quantity}` : ''}
              </span>
            </div>
            {pricing.hasName ? (
              <div className="flex items-center justify-between font-semibold text-[var(--ink)]">
                <span>طباعة الاسم</span>
                <span>
                  +{pricing.unitNameFee} {STORE_CONFIG.currencyLabel}
                  {pricing.quantity > 1 ? ` × ${pricing.quantity}` : ''}
                </span>
              </div>
            ) : null}
          </div>

          {/* Phone model row + inline change action */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[13px]">
            <span className="text-[var(--ink)]">
              {spec.phoneModelStatus === 'pending' ? (
                <span>
                  موديل بيتأكد:{' '}
                  <bdi dir="ltr" className="font-bold">
                    {spec.phoneModelName}
                  </bdi>
                </span>
              ) : (
                <>
                  الموبايل:{' '}
                  <bdi dir="ltr" className="latin-title font-bold">
                    {spec.phoneModelName || itemModel.name}
                  </bdi>
                </>
              )}
            </span>
            <button
              type="button"
              onClick={openPhoneEditor}
              className="font-bold text-[var(--brand)] underline underline-offset-4 cursor-pointer"
            >
              {editingMode === 'phone' ? 'إلغاء' : 'غير الموبايل'}
            </button>
          </div>

          {/* Printed name row + edit / remove / add actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
            {printedName?.text ? (
              <>
                <span className="text-[var(--ink)]">
                  الاسم:{' '}
                  <bdi
                    dir={printedName.script === 'latin' ? 'ltr' : 'rtl'}
                    className="font-bold"
                  >
                    {printedName.text}
                  </bdi>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={openNameEditor}
                    className="font-bold text-[var(--ink)] underline underline-offset-4 hover:text-[var(--brand)] cursor-pointer"
                  >
                    {editingMode === 'name' ? 'إلغاء' : 'عدل الاسم'}
                  </button>
                  {!isTextOnlyCustom ? (
                    <button
                      type="button"
                      onClick={handleRemoveName}
                      className="font-semibold text-[var(--ink-muted)] underline underline-offset-4 hover:text-[var(--brand)] cursor-pointer"
                    >
                      شيل الاسم
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={openNameEditor}
                className="font-semibold text-[var(--ink-muted)] underline underline-offset-4 hover:text-[var(--ink)] cursor-pointer"
              >
                {editingMode === 'name'
                  ? 'إلغاء إضافة الاسم'
                  : `+ ضيف اسمك على الجراب (+${STORE_CONFIG.namePrintFee} ${STORE_CONFIG.currencyLabel})`}
              </button>
            )}
          </div>

          {/* Quantity & remove controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="inline-flex items-center gap-1 rounded-[var(--radius-ui)] border border-[var(--border-subtle)] bg-[var(--surface)] p-0.5">
              <button
                type="button"
                aria-label="قلل الكمية"
                onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[15px] font-bold text-[var(--ink)] hover:bg-[var(--card-bg)] cursor-pointer"
              >
                −
              </button>
              <span className="min-w-[24px] text-center text-[13.5px] font-bold tabular-nums text-[var(--ink)]">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="زود الكمية"
                onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[15px] font-bold text-[var(--ink)] hover:bg-[var(--card-bg)] cursor-pointer"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.cartItemId)}
              className="btn-secondary !min-h-[34px] !text-[13px] text-[var(--ink-muted)]"
            >
              شيل من السلة
            </button>
          </div>
        </div>
      </div>

      {/* Inline per-line Phone Editor */}
      {editingMode === 'phone' ? (
        <div className="mt-3 space-y-2.5 border-t border-[var(--border-subtle)] pt-3">
          <PhoneModelFields
            compact
            value={draftPhone}
            onChange={(next) => {
              setDraftPhone(next);
              setPhoneError('');
            }}
            compatibleModelIds={catalogProduct?.compatibleModelIds || null}
            error={phoneError}
          />
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isDraftIncompatible}
              onClick={handleSavePhone}
              className="btn-primary !min-h-[40px] flex-1 !text-[13.5px]"
            >
              احفظ الموديل
            </button>
            <button
              type="button"
              onClick={() => setEditingMode(null)}
              className="btn-outline !min-h-[40px] !px-4 !text-[13.5px]"
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : null}

      {/* Inline per-line Name Editor */}
      {editingMode === 'name' ? (
        <div className="mt-3 space-y-2.5 border-t border-[var(--border-subtle)] pt-3">
          <NamePrintControl
            compact
            hideToggle
            state={draftNameState}
            onChange={(next) => {
              setDraftNameState(next);
              setNameError('');
            }}
            error={nameError}
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveName}
              className="btn-primary !min-h-[40px] flex-1 !text-[13.5px]"
            >
              احفظ الاسم (+{STORE_CONFIG.namePrintFee} {STORE_CONFIG.currencyLabel})
            </button>
            {pricing.hasName && !isTextOnlyCustom ? (
              <button
                type="button"
                onClick={handleRemoveName}
                className="btn-outline !min-h-[40px] !px-3.5 !text-[13px]"
              >
                شيل الاسم
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Slide-in Cart Drawer (`end-0` in RTL).
 * Shows design price and +50 EGP name fee as separate lines on each item and in totals,
 * and lets customers edit/change both the phone model and the printed name per line.
 */
export function CartDrawer() {
  const {
    cartItems,
    cartCount,
    cartDesignSubtotal,
    cartNameFeesSubtotal,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    allPhoneModels,
    visualPreviewModel,
    updateCartQuantity,
    updateCartItemSpec,
    removeCartItem,
  } = useStore();

  const prefersReducedMotion = useReducedMotion();
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);

  useOverlayDialog({
    open: isCartOpen,
    onClose: () => setIsCartOpen(false),
    containerRef: drawerRef,
    initialFocusRef: closeBtnRef,
  });

  return (
    <AnimatePresence>
      {isCartOpen ? (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="سلة المشتريات"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: EASE }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-[#111317]/45"
          />

          <motion.aside
            ref={drawerRef}
            initial={prefersReducedMotion ? false : { x: '-100%' }}
            animate={{ x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: EASE }}
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              paddingInlineEnd: 'env(safe-area-inset-left, 0px)',
            }}
            className="surface-light-panel fixed inset-y-0 end-0 z-50 flex h-dvh w-full max-w-[448px] flex-col bg-[var(--surface)] text-start"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 pt-4 pb-3.5 [@media(max-height:500px)]:py-2.5">
              <div className="flex items-baseline gap-2.5">
                <h2 className="type-h3 text-[var(--ink)]">السلة</h2>
                <span className="type-caption tabular-nums">({cartCount})</span>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setIsCartOpen(false)}
                aria-label="إغلاق السلة"
                className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-ui)] text-[var(--ink-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--ink)] cursor-pointer"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartItems.length === 0 ? (
                <div className="py-10 text-start">
                  <p className="type-body max-w-[60ch] text-[var(--ink)]">
                    سلتك فاضية دلوقتي. اختار تصميم من الجرابات أو ارفع صورتك وصمم جرابك.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3.5">
                    <Link
                      to="/categories"
                      onClick={() => setIsCartOpen(false)}
                      className="btn-primary"
                    >
                      شوف الجرابات
                    </Link>
                    <Link
                      to="/customize"
                      onClick={() => setIsCartOpen(false)}
                      className="btn-outline"
                    >
                      صمم جرابك
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {cartItems.map((item) => (
                    <CartLineItem
                      key={item.cartItemId}
                      item={item}
                      allPhoneModels={allPhoneModels}
                      visualPreviewModel={visualPreviewModel}
                      onUpdateQuantity={updateCartQuantity}
                      onUpdateSpec={updateCartItemSpec}
                      onRemove={removeCartItem}
                    />
                  ))}
                </ul>
              )}
            </div>

            {cartItems.length > 0 ? (
              <div className="space-y-2.5 border-t border-[var(--border-subtle)] bg-[var(--card-bg)]/65 px-5 py-4">
                <div className="space-y-1 text-[14px]">
                  <div className="flex items-baseline justify-between text-[var(--ink-muted)]">
                    <span>سعر الجرابات</span>
                    <span className="font-semibold tabular-nums text-[var(--ink)]">
                      {cartDesignSubtotal} {STORE_CONFIG.currencyLabel}
                    </span>
                  </div>

                  {cartNameFeesSubtotal > 0 ? (
                    <div className="flex items-baseline justify-between text-[var(--ink-muted)]">
                      <span>طباعة الأسماء</span>
                      <span className="font-semibold tabular-nums text-[var(--ink)]">
                        +{cartNameFeesSubtotal} {STORE_CONFIG.currencyLabel}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-2">
                    <span className="text-[16px] font-bold text-[var(--ink)]">الإجمالي</span>
                    <span className="text-[20px] font-extrabold tabular-nums text-[var(--ink)]">
                      {cartSubtotal} {STORE_CONFIG.currencyLabel}
                    </span>
                  </div>
                </div>

                <p className="type-caption text-[12.5px]">
                  {STORE_CONFIG.paymentLabelAr}. مصاريف الشحن بتتحدد حسب المحافظة في الخطوة الجاية.
                </p>

                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="btn-primary w-full"
                >
                  كمل الطلب
                </Link>
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

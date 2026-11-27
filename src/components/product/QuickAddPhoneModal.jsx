import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { useOverlayDialog } from '../../hooks/useMobileViewportState';
import { storeService } from '../../services/storeService';
import { PhoneModelFields, createItemPhoneState } from '../header/PhoneModelFields';
import { CloseIcon } from '../icons/Icons';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Compact per-item Brand/Model picker modal opened when a customer clicks
 * quick-add ("ضيف للسلة") on a listing card without having chosen a phone model yet.
 * Affects ONLY this item — never mutates the site-wide filter.
 */
export function QuickAddPhoneModal() {
  const {
    quickAddProduct,
    setQuickAddProduct,
    phoneSelection,
    allPhoneModels,
    visualPreviewModel,
    addCatalogProductToCart,
    setIsCartOpen,
  } = useStore();

  const prefersReducedMotion = useReducedMotion();
  const [itemPhone, setItemPhone] = useState(() =>
    createItemPhoneState(phoneSelection, allPhoneModels)
  );
  const [phoneError, setPhoneError] = useState('');
  const modalRef = useRef(null);
  const brandSelectRef = useRef(null);
  const modelSelectRef = useRef(null);

  useOverlayDialog({
    open: Boolean(quickAddProduct),
    onClose: () => setQuickAddProduct(null),
    containerRef: modalRef,
    initialFocusRef: brandSelectRef,
  });

  useEffect(() => {
    if (quickAddProduct) {
      setItemPhone(createItemPhoneState(phoneSelection, allPhoneModels));
      setPhoneError('');
    }
  }, [quickAddProduct, phoneSelection, allPhoneModels]);

  const previewModel =
    itemPhone.status === 'selected' && itemPhone.modelId
      ? storeService.getPhoneModelById(itemPhone.modelId) || visualPreviewModel
      : visualPreviewModel;

  const isIncompatible =
    Boolean(quickAddProduct) &&
    itemPhone.status === 'selected' &&
    Boolean(itemPhone.modelId) &&
    !quickAddProduct.compatibleModelIds.includes(itemPhone.modelId);

  const handleConfirmAdd = () => {
    if (!quickAddProduct) return;
    if (itemPhone.status === 'none' || (itemPhone.status === 'selected' && !itemPhone.modelId)) {
      setPhoneError('اختار الماركة والموديل الأول عشان نطبع الجراب على مقاس موبايلك.');
      if (!itemPhone.brand) {
        brandSelectRef.current?.focus();
      } else {
        modelSelectRef.current?.focus();
      }
      return;
    }
    if (isIncompatible) return;

    setPhoneError('');
    addCatalogProductToCart(quickAddProduct, { itemPhone });
    setQuickAddProduct(null);
    setIsCartOpen(true);
  };

  return (
    <AnimatePresence>
      {quickAddProduct ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`اختار الموبايل لجراب ${quickAddProduct.name}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: EASE }}
            onClick={() => setQuickAddProduct(null)}
            className="fixed inset-0 bg-[#111317]/50"
          />

          <motion.div
            ref={modalRef}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: EASE }}
            style={{
              boxShadow: 'var(--shadow-panel)',
              maxHeight: 'min(90dvh, calc(100dvh - 12px))',
              paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
            }}
            className="surface-light-panel relative z-10 w-full max-w-[460px] overflow-y-auto rounded-t-[16px] sm:rounded-[var(--radius-stage)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 pt-5 text-start"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-3.5">
              <div className="flex items-center gap-3.5">
                <div className="product-stage w-[46px] shrink-0 p-1.5">
                  <PhoneCaseMockup
                    model={previewModel}
                    artworkId={quickAddProduct.artworkId}
                    interactive={false}
                    className="w-full"
                  />
                </div>
                <div>
                  <h2 className="type-h3 !text-[17px] text-[var(--ink)]">
                    <bdi dir="ltr" className="latin-title">{quickAddProduct.name}</bdi>
                  </h2>
                  <p className="text-[14px] font-bold tabular-nums text-[var(--ink-muted)]">
                    {quickAddProduct.price} {STORE_CONFIG.currencyLabel}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQuickAddProduct(null)}
                aria-label="إغلاق"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-ui)] text-[var(--ink-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--ink)] cursor-pointer"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <PhoneModelFields
                compact
                value={itemPhone}
                onChange={(next) => {
                  setItemPhone(next);
                  setPhoneError('');
                }}
                compatibleModelIds={quickAddProduct.compatibleModelIds}
                error={phoneError}
                brandSelectRef={brandSelectRef}
                modelSelectRef={modelSelectRef}
              />
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={isIncompatible}
                onClick={handleConfirmAdd}
                className="btn-primary w-full"
              >
                ضيف للسلة — {quickAddProduct.price} {STORE_CONFIG.currencyLabel}
              </button>

              <Link
                to={`/products/${quickAddProduct.id}?name=1`}
                onClick={() => setQuickAddProduct(null)}
                className="btn-secondary w-full !min-h-[40px] !text-[13.5px] text-[var(--ink-muted)]"
              >
                أو افتح صفحة الجراب واطبع اسمك (+{STORE_CONFIG.namePrintFee} {STORE_CONFIG.currencyLabel})
              </Link>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

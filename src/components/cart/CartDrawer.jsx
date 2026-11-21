import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { CloseIcon } from '../icons/Icons';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Minimal slide-in cart drawer.
 * Opens from the inline-end side (physical left in RTL, where the cart icon lives).
 */
export function CartDrawer() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    allPhoneModels,
    visualPreviewModel,
    updateCartQuantity,
    removeCartItem,
  } = useStore();

  const prefersReducedMotion = useReducedMotion();

  const resolveModelForItem = (printSpec) => {
    if (printSpec?.phoneModelId) {
      const found = allPhoneModels.find((m) => m.id === printSpec.phoneModelId);
      if (found) return found;
    }
    return visualPreviewModel;
  };

  return (
    <AnimatePresence>
      {isCartOpen ? (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="سلة المشتريات"
        >
          {/* Solid matte charcoal scrim (no glassmorphism/blur) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-[#26282B]/35"
          />

          {/* Drawer panel sliding in from inline-end (physical left in RTL) */}
          <motion.aside
            initial={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-y-0 end-0 z-50 flex w-full max-w-[420px] flex-col bg-[var(--gallery-white)] text-start"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <div className="flex items-baseline gap-2.5">
                <h2 className="type-h3 text-[var(--charcoal)]">السلة</h2>
                <span className="type-caption tabular-nums">{cartCount}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                aria-label="إغلاق السلة"
                className="flex h-11 w-11 items-center justify-center rounded-[4px] text-[var(--graphite)] hover:text-[var(--charcoal)] cursor-pointer"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              {cartItems.length === 0 ? (
                <div className="py-16 text-start">
                  <p className="type-body text-[var(--charcoal)]">
                    سلتك فاضية دلوقتي. اختار تصميم من الجرابات أو ارفع صورتك وصمّم جرابك.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-5">
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
                      className="btn-secondary"
                    >
                      صمم جرابك
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-6">
                  {cartItems.map((item) => {
                    const spec = item.printSpec;
                    const itemModel = resolveModelForItem(spec);
                    const hasCustomImage = Boolean(spec?.designSource?.imageUrl);
                    const printedName = spec?.printedName?.enabled ? spec.printedName : null;

                    return (
                      <li key={item.cartItemId} className="flex items-start gap-4">
                        {/* Live miniature preview of the actual print */}
                        <div className="w-[54px] shrink-0">
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
                            <h3 className="truncate text-[16px] font-semibold text-[var(--charcoal)]">
                              <bdi dir="ltr">{item.name}</bdi>
                            </h3>
                            <span className="shrink-0 text-[15px] font-semibold tabular-nums text-[var(--charcoal)]">
                              {item.price * item.quantity} {STORE_CONFIG.currencyLabel}
                            </span>
                          </div>

                          <p className="type-caption mt-0.5 text-[13px]">
                            {spec?.phoneModelStatus === 'pending' ? (
                              <span>
                                موديلك بيتأكد:{' '}
                                <bdi dir="ltr">{spec.phoneModelName}</bdi>
                              </span>
                            ) : (
                              <bdi dir="ltr">{spec?.phoneModelName || itemModel.name}</bdi>
                            )}
                          </p>

                          {printedName?.text ? (
                            <p className="type-caption mt-0.5 text-[13px] text-[var(--charcoal)]">
                              الاسم المطبوع:{' '}
                              <bdi dir={printedName.script === 'latin' ? 'ltr' : 'rtl'}>
                                {printedName.text}
                              </bdi>
                            </p>
                          ) : null}

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-1 rounded-[4px] bg-[var(--plaster)]/70 p-0.5">
                              <button
                                type="button"
                                aria-label="قلل الكمية"
                                onClick={() => updateCartQuantity(item.cartItemId, -1)}
                                className="flex h-9 w-9 items-center justify-center rounded-[4px] text-[16px] font-semibold text-[var(--charcoal)] hover:text-[var(--klein)] cursor-pointer"
                              >
                                −
                              </button>
                              <span className="min-w-[24px] text-center text-[14px] font-semibold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label="زوّد الكمية"
                                onClick={() => updateCartQuantity(item.cartItemId, 1)}
                                className="flex h-9 w-9 items-center justify-center rounded-[4px] text-[16px] font-semibold text-[var(--charcoal)] hover:text-[var(--klein)] cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeCartItem(item.cartItemId)}
                              className="btn-secondary !min-h-[36px] !text-[14px] text-[var(--graphite)]"
                            >
                              شيل
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 ? (
              <div className="space-y-3 bg-[var(--plaster)]/45 px-6 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[16px] font-semibold text-[var(--charcoal)]">الإجمالي</span>
                  <span className="text-[20px] font-bold tabular-nums text-[var(--charcoal)]">
                    {cartSubtotal} {STORE_CONFIG.currencyLabel}
                  </span>
                </div>

                <p className="type-caption text-[13px]">
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

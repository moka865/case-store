import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CloseIcon } from '../icons/Icons';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Non-blocking gentle first-visit popover anchored beneath the phone-model selector.
 */
export function FirstVisitPopover({ open, onChooseNow, onDismiss }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="absolute end-0 top-[calc(100%+8px)] z-40 w-[256px] max-w-[calc(100vw-32px)] rounded-[4px] bg-[var(--gallery-white)] p-3.5 text-start border border-[rgba(38,40,43,0.18)]"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] leading-[1.6] font-medium text-[var(--charcoal)]">
              اختار موبايلك الأول عشان تشوف الجرابات اللي تناسبه.
            </p>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="إغلاق التنبيه"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-[var(--graphite)] hover:text-[var(--charcoal)] cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2.5 flex items-center gap-4">
            <button
              type="button"
              onClick={onChooseNow}
              className="btn-primary !min-h-[38px] !px-3.5 !text-[14px]"
            >
              اختار دلوقتي
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="btn-secondary !min-h-[38px] !text-[14px] text-[var(--graphite)]"
            >
              بعدين
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

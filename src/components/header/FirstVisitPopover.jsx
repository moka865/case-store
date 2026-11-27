import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CloseIcon } from '../icons/Icons';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Gentle first-visit popover anchored beneath the phone-model selector.
 */
export function FirstVisitPopover({ open, onChooseNow, onDismiss }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: EASE }}
          style={{ boxShadow: 'var(--shadow-panel)' }}
          className="surface-light-panel absolute end-0 top-[calc(100%+10px)] z-40 w-[268px] max-w-[calc(100vw-32px)] rounded-[var(--radius-stage)] border border-[var(--border-strong)] bg-[var(--surface)] p-3.5 text-start text-[var(--ink)]"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13.5px] leading-[1.55] font-semibold text-[var(--ink)]">
              اختار موديل موبايلك الأول عشان تشوف الجرابات اللي تناسبه بالظبط.
            </p>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="إغلاق التنبيه"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ink-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--ink)] cursor-pointer"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <button
              type="button"
              onClick={onChooseNow}
              className="btn-primary !min-h-[38px] !px-3.5 !text-[13.5px]"
            >
              اختار دلوقتي
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="btn-secondary !min-h-[38px] !text-[13.5px] text-[var(--ink-muted)]"
            >
              بعدين
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

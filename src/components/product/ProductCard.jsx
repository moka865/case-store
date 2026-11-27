import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { CheckIcon } from '../icons/Icons';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Clean, unified غلاف Product Card:
 * - Fixed `.product-stage` (`--card-bg: #ECEAE4`) across all cards
 * - Real `<Link to="/products/:slug">` wrapping stage and title
 * - When no phone is chosen site-wide, `onAdd` opens the compact Brand/Model picker instead of adding blindly
 * - Subtle, unobtrusive hint for optional name printing
 */
export function ProductCard({
  product,
  categoryNameAr = '',
  displayModel,
  selectedModel = null,
  onAdd,
}) {
  const [justAdded, setJustAdded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const productUrl = `/products/${product.id}`;

  const handleAdd = () => {
    const res = onAdd(product);
    if (res?.openedPhonePicker) return;
    setJustAdded(true);
    window.setTimeout(() => {
      setJustAdded(false);
    }, 1250);
  };

  return (
    <motion.article
      layout={!prefersReducedMotion}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      transition={{
        layout: { duration: 0.38, ease: EASE },
        opacity: { duration: 0.22, ease: EASE },
      }}
      className="case-lift-group group flex h-full flex-col"
    >
      <Link
        to={productUrl}
        aria-label={`${product.name} — ${product.price} ${STORE_CONFIG.currencyLabel}`}
        className="product-stage relative flex aspect-[4/4.75] w-full flex-col items-center justify-between overflow-hidden p-3 sm:p-4 transition-colors duration-200 group-hover:border-[var(--border-strong)]"
      >
        <div className="relative z-10 flex w-full items-center justify-between gap-1.5">
          {categoryNameAr ? (
            <span className="inline-flex items-center rounded-[6px] bg-[var(--surface)]/85 px-2 py-0.5 text-[11.5px] font-semibold text-[var(--ink)]">
              {categoryNameAr}
            </span>
          ) : (
            <span />
          )}

          {selectedModel ? (
            <span className="inline-flex max-w-[62%] items-center gap-1 truncate rounded-[6px] bg-[var(--surface)] px-2 py-0.5 text-[11px] font-bold text-[var(--jade)]">
              <CheckIcon className="h-3 w-3 shrink-0" />
              <bdi dir="ltr" className="latin-title truncate text-[var(--ink)]">
                {selectedModel.name}
              </bdi>
            </span>
          ) : null}
        </div>

        <div className="relative z-10 my-auto flex w-full items-center justify-center py-1.5">
          <div className="w-[56%] max-w-[184px]">
            <PhoneCaseMockup
              model={displayModel}
              artworkId={product.artworkId}
              className="w-full"
              ariaLabel={`جراب ${product.name} لموبايل ${displayModel.name}`}
            />
          </div>
        </div>

        <div className="relative z-0 h-1 w-full" aria-hidden="true" />
      </Link>

      <div className="mt-3 flex flex-1 flex-col justify-between gap-2 text-start">
        <div>
          <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
            <h3 className="w-full min-w-0 truncate text-[14.5px] sm:w-auto sm:text-[16px] font-bold leading-[1.35] text-[var(--ink)]">
              <Link
                to={productUrl}
                className="hover:text-[var(--brand)] transition-colors"
              >
                <bdi dir="ltr" className="latin-title">{product.name}</bdi>
              </Link>
            </h3>
            <span className="shrink-0 text-[13.5px] sm:text-[15px] font-bold tabular-nums text-[var(--ink)]">
              {product.price} {STORE_CONFIG.currencyLabel}
            </span>
          </div>

          <Link
            to={`${productUrl}?name=1`}
            className="mt-0.5 inline-block text-[12px] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          >
            متاح طباعة اسمك (+{STORE_CONFIG.namePrintFee} {STORE_CONFIG.currencyLabel})
          </Link>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          aria-live="polite"
          className={`inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-[var(--radius-ui)] border px-3 text-[13.5px] sm:text-[14px] font-bold transition-colors duration-150 cursor-pointer ${
            justAdded
              ? 'border-[var(--jade)] bg-[var(--jade)] text-white'
              : 'border-[var(--border-strong)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {justAdded ? (
              <motion.span
                key="added"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -3 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="inline-flex items-center gap-1"
              >
                <CheckIcon className="h-3.5 w-3.5" />
                <span>اتضاف</span>
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.16, ease: EASE }}
              >
                ضيف للسلة
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.article>
  );
}

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { CheckIcon, CustomPenIcon } from '../icons/Icons';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';
import { getProductStageTheme } from '../mockup/productPresentation';

const EASE = [0.22, 1, 0.36, 1];

/**
 * غلاف Signature Product Card:
 * - Real crawlable `<Link to="/products/:slug">` wrapping both the curated mineral studio plinth and title
 * - Per-artwork tuned matte stage backdrop + subtle floor shadow + GPU silhouette hover lift
 * - Clear phone-model compatibility indicator when a model is selected
 * - Tactile quick-add button ("ضيف للسلة" -> Jade "اتضاف ✓") + optional printed-name entry point
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
  const stage = getProductStageTheme(product.artworkId);
  const productUrl = `/products/${product.id}`;

  const handleAdd = () => {
    onAdd(product);
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
      {/* Curated Studio Backdrop Plinth — real crawlable <a href="/products/:slug"> */}
      <Link
        to={productUrl}
        aria-label={`${product.name} — ${product.price} ${STORE_CONFIG.currencyLabel}`}
        style={{ backgroundColor: stage.bg }}
        className="relative flex aspect-[4/4.75] w-full flex-col items-center justify-between overflow-hidden rounded-[var(--radius-stage)] border border-[rgba(20,24,31,0.10)] p-3 sm:p-4 transition-colors duration-200 group-hover:border-[var(--ink)]/35"
      >
        {/* Top studio ticket metadata bar */}
        <div className="relative z-10 flex w-full items-center justify-between gap-1.5">
          {categoryNameAr ? (
            <span className="inline-flex items-center rounded-[6px] bg-white/80 px-2 py-0.5 text-[11.5px] font-semibold text-[var(--ink)]">
              {categoryNameAr}
            </span>
          ) : (
            <span />
          )}

          {selectedModel ? (
            <span className="inline-flex max-w-[62%] items-center gap-1 truncate rounded-[6px] bg-[var(--cobalt-tint)] border border-[var(--cobalt)]/25 px-2 py-0.5 text-[11px] font-bold text-[var(--cobalt)]">
              <CheckIcon className="h-3 w-3 shrink-0" />
              <bdi dir="ltr" className="latin-title truncate">
                {selectedModel.name}
              </bdi>
            </span>
          ) : (
            <span
              dir="ltr"
              className="latin-title text-[11px] font-bold text-[var(--ink)]/45 tabular-nums"
            >
              #{stage.editionNo}
            </span>
          )}
        </div>

        {/* Centered floating case mockup */}
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

        {/* Grounding studio plinth shadow ellipse + subtle corner registration tick */}
        <div className="relative z-0 flex w-full items-center justify-center pb-0.5" aria-hidden="true">
          <span
            className="block h-2 w-[48%] rounded-full transition-transform duration-250 group-hover:scale-x-90"
            style={{ backgroundColor: stage.plinth }}
          />
        </div>
      </Link>

      {/* Crisp aligned caption + tactile conversion bar */}
      <div className="mt-3 flex flex-1 flex-col justify-between gap-2.5 text-start">
        <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
          <h3 className="w-full min-w-0 truncate text-[14.5px] sm:w-auto sm:text-[16px] font-bold leading-[1.3] text-[var(--ink)]">
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            aria-live="polite"
            className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-ui)] border-[1.5px] px-3 text-[13.5px] sm:text-[14px] font-bold transition-all duration-150 cursor-pointer ${
              justAdded
                ? 'border-[var(--jade)] bg-[var(--jade)] text-white'
                : 'border-[var(--ink)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--brand)] hover:text-white hover:border-[var(--ink)] active:translate-y-[1px]'
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

          <Link
            to={`${productUrl}?name=1`}
            title="اطبع اسمك على التصميم ده"
            aria-label={`اطبع اسمك على جراب ${product.name}`}
            className="hidden sm:inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1 rounded-[var(--radius-ui)] border border-[var(--border-subtle)] bg-[var(--surface-warm)]/75 px-2.5 text-[12.5px] font-semibold text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--sun-soft)] transition-colors"
          >
            <CustomPenIcon className="h-3.5 w-3.5" />
            <span>باسمك</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

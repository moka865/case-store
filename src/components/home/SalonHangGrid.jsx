import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { storeService } from '../../services/storeService';
import { ModelChip } from '../header/ModelChip';
import { CheckIcon } from '../icons/Icons';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

const EASE = [0.22, 1, 0.36, 1];

// Explicit Tailwind desktop column spans so JIT compiles all three salon-hang widths
const SPAN_CLASSES = {
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
};

// Proportional gallery scale matching the column span (3-col tighter, 5-col centerpiece)
const MOCKUP_WIDTH_CLASSES = {
  3: 'w-full max-w-[228px]',
  4: 'w-full max-w-[248px]',
  5: 'w-full max-w-[274px]',
};

// Deliberate vertical offsets for desktop salon-hang rhythm (no uniform rows)
const DESKTOP_OFFSET_CLASSES = [
  'md:mt-0',
  'md:mt-16',
  'md:mt-6',
  'md:mt-4',
  'md:mt-14',
  'md:mt-8',
  'md:mt-0',
  'md:mt-16',
  'md:mt-6',
  'md:mt-4',
  'md:mt-14',
  'md:mt-0',
  'md:mt-10',
  'md:mt-2',
];

function SalonCaseItem({ product, index, displayModel, onAdd }) {
  const [justAdded, setJustAdded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const span = product.salonSpan || 4;
  const spanClass = SPAN_CLASSES[span] || SPAN_CLASSES[4];
  const widthClass = MOCKUP_WIDTH_CLASSES[span] || MOCKUP_WIDTH_CLASSES[4];
  const desktopOffsetClass = DESKTOP_OFFSET_CLASSES[index % DESKTOP_OFFSET_CLASSES.length];
  // Mobile 2-column subtle stagger on the second column
  const mobileStaggerClass = index % 2 === 1 ? 'mt-8 md:mt-0' : '';

  const handleAdd = () => {
    onAdd(product);
    setJustAdded(true);
    window.setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  return (
    <motion.article
      layout={!prefersReducedMotion}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      transition={{
        layout: { duration: 0.4, ease: EASE },
        opacity: { duration: 0.25, ease: EASE },
      }}
      className={`flex flex-col items-start ${spanClass} ${mobileStaggerClass} ${desktopOffsetClass}`}
    >
      {/* Case sits directly on the plaster wall — NO box, NO border, NO shadow, NO hover lift */}
      <div className={widthClass}>
        <PhoneCaseMockup
          model={displayModel}
          artworkId={product.artworkId}
          className="w-full"
          ariaLabel={`جراب ${product.name} لموبايل ${displayModel.name}`}
        />

        {/* Quiet gallery caption: product name + price on row 1, "ضيف للسلة" on row 2 */}
        <div className="mt-4 text-start">
          <div className="flex items-baseline justify-between gap-x-2 gap-y-1">
            <h3 className="min-w-0 text-start text-[15px] font-medium leading-[1.35] text-[var(--charcoal)] sm:text-[17px] sm:leading-[1.4]">
              <bdi dir="ltr">{product.name}</bdi>
            </h3>
            <span className="shrink-0 text-[14px] font-semibold tabular-nums text-[var(--charcoal)] sm:text-[16px]">
              {product.price} {STORE_CONFIG.currencyLabel}
            </span>
          </div>

          <div className="mt-0.5">
            <button
              type="button"
              onClick={handleAdd}
              className="btn-secondary !min-h-[44px] !px-0 !text-[14px] sm:!text-[15px]"
              aria-live="polite"
            >
              <AnimatePresence mode="wait" initial={false}>
                {justAdded ? (
                  <motion.span
                    key="added"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="inline-flex items-center gap-1 font-semibold text-[var(--klein)] no-underline"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>اتضاف</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                  >
                    ضيف للسلة
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Salon hang product grid directly on the plaster wall.
 * Reused on `/` (short 6-item trending preview) and `/categories` (full filtered catalog).
 * Reflows with Motion layout animation (400ms) whenever phone model, category, or search changes.
 */
export function SalonHangGrid({
  categoryId = null,
  limit = null,
  showViewAllLink = false,
  ignoreSearch = false,
  headingText = null,
  compactTop = false,
}) {
  const {
    categories,
    searchQuery,
    setSearchQuery,
    phoneSelection,
    visualPreviewModel,
    setIsModelSelectorOpen,
    addCatalogProductToCart,
  } = useStore();

  const activeSearch = ignoreSearch ? '' : searchQuery;

  const products = useMemo(() => {
    const allMatching = storeService.getProducts({
      modelId: phoneSelection.modelId,
      modelStatus: phoneSelection.status,
      categoryId,
      searchQuery: activeSearch,
    });
    return limit ? allMatching.slice(0, limit) : allMatching;
  }, [phoneSelection.modelId, phoneSelection.status, categoryId, activeSearch, limit]);

  const activeCategory = categories.find((c) => c.id === categoryId);

  const sectionHeading = activeSearch.trim()
    ? `نتايج البحث عن "${activeSearch.trim()}"`
    : headingText || (activeCategory ? activeCategory.nameAr : 'المطلوب اليومين دول');

  return (
    <section
      id="designs"
      aria-labelledby="designs-heading"
      className={`scroll-mt-[var(--header-offset)] ${
        compactTop ? 'pt-4 pb-16 md:pt-8 md:pb-28' : 'py-16 md:py-28'
      }`}
    >
      <div className="page-container">
        {/* Top bar: section heading + pill phone-model chip */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center md:mb-16">
          <div className="flex flex-wrap items-baseline gap-4">
            <h2 id="designs-heading" className="type-h2 text-[var(--charcoal)]">
              {sectionHeading}
            </h2>
            {!ignoreSearch && (activeCategory || activeSearch.trim()) ? (
              <Link
                to="/categories"
                onClick={() => setSearchQuery('')}
                className="btn-secondary !text-[15px] text-[var(--graphite)]"
              >
                عرض الكل
              </Link>
            ) : null}
          </div>

          <ModelChip />
        </div>

        {/* Salon hang grid or friendly actionable empty state */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 items-start gap-x-5 gap-y-12 md:grid-cols-12 md:gap-x-8 md:gap-y-16">
              <AnimatePresence mode="popLayout">
                {products.map((product, index) => (
                  <SalonCaseItem
                    key={product.id}
                    product={product}
                    index={index}
                    displayModel={visualPreviewModel}
                    onAdd={addCatalogProductToCart}
                  />
                ))}
              </AnimatePresence>
            </div>

            {showViewAllLink ? (
              <div className="mt-14 text-start md:mt-20">
                <Link to="/categories" className="btn-secondary text-[17px]">
                  شوف كل الجرابات
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <div className="max-w-[46ch] py-12 text-start">
            <p className="type-h3 text-[var(--charcoal)]">
              {activeSearch.trim()
                ? 'مفيش تصميمات بالاسم ده دلوقتي. جرّب كلمة تانية أو ارفع تصميمك.'
                : 'مفيش تصميمات للموديل ده لسه. جرّب موبايل تاني أو ارفع تصميمك.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              {activeSearch.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="btn-primary"
                >
                  امسح البحث
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModelSelectorOpen(true)}
                  className="btn-primary"
                >
                  اختار موبايل تاني
                </button>
              )}
              <Link to="/customize" className="btn-secondary">
                ارفع تصميمك
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

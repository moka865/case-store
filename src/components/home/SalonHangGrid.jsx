import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { storeService } from '../../services/storeService';
import { ModelChip } from '../header/ModelChip';
import { CheckIcon } from '../icons/Icons';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Responsive target column density from DESIGN.md:
 * 2 (mobile), 3 (>=768px), 4 (>=1024px), 5 (>=1440px), 6 (>=1920px).
 * Track counts are chosen so every balanced row partitions cleanly into exact integer spans.
 */
function getGridSpecForWidth(width) {
  if (width >= 1920) return { cols: 6, tracks: 12 };
  if (width >= 1440) return { cols: 5, tracks: 20 };
  if (width >= 1024) return { cols: 4, tracks: 12 };
  if (width >= 768) return { cols: 3, tracks: 12 };
  return { cols: 2, tracks: 2 };
}

function useSalonGridSpec() {
  const [spec, setSpec] = useState(() =>
    typeof window === 'undefined'
      ? { cols: 4, tracks: 12 }
      : getGridSpecForWidth(window.innerWidth)
  );

  useEffect(() => {
    const sync = () => {
      const next = getGridSpecForWidth(window.innerWidth);
      setSpec((prev) =>
        prev.cols === next.cols && prev.tracks === next.tracks ? prev : next
      );
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  return spec;
}

/**
 * Partition N items into balanced row lengths so no desktop row ends with unfilled columns,
 * while hitting full `targetCols` density on leading rows.
 */
function computeBalancedRowCounts(total, targetCols) {
  if (total <= 0) return [];
  if (targetCols <= 2) {
    const rows = [];
    for (let rem = total; rem > 0; rem -= 2) {
      rows.push(Math.min(2, rem));
    }
    return rows;
  }
  if (total <= targetCols) return [total];

  const numRows = Math.ceil(total / targetCols);
  const rows = [];
  let remaining = total;
  let rowsLeft = numRows;

  while (rowsLeft > 0) {
    // Prefer full `targetCols` on leading rows whenever the remaining rows still hold >= max(3, targetCols - 2) items each
    const minTailSize = Math.max(3, targetCols - 2);
    if (
      rowsLeft > 1 &&
      remaining - targetCols >= (rowsLeft - 1) * minTailSize &&
      remaining - targetCols <= (rowsLeft - 1) * targetCols
    ) {
      rows.push(targetCols);
      remaining -= targetCols;
      rowsLeft -= 1;
    } else {
      const count = Math.ceil(remaining / rowsLeft);
      rows.push(count);
      remaining -= count;
      rowsLeft -= 1;
    }
  }
  return rows;
}

/**
 * Derive render-time effective grid spans for every item so each row sums strictly to `trackCount`.
 * Uses stored `product.salonSpan` (without mutating data) to assign wider tracks when trackCount % rowLen !== 0.
 */
function computeEffectiveSpans(items, targetCols, trackCount) {
  if (items.length === 0) return [];
  if (targetCols <= 2) {
    return items.map(() => 1);
  }

  const rowCounts = computeBalancedRowCounts(items.length, targetCols);
  const spans = new Array(items.length);
  let cursor = 0;

  for (const rowLen of rowCounts) {
    const base = Math.floor(trackCount / rowLen);
    const rem = trackCount % rowLen;
    const rowSlice = [];
    for (let i = 0; i < rowLen; i++) {
      rowSlice.push({ idx: cursor + i, weight: items[cursor + i]?.salonSpan || 4 });
    }
    // Award any remainder tracks to items with higher stored salonSpan
    const ranked = [...rowSlice].sort((a, b) => b.weight - a.weight || a.idx - b.idx);
    const boosted = new Set(ranked.slice(0, rem).map((entry) => entry.idx));

    for (const entry of rowSlice) {
      spans[entry.idx] = boosted.has(entry.idx) ? base + 1 : base;
    }
    cursor += rowLen;
  }

  return spans;
}

// Subtle salon-hang proportion hierarchy derived from stored `salonSpan` (keeps dead space well below 120px)
const SALON_WIDTH_CLASSES = {
  3: 'w-[92%] max-w-[292px]',
  4: 'w-[96%] max-w-[306px]',
  5: 'w-full max-w-[320px]',
};

// Deliberate vertical salon-hang stagger offsets strictly capped at 24px (DESIGN.md)
const DESKTOP_OFFSET_PX = [0, 18, 6, 22, 10, 14, 24, 4, 16, 8, 20, 0, 12, 6];

function SalonCaseItem({ product, index, effectiveSpan, isMobile, displayModel, onAdd }) {
  const [justAdded, setJustAdded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const spanWeight = product.salonSpan || 4;
  const widthClass = isMobile ? 'w-full' : SALON_WIDTH_CLASSES[spanWeight] || SALON_WIDTH_CLASSES[4];
  const verticalOffsetPx = isMobile
    ? index % 2 === 1
      ? 12
      : 0
    : DESKTOP_OFFSET_PX[index % DESKTOP_OFFSET_PX.length];

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
      style={{
        gridColumn: `span ${effectiveSpan} / span ${effectiveSpan}`,
        marginTop: verticalOffsetPx ? `${verticalOffsetPx}px` : undefined,
      }}
      className="case-lift-group flex flex-col items-start"
    >
      {/* Case sits directly on the plaster wall — NO box, NO border, subtle wall-lift on hover/focus */}
      <div className={widthClass}>
        <PhoneCaseMockup
          model={displayModel}
          artworkId={product.artworkId}
          className="w-full"
          ariaLabel={`جراب ${product.name} لموبايل ${displayModel.name}`}
        />

        {/* Quiet gallery caption: 10-12px below mockup (DESIGN.md) */}
        <div className="mt-[var(--image-to-caption)] text-start">
          <div className="flex items-baseline justify-between gap-x-2 gap-y-1">
            <h3 className="min-w-0 text-start text-[15px] font-medium leading-[1.35] text-[var(--charcoal)] sm:text-[16px] sm:leading-[1.4]">
              <bdi dir="ltr">{product.name}</bdi>
            </h3>
            <span className="shrink-0 text-[14px] font-semibold tabular-nums text-[var(--charcoal)] sm:text-[15px]">
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
 * Reused on `/` (2 full rows matching viewport columns) and `/categories` (full filtered catalog).
 * Reflows with Motion layout animation (400ms) whenever phone model, category, or search changes.
 */
export function SalonHangGrid({
  categoryId = null,
  limit = null,
  previewRows = null,
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

  const { cols, tracks } = useSalonGridSpec();
  const isMobile = cols <= 2;

  const activeSearch = ignoreSearch ? '' : searchQuery;

  const products = useMemo(() => {
    const allMatching = storeService.getProducts({
      modelId: phoneSelection.modelId,
      modelStatus: phoneSelection.status,
      categoryId,
      searchQuery: activeSearch,
    });
    if (previewRows) {
      // Scale home preview cleanly with viewport column count so every preview row is 100% full
      const targetCount = Math.max(6, previewRows * cols);
      return allMatching.slice(0, targetCount);
    }
    return limit ? allMatching.slice(0, limit) : allMatching;
  }, [phoneSelection.modelId, phoneSelection.status, categoryId, activeSearch, limit, previewRows, cols]);

  const effectiveSpans = useMemo(
    () => computeEffectiveSpans(products, cols, tracks),
    [products, cols, tracks]
  );

  const activeCategory = categories.find((c) => c.id === categoryId);

  const sectionHeading = activeSearch.trim()
    ? `نتايج البحث عن "${activeSearch.trim()}"`
    : headingText || (activeCategory ? activeCategory.nameAr : 'المطلوب اليومين دول');

  return (
    <section
      id="designs"
      aria-labelledby="designs-heading"
      className={`scroll-mt-[var(--header-offset)] ${
        compactTop
          ? 'pt-[var(--heading-to-content)] pb-[var(--section-pad-y)]'
          : 'section-band'
      }`}
    >
      <div className="page-container">
        {/* Top bar: section heading + pill phone-model chip grouped cleanly at start (no empty horizontal gulf) */}
        <div className="mb-[var(--heading-to-content)] flex flex-wrap items-center justify-start gap-x-5 gap-y-3">
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
            <div
              className="grid grid-flow-dense items-start gap-x-[var(--grid-col-gap)] gap-y-[var(--grid-row-gap)]"
              style={{
                gridTemplateColumns: `repeat(${tracks}, minmax(0, 1fr))`,
              }}
            >
              <AnimatePresence mode="popLayout">
                {products.map((product, index) => (
                  <SalonCaseItem
                    key={product.id}
                    product={product}
                    index={index}
                    effectiveSpan={effectiveSpans[index] || 1}
                    isMobile={isMobile}
                    displayModel={visualPreviewModel}
                    onAdd={addCatalogProductToCart}
                  />
                ))}
              </AnimatePresence>
            </div>

            {showViewAllLink ? (
              <div className="mt-[var(--heading-to-content)] text-start">
                <Link to="/categories" className="btn-secondary text-[17px]">
                  شوف كل الجرابات
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <div className="py-8 text-start">
            <p className="type-h3 max-w-[60ch] text-[var(--charcoal)]">
              {activeSearch.trim()
                ? 'مفيش تصميمات بالاسم ده دلوقتي. جرّب كلمة تانية أو ارفع تصميمك.'
                : 'مفيش تصميمات للموديل ده لسه. جرّب موبايل تاني أو ارفع تصميمك.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-6">
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

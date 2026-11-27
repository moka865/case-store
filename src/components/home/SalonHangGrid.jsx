import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { storeService } from '../../services/storeService';
import { ModelChip } from '../header/ModelChip';
import { ForwardArrowRtlIcon } from '../icons/Icons';
import { ProductCard } from '../product/ProductCard';

function getColsForWidth(width) {
  if (width >= 1800) return 6;
  if (width >= 1360) return 5;
  if (width >= 1024) return 4;
  if (width >= 680) return 3;
  return 2;
}

function useResponsiveCols() {
  const [cols, setCols] = useState(() =>
    typeof window === 'undefined' ? 4 : getColsForWidth(window.innerWidth)
  );

  useEffect(() => {
    const sync = () => {
      const next = getColsForWidth(window.innerWidth);
      setCols((prev) => (prev === next ? prev : next));
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  return cols;
}

/**
 * Unified responsive product grid for غلاف.
 * Every product card uses the same fixed `--card-bg` stage background,
 * scaling columns up on wide screens (2 -> 3 -> 4 -> 5 -> 6).
 */
export function SalonHangGrid({
  categoryId = null,
  limit = null,
  previewRows = null,
  showViewAllLink = false,
  showQuickCategories = false,
  ignoreSearch = false,
  headingText = null,
  compactTop = false,
}) {
  const {
    categories,
    categoryCounts,
    searchQuery,
    setSearchQuery,
    phoneSelection,
    selectedModel,
    visualPreviewModel,
    setIsModelSelectorOpen,
    addCatalogProductToCart,
  } = useStore();

  const cols = useResponsiveCols();
  const [localCategoryId, setLocalCategoryId] = useState(null);

  const effectiveCategoryId = showQuickCategories ? localCategoryId : categoryId;
  const activeSearch = ignoreSearch ? '' : searchQuery;

  const categoryNameMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.nameAr])),
    [categories]
  );

  const allMatching = useMemo(() => {
    return storeService.getProducts({
      modelId: phoneSelection.modelId,
      modelStatus: phoneSelection.status,
      categoryId: effectiveCategoryId,
      searchQuery: activeSearch,
    });
  }, [phoneSelection.modelId, phoneSelection.status, effectiveCategoryId, activeSearch]);

  const products = useMemo(() => {
    if (previewRows) {
      const targetCount = Math.max(6, previewRows * cols);
      return allMatching.slice(0, targetCount);
    }
    return limit ? allMatching.slice(0, limit) : allMatching;
  }, [allMatching, limit, previewRows, cols]);

  const activeCategory = categories.find((c) => c.id === effectiveCategoryId);

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h2 id="designs-heading" className="type-h2 text-[var(--ink)]">
              {sectionHeading}
            </h2>
            <ModelChip />
            {!ignoreSearch && (categoryId || activeSearch.trim()) ? (
              <Link
                to="/categories"
                onClick={() => setSearchQuery('')}
                className="btn-secondary !min-h-[36px] !text-[14px] text-[var(--ink-muted)]"
              >
                عرض الكل
              </Link>
            ) : null}
          </div>

          {showViewAllLink ? (
            <Link
              to="/categories"
              className="hidden sm:inline-flex items-center gap-1.5 text-[14.5px] font-bold text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
            >
              <span>كل الجرابات ({categoryCounts.all ?? 14})</span>
              <ForwardArrowRtlIcon className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        {showQuickCategories ? (
          <div
            role="tablist"
            aria-label="فلترة سريعة حسب القسم"
            className="no-scrollbar mb-[var(--heading-to-content)] flex items-center gap-2 overflow-x-auto pb-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={localCategoryId === null}
              onClick={() => setLocalCategoryId(null)}
              className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13.5px] font-bold transition-colors cursor-pointer ${
                localCategoryId === null
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                  : 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--card-bg)]'
              }`}
            >
              <span>الكل</span>
              <span className="text-[12px] opacity-75 tabular-nums">{categoryCounts.all ?? 0}</span>
            </button>

            {categories.map((cat) => {
              const isSelected = localCategoryId === cat.id;
              const count = categoryCounts[cat.id] ?? 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setLocalCategoryId(cat.id)}
                  className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13.5px] font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                      : 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--card-bg)]'
                  }`}
                >
                  <span>{cat.nameAr}</span>
                  <span className="text-[12px] opacity-70 tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {products.length > 0 ? (
          <>
            <div
              className="grid gap-x-[var(--grid-col-gap)] gap-y-[var(--grid-row-gap)]"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryNameAr={categoryNameMap[product.categoryId] || ''}
                    displayModel={visualPreviewModel}
                    selectedModel={selectedModel}
                    onAdd={addCatalogProductToCart}
                  />
                ))}
              </AnimatePresence>
            </div>

            {showViewAllLink ? (
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-5">
                <p className="type-caption text-[14px]">
                  كل الجرابات بتتطبع مطفي ضد البصمات وبمقاس فتحة كاميرا موبايلك بالظبط.
                </p>
                <Link to="/categories" className="btn-outline !min-h-[44px]">
                  <span>شوف كل الجرابات ({categoryCounts.all ?? 14})</span>
                  <ForwardArrowRtlIcon className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-6 sm:p-8 text-start">
            <p className="type-h3 max-w-[60ch] text-[var(--ink)]">
              {activeSearch.trim()
                ? 'مفيش تصميمات بالاسم ده دلوقتي. جرب كلمة تانية أو ارفع تصميمك.'
                : 'مفيش تصميمات للموديل ده لسه. جرب موبايل تاني أو ارفع تصميمك.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              {activeSearch.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="btn-primary"
                >
                  امسح البحث
                </button>
              ) : localCategoryId ? (
                <button
                  type="button"
                  onClick={() => setLocalCategoryId(null)}
                  className="btn-primary"
                >
                  اعرض كل الأقسام
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
              <Link to="/customize" className="btn-outline">
                ارفع تصميمك
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

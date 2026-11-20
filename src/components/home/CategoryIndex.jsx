import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

/**
 * Data-driven categories rendered as a large typographic exhibition index
 * directly on the plaster wall — no cards, no pills, no 01/02 numbers, no middle-dots.
 * Clicking a category navigates to `/categories/:slug` ("الكل" -> `/categories`).
 */
export function CategoryIndex({
  selectedCategoryId = null,
  hideHeading = false,
  onCategorySelect = null,
}) {
  const { categories, categoryCounts, setSearchQuery } = useStore();

  const items = [{ id: null, slug: null, nameAr: 'الكل', count: categoryCounts.all ?? 0 }].concat(
    categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      nameAr: cat.nameAr,
      count: categoryCounts[cat.id] ?? 0,
    }))
  );

  return (
    <section
      aria-label={hideHeading ? 'أقسام التصميمات' : undefined}
      aria-labelledby={hideHeading ? undefined : 'categories-heading'}
      className={hideHeading ? 'pt-8 pb-10 md:pt-12 md:pb-16' : 'py-16 md:py-28'}
    >
      <div className="page-container">
        <div
          className={
            hideHeading
              ? 'block'
              : 'grid grid-cols-1 items-baseline gap-6 lg:grid-cols-12 lg:gap-8'
          }
        >
          {!hideHeading ? (
            <div className="lg:col-span-3 text-start">
              <h2 id="categories-heading" className="type-h2 text-[var(--charcoal)]">
                الأقسام
              </h2>
              <p className="type-caption mt-2 max-w-[26ch]">
                اختار الجو اللي يناسب ذوقك، وكل قسم بيتحدّث تلقائي لموبايلك.
              </p>
            </div>
          ) : null}

          <nav
            aria-label="أقسام التصميمات"
            className={`flex flex-wrap items-baseline gap-x-8 gap-y-4 sm:gap-x-12 sm:gap-y-5 ${
              hideHeading ? '' : 'lg:col-span-9'
            }`}
          >
            {items.map((item) => {
              const isSelected = selectedCategoryId === item.id;
              const to = item.slug ? `/categories/${item.slug}` : '/categories';
              return (
                <Link
                  key={item.id ?? 'all'}
                  to={to}
                  aria-current={isSelected ? 'page' : undefined}
                  onClick={() => {
                    setSearchQuery('');
                    onCategorySelect?.(item.slug);
                  }}
                  className={`group inline-flex min-h-[48px] items-baseline gap-2 rounded-[4px] px-2 py-1 text-start transition-colors duration-150 ${
                    isSelected
                      ? 'is-selected text-[var(--charcoal)]'
                      : 'text-[var(--charcoal)]/65 hover:text-[var(--charcoal)]'
                  }`}
                >
                  <span className="text-[28px] leading-[1.3] font-bold sm:text-[40px] lg:text-[48px]">
                    {item.nameAr}
                  </span>
                  <span className="type-caption tabular-nums text-[14px] sm:text-[15px]">
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
}

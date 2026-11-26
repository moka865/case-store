import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { PageHeading } from '../components/common/PageHeading';
import { CategoryIndex } from '../components/home/CategoryIndex';
import { SalonHangGrid } from '../components/home/SalonHangGrid';
import { useStore } from '../context/StoreContext';

/**
 * Categories page (`/categories` and `/categories/:slug`):
 * Leads with the full typographic exhibition category index, followed by the
 * complete filtered salon-hang grid synced with URL slug, phone model, and search.
 */
export function CategoriesPage() {
  const { slug } = useParams();
  const { categories, setSearchQuery } = useStore();
  const prefersReducedMotion = useReducedMotion();

  // Incremented only when the user clicks a category in the index (never on refresh or model change)
  const [scrollTrigger, setScrollTrigger] = useState(0);

  const matchedCategory = useMemo(() => {
    if (!slug) return null;
    return categories.find((c) => c.slug === slug) || null;
  }, [categories, slug]);

  const isUnknownSlug = Boolean(slug && !matchedCategory);

  useEffect(() => {
    if (scrollTrigger === 0) return;

    const rafId = window.requestAnimationFrame(() => {
      const target = document.getElementById('designs');
      if (target) {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [scrollTrigger, slug, prefersReducedMotion]);

  return (
    <div className="page-band-top">
      <div className="page-container">
        <PageHeading
          title="الأقسام"
          description="اختار الجو اللي يناسب ذوقك، وكل قسم بيتحدّث تلقائي لموبايلك."
        />
      </div>

      <CategoryIndex
        selectedCategoryId={matchedCategory ? matchedCategory.id : null}
        hideHeading
        onCategorySelect={() => setScrollTrigger((n) => n + 1)}
      />

      {isUnknownSlug ? (
        <section className="section-band">
          <div className="page-container">
            <div className="text-start">
              <p className="type-h3 max-w-[60ch] text-[var(--charcoal)]">
                القسم ده مش موجود. اختار قسم من فوق أو شوف كل الجرابات المتاحة.
              </p>
              <div className="mt-6">
                <Link
                  to="/categories"
                  onClick={() => setSearchQuery('')}
                  className="btn-primary"
                >
                  عرض كل الجرابات
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <SalonHangGrid
          categoryId={matchedCategory ? matchedCategory.id : null}
          headingText={matchedCategory ? matchedCategory.nameAr : 'كل الجرابات'}
          compactTop
        />
      )}
    </div>
  );
}

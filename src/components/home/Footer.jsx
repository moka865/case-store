import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';

/**
 * Minimal gallery footer directly on the plaster wall.
 * Uses real routed links, zero middle-dot strings, zero heavy divider slabs.
 */
export function Footer() {
  const { categories } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="pt-[var(--section-pad-y)] pb-8 md:pb-10">
      <div className="page-container">
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12 md:items-end md:gap-x-[var(--grid-col-gap)]">
          <div className="text-start md:col-span-3">
            <Link to="/" className="text-[22px] font-bold text-[var(--charcoal)]">
              {STORE_CONFIG.name}
            </Link>
            <p className="type-caption mt-1.5 max-w-[36ch]">
              جرابات مطبوعة على مزاجك لمقاس موبايلك بالظبط.
            </p>
          </div>

          <nav
            aria-label="روابط سريعة"
            className="flex flex-wrap items-center justify-start gap-x-5 gap-y-1 md:col-span-3 md:justify-between"
          >
            <Link to="/" className="btn-secondary !text-[15px]">
              الرئيسية
            </Link>
            <Link to="/categories" className="btn-secondary !text-[15px]">
              الأقسام
            </Link>
            <Link to="/customize" className="btn-secondary !text-[15px]">
              صمّم جرابك
            </Link>
            <Link to="/how-it-works" className="btn-secondary !text-[15px]">
              إزاي تطلب
            </Link>
          </nav>

          <nav
            aria-label="الأقسام"
            className="flex flex-wrap items-center justify-start gap-x-4 gap-y-1 md:col-span-4 md:justify-between"
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="btn-secondary !text-[15px] text-[var(--graphite)]"
              >
                {cat.nameAr}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-0.5 text-start md:col-span-2 md:items-end md:text-end">
            <p className="type-caption">الدفع عند الاستلام لكل مصر</p>
            <p className="type-caption tabular-nums">
              © {year} {STORE_CONFIG.name}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

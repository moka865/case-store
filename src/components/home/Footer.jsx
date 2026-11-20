import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';

/**
 * Minimal gallery footer directly on the plaster wall.
 * Uses real routed links, zero middle-dot strings, zero heavy divider slabs.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="pt-12 pb-14 md:pt-20 md:pb-16">
      <div className="page-container">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="text-start">
            <Link to="/" className="text-[24px] font-bold text-[var(--charcoal)]">
              {STORE_CONFIG.name}
            </Link>
            <p className="type-caption mt-2 max-w-[38ch]">
              جرابات مطبوعة على مزاجك. الدفع عند الاستلام والتوصيل لكل محافظات مصر.
            </p>
          </div>

          <nav aria-label="روابط سريعة" className="flex flex-wrap items-center gap-6">
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

          <p className="type-caption tabular-nums">
            © {year} {STORE_CONFIG.name}
          </p>
        </div>
      </div>
    </footer>
  );
}

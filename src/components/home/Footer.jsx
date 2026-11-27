import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { GhilafLogo } from '../brand/GhilafLogo';
import { CashCodIcon } from '../icons/Icons';

/**
 * Grounded Cairo Print-House Footer.
 * Anchors every page with dark press-ink surface, custom GhilafLogo SVG, real crawlable
 * category & store links, and single config-driven support metadata (zero invented phone numbers/addresses).
 */
export function Footer() {
  const { categories, setIsModelSelectorOpen } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-[var(--section-pad-y)] border-t-2 border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]">
      {/* Signature Vermilion & Sunburst top registration rule */}
      <div className="flex h-1.5 w-full" aria-hidden="true">
        <span className="w-2/3 bg-[var(--brand)]" />
        <span className="w-1/3 bg-[var(--sun)]" />
      </div>

      <div className="page-container py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-x-[var(--grid-col-gap)]">
          {/* Brand identity & config-driven support note (cols 1-5) */}
          <div className="text-start md:col-span-5">
            <Link
              to="/"
              aria-label={`${STORE_CONFIG.name} — الصفحة الرئيسية`}
              className="inline-flex items-center rounded-[var(--radius-ui)] py-1"
            >
              <GhilafLogo theme="dark" size="lg" />
            </Link>

            <p className="mt-3 max-w-[38ch] text-[15px] leading-[1.7] text-white/80">
              {STORE_CONFIG.taglineAr}. كل جراب بيتطبع مخصوص على قالب موبايلك وفتحة كاميرته.
            </p>

            <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-[var(--radius-ui)] border border-white/15 bg-white/5 px-3.5 py-2 text-[13px] text-white/85">
              <CashCodIcon className="h-4 w-4 text-[var(--sun)]" />
              <span>{STORE_CONFIG.contact.supportNoteAr}</span>
              <span className="text-white/35" aria-hidden="true">·</span>
              <span className="text-white/70">{STORE_CONFIG.contact.hoursAr}</span>
            </div>
          </div>

          {/* Store navigation (cols 6-8) */}
          <nav aria-label="روابط المتجر" className="text-start md:col-span-3">
            <h2 className="font-[var(--font-display)] text-[16px] font-bold text-[var(--sun)]">
              المتجر
            </h2>
            <ul className="mt-3 space-y-2 text-[14.5px]">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-white/80 hover:text-white transition-colors">
                  كل التصميمات
                </Link>
              </li>
              <li>
                <Link to="/customize" className="text-white/80 hover:text-white transition-colors">
                  صمّم بصورتك أو اسمك
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-white/80 hover:text-white transition-colors">
                  إزاي تطلب والشحن
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsModelSelectorOpen(true)}
                  className="text-white/80 hover:text-[var(--sun)] transition-colors cursor-pointer"
                >
                  اختار موديل موبايلك
                </button>
              </li>
            </ul>
          </nav>

          {/* Categories navigation (cols 9-12) */}
          <nav aria-label="أقسام التصميمات" className="text-start md:col-span-4">
            <h2 className="font-[var(--font-display)] text-[16px] font-bold text-[var(--sun)]">
              الأقسام
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[14.5px]">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/categories/${cat.slug}`}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {cat.nameAr}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-9 flex flex-col items-start justify-between gap-3 border-t border-white/12 pt-5 text-[13px] text-white/65 sm:flex-row sm:items-center">
          <p>
            {STORE_CONFIG.paymentLabelAr} متاح في جميع محافظات مصر · طباعة مطفية عالية الدقة
          </p>
          <p className="tabular-nums">
            © {year} {STORE_CONFIG.name} — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from '../brand/BrandLogo';
import { SocialLinks } from '../common/SocialLinks';
import { ClockIcon, EyeIcon, ExchangeIcon, ForwardArrowRtlIcon } from '../icons/Icons';

const STORE_LINKS = [
  { to: '/', label: 'الرئيسية' },
  { to: '/categories', label: 'كل الجرابات' },
  { to: '/customize', label: 'صمم جرابك' },
  { to: '/how-it-works', label: 'إزاي تطلب والشحن' },
];

const POLICY_HIGHLIGHTS = [
  { Icon: ExchangeIcon, text: 'استبدال ببلاش لو فيه مشكلة في الطباعة أو الموديل مختلف' },
  { Icon: ClockIcon, text: `تنفيذ الطلب خلال ${STORE_CONFIG.maxProductionDays} أيام كحد أقصى` },
  { Icon: EyeIcon, text: 'عاين جرابك عند الاستلام قبل ما تدفع' },
];

const linkClass =
  'inline-flex min-h-[44px] items-center text-[15px] text-white/80 transition-colors hover:text-white lg:min-h-[36px]';

/**
 * Brand-black footer: logo + socials, store links, and a policy card that leads to
 * the Terms & Conditions page. Shares the Crimson + Gold rule used by the mobile drawer.
 */
export function Footer() {
  const { setIsModelSelectorOpen } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-[var(--section-pad-y)] bg-[var(--brand-black)] text-white">
      <div className="flex h-1 w-full" aria-hidden="true">
        <span className="w-2/3 bg-[var(--brand)]" />
        <span className="w-1/3 bg-[var(--brand-yellow)]" />
      </div>

      <div className="page-container pt-10 pb-6 sm:pt-12 lg:pt-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
          {/* Brand + socials */}
          <div className="text-start lg:col-span-4">
            <Link
              to="/"
              aria-label={`${STORE_CONFIG.name} — الصفحة الرئيسية`}
              className="inline-flex items-center rounded-[var(--radius-ui)] py-1"
            >
              <BrandLogo size="lg" />
            </Link>

            <p className="mt-4 max-w-[36ch] text-[15px] leading-[1.75] text-white/75">
              {STORE_CONFIG.taglineAr}. كل جراب بيتطبع مخصوص على قالب موبايلك وفتحة كاميرته.
            </p>

            <p className="mt-6 text-[13px] font-bold text-[var(--brand-yellow)]">تابعنا</p>
            <SocialLinks tone="dark" className="mt-2.5" />
          </div>

          {/* Store links */}
          <nav aria-label="روابط المتجر" className="text-start lg:col-span-3 lg:ps-6">
            <h2 className="font-[family-name:var(--font-display)] text-[16px] font-bold text-[var(--brand-yellow)]">
              المتجر
            </h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 lg:mt-3 lg:grid-cols-1 lg:gap-y-1">
              {STORE_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  data-model-selector-trigger="true"
                  onClick={() => setIsModelSelectorOpen(true)}
                  className={`${linkClass} cursor-pointer text-start hover:!text-[var(--brand-yellow)]`}
                >
                  اختار موديل موبايلك
                </button>
              </li>
            </ul>
          </nav>

          {/* Policy card -> Terms page */}
          <div className="text-start lg:col-span-5">
            <div className="rounded-[var(--radius-stage)] border border-white/12 bg-white/[0.04] p-5 sm:p-6">
              <h2 className="font-[family-name:var(--font-display)] text-[16px] font-bold text-white">
                قبل ما تطلب، اعرف حقك
              </h2>
              <ul className="mt-4 space-y-3">
                {POLICY_HIGHLIGHTS.map(({ Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-[14.5px] leading-[1.6] text-white/85">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-ui)] bg-[var(--brand-yellow)] text-[var(--ink)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/12 pt-4">
                <Link
                  to="/terms"
                  className="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-bold text-[var(--brand-yellow)] underline decoration-[1.5px] underline-offset-[6px] hover:text-white"
                >
                  <span>اقرا الشروط والأحكام</span>
                  <ForwardArrowRtlIcon className="h-4 w-4" />
                </Link>
                <span className="text-[13px] text-white/60">
                  خدمة العملاء {STORE_CONFIG.contact.hoursAr}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-3 border-t border-white/12 pt-5 text-[13px] text-white/60 sm:flex-row sm:items-center">
          <p className="tabular-nums">
            © {year} {STORE_CONFIG.name} — جميع الحقوق محفوظة
          </p>
          <Link to="/terms" className="inline-flex min-h-[36px] items-center text-white/70 hover:text-white">
            الشروط والأحكام
          </Link>
        </div>
      </div>
    </footer>
  );
}

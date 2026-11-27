import { Link } from 'react-router-dom';
import { PageHeading } from '../components/common/PageHeading';
import { SocialLinks } from '../components/common/SocialLinks';
import {
  BackArrowRtlIcon,
  CheckIcon,
  ClockIcon,
  ExchangeIcon,
  EyeIcon,
} from '../components/icons/Icons';
import { STORE_CONFIG } from '../config/store';
import { CORE_TERMS, EXTRA_TERMS, TERMS_HIGHLIGHTS, TERMS_INTRO } from '../data/terms';

const HIGHLIGHT_ICONS = {
  exchange: ExchangeIcon,
  production: ClockIcon,
  inspect: EyeIcon,
};

const ALL_TERMS = [...CORE_TERMS, ...EXTRA_TERMS];

function TermBlock({ block }) {
  if (block.type === 'list') {
    return (
      <ul className="space-y-2">
        {block.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[16px] leading-[1.75] text-[var(--ink)]">
            <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'highlight') {
    return (
      <p className="flex items-start gap-2.5 rounded-[var(--radius-ui)] border border-[var(--jade)]/20 bg-[var(--jade-tint)] px-4 py-3 text-[15.5px] font-semibold leading-[1.7] text-[var(--jade)]">
        <CheckIcon className="mt-1.5 h-4 w-4 shrink-0" />
        <span>{block.text}</span>
      </p>
    );
  }

  if (block.type === 'note') {
    return (
      <div className="rounded-[var(--radius-ui)] border-s-[3px] border-[var(--brand-yellow)] bg-[var(--card-bg)] px-4 py-3">
        <p className="text-[14px] font-bold text-[var(--ink)]">{block.title}</p>
        <p className="mt-0.5 text-[15px] leading-[1.7] text-[var(--ink-muted)]">{block.text}</p>
      </div>
    );
  }

  return <p className="text-[16px] leading-[1.8] text-[var(--ink)]">{block.text}</p>;
}

function TermSection({ term, index }) {
  const headingId = `terms-${term.id}-heading`;
  return (
    <section
      id={term.id}
      aria-labelledby={headingId}
      className="scroll-mt-[calc(var(--header-offset)+16px)] rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 sm:p-7"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="latin-title flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-ui)] bg-[var(--brand-black)] text-[15px] font-extrabold tabular-nums text-[var(--brand-yellow)]"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 id={headingId} className="type-h3 text-[var(--ink)]">
          {term.title}
        </h2>
      </div>
      <div className="mt-4 max-w-[68ch] space-y-3.5">
        {term.blocks.map((block, i) => (
          <TermBlock key={`${term.id}-${i}`} block={block} />
        ))}
      </div>
    </section>
  );
}

/**
 * Terms & Conditions page (`/terms`): sticky contents spine on desktop, at-a-glance
 * policy tiles, numbered policy cards, and a brand-black closing card with ways back to the store.
 */
export function TermsPage() {
  return (
    <div className="page-band-single">
      <div className="page-container">
        <nav aria-label="مسار الصفحة" className="mb-5 text-[13.5px]">
          <Link
            to="/"
            className="inline-flex min-h-[36px] items-center gap-1.5 font-semibold text-[var(--ink)] hover:text-[var(--brand)]"
          >
            <BackArrowRtlIcon className="h-3.5 w-3.5" />
            <span>ارجع للمتجر</span>
          </Link>
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
          {/* Spine: title + contents */}
          <aside className="text-start lg:sticky lg:top-[var(--header-offset)] lg:col-span-4">
            <span className="badge-brand-yellow">سياسات {STORE_CONFIG.name}</span>
            <PageHeading title={TERMS_INTRO.title} description={TERMS_INTRO.subtitle} className="mt-3" />

            <nav aria-label="محتويات الصفحة" className="mt-6 border-t border-[var(--border-subtle)] pt-5">
              <p className="mb-2.5 text-[13px] font-bold text-[var(--ink-muted)]">المحتويات</p>
              <ol className="no-scrollbar -mx-[var(--page-margin)] flex snap-x gap-2 overflow-x-auto px-[var(--page-margin)] pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
                {ALL_TERMS.map((term, index) => (
                  <li key={term.id} className="shrink-0 snap-start">
                    <a
                      href={`#${term.id}`}
                      className="inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3.5 text-[13.5px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)] lg:w-full lg:whitespace-normal lg:rounded-[var(--radius-ui)] lg:border-transparent lg:bg-transparent lg:px-2.5 lg:text-[14.5px] lg:hover:border-transparent lg:hover:bg-[var(--card-bg)]"
                    >
                      <span className="latin-title text-[12px] font-bold tabular-nums text-[var(--ink-muted)]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{term.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-4 lg:col-span-8">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {TERMS_HIGHLIGHTS.map((item) => {
                const Icon = HIGHLIGHT_ICONS[item.id];
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3.5 rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--card-bg)] p-4 sm:flex-col sm:items-start sm:gap-3"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-ui)] bg-[var(--brand-yellow)] text-[var(--ink)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-[19px] font-extrabold leading-tight tabular-nums text-[var(--ink)]">
                        {item.value}
                      </p>
                      <p className="mt-1 text-[13.5px] leading-[1.55] text-[var(--ink-muted)]">{item.label}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {CORE_TERMS.map((term, index) => (
              <TermSection key={term.id} term={term} index={index} />
            ))}

            <div className="flex items-center gap-3 pt-4 pb-1" role="presentation">
              <span className="text-[14px] font-bold text-[var(--ink)]">شروط إضافية لحماية طلبك</span>
              <span className="h-px flex-1 bg-[var(--border-strong)]" aria-hidden="true" />
            </div>

            {EXTRA_TERMS.map((term, index) => (
              <TermSection key={term.id} term={term} index={CORE_TERMS.length + index} />
            ))}

            {/* Closing card */}
            <div className="overflow-hidden rounded-[var(--radius-stage)] bg-[var(--brand-black)] text-white">
              <div className="flex h-1 w-full" aria-hidden="true">
                <span className="w-2/3 bg-[var(--brand)]" />
                <span className="w-1/3 bg-[var(--brand-yellow)]" />
              </div>
              <div className="brand-dark-bar flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-end md:justify-between">
                <div className="text-start">
                  <p className="font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-[1.4] sm:text-[26px]">
                    {TERMS_INTRO.closing}
                  </p>
                  <p className="mt-2 text-[14px] text-white/70">
                    عندك سؤال؟ خدمة العملاء متاحة {STORE_CONFIG.contact.hoursAr}
                  </p>
                  <SocialLinks tone="dark" className="mt-4" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/categories" className="btn-primary">
                    شوف الجرابات
                  </Link>
                  <Link to="/customize" className="btn-outline">
                    صمم جرابك
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

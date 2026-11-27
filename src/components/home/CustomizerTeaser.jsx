import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { ForwardArrowRtlIcon } from '../icons/Icons';
import { SAMPLE_CUSTOM_IMAGES } from '../mockup/CaseArtworks';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

/**
 * Unified Customizer Teaser Section on the Home Page.
 * Uses the exact same typography, button styling, border language, and fixed `.product-stage`
 * (`--card-bg`) background across all three preview cases for strict storefront consistency.
 */
export function CustomizerTeaser() {
  const { visualPreviewModel } = useStore();
  const sunsetSample = SAMPLE_CUSTOM_IMAGES[0];
  const studioSample = SAMPLE_CUSTOM_IMAGES[1] || SAMPLE_CUSTOM_IMAGES[0];

  return (
    <section aria-labelledby="teaser-heading" className="section-band">
      <div className="page-container">
        <div className="rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 items-center gap-y-8 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
            {/* Start side (5 cols): Clear 1-path customization pitch */}
            <div className="text-start lg:col-span-5">
              <span className="badge-brand-yellow">
                جراب بصورتك أو اسمك — {STORE_CONFIG.customCasePrice} {STORE_CONFIG.currencyLabel}
              </span>

              <h2 id="teaser-heading" className="type-h1 mt-4 text-[var(--ink)]">
                عندك صورة في بالك؟ اطبعها على جرابك.
              </h2>

              <p className="type-body mt-3 max-w-[46ch] text-[var(--ink-muted)]">
                ارفع أي صورة من موبايلك أو اكتب اسمك بـ 8 خطوط عربي وإنجليزي، وشوف شكل الجراب على كاميرا موبايلك قبل الطباعة.
              </p>

              <ol className="mt-5 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[var(--ink)]">
                <li className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--card-bg)] px-2.5 py-1">
                  1. ارفع صورتك
                </li>
                <li className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--card-bg)] px-2.5 py-1">
                  2. اكتب اسمك لو حابب
                </li>
                <li className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--card-bg)] px-2.5 py-1">
                  3. عاين واطلب كاش
                </li>
              </ol>

              <div className="mt-7">
                <Link to="/customize" className="btn-primary">
                  <span>ابدأ تصميم جرابك</span>
                  <ForwardArrowRtlIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* End side (7 cols): 3 live customized previews sharing the exact fixed `.product-stage` backdrop */}
            <div
              aria-hidden="true"
              className="grid grid-cols-2 items-stretch gap-3.5 sm:grid-cols-3 sm:gap-4 lg:col-span-7"
            >
              <div className="product-stage flex flex-col items-center justify-between p-3.5 sm:p-4">
                <span className="self-start rounded-[6px] bg-[var(--surface)]/85 px-2 py-0.5 text-[11px] font-bold text-[var(--ink)]">
                  صورة + خط رقعة
                </span>
                <div className="my-3 w-[72%] max-w-[164px]">
                  <PhoneCaseMockup
                    model={visualPreviewModel}
                    interactive={false}
                    customImage={{
                      url: sunsetSample.url,
                      x: 0,
                      y: 0,
                      scale: 1,
                      rotation: 0,
                    }}
                    printedName={{
                      enabled: true,
                      text: 'نور',
                      script: 'arabic',
                      fontFamily: '"Aref Ruqaa", serif',
                      fontWeight: 700,
                      letterSpacing: '0px',
                      placement: 'bottom',
                      ink: 'light',
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="product-stage flex flex-col items-center justify-between p-3.5 sm:p-4">
                <span className="self-start rounded-[6px] bg-[var(--surface)]/85 px-2 py-0.5 text-[11px] font-bold text-[var(--ink)]">
                  اسم إنجليزي
                </span>
                <div className="my-3 w-[72%] max-w-[164px]">
                  <PhoneCaseMockup
                    model={visualPreviewModel}
                    interactive={false}
                    printedName={{
                      enabled: true,
                      text: 'Youssef',
                      script: 'latin',
                      fontFamily: '"Syne", sans-serif',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      placement: 'center',
                      ink: 'dark',
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="product-stage hidden sm:flex flex-col items-center justify-between p-4">
                <span className="self-start rounded-[6px] bg-[var(--surface)]/85 px-2 py-0.5 text-[11px] font-bold text-[var(--ink)]">
                  صورة + خط عربي
                </span>
                <div className="my-3 w-[72%] max-w-[164px]">
                  <PhoneCaseMockup
                    model={visualPreviewModel}
                    interactive={false}
                    customImage={{
                      url: studioSample.url,
                      x: 0,
                      y: 0,
                      scale: 1,
                      rotation: 0,
                    }}
                    printedName={{
                      enabled: true,
                      text: 'سلمى',
                      script: 'arabic',
                      fontFamily: '"Cairo", sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0px',
                      placement: 'bottom',
                      ink: 'dark',
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

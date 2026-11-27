import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { ForwardArrowRtlIcon } from '../icons/Icons';
import { SAMPLE_CUSTOM_IMAGES } from '../mockup/CaseArtworks';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

/**
 * Asymmetric Carbon Print-Studio Customizer Split on the Home Page.
 * Contrasts cleanly against the sunlit paper catalog grid and makes the custom photo + name
 * path immediately obvious in one glance.
 */
export function CustomizerTeaser() {
  const { visualPreviewModel } = useStore();
  const sunsetSample = SAMPLE_CUSTOM_IMAGES[0];
  const studioSample = SAMPLE_CUSTOM_IMAGES[1] || SAMPLE_CUSTOM_IMAGES[0];

  return (
    <section aria-labelledby="teaser-heading" className="section-band">
      <div className="page-container">
        <div className="overflow-hidden rounded-[20px] border-[1.5px] border-[var(--ink)] bg-[var(--ink)] p-6 text-[var(--paper)] sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 items-center gap-y-8 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
            {/* Start side (5 cols): Clear 1-path customization pitch */}
            <div className="text-start lg:col-span-5">
              <span className="stamp-sun">
                طبعة مخصوصة — {STORE_CONFIG.customCasePrice} {STORE_CONFIG.currencyLabel}
              </span>

              <h2 id="teaser-heading" className="type-h1 mt-4 text-white">
                عندك صورة أو اسم؟ نطبعهم على جرابك.
              </h2>

              <p className="type-body mt-3 max-w-[46ch] text-white/80">
                ارفع أي صورة من موبايلك أو اكتب اسمك بـ 8 خطوط عربي وإنجليزي، وحرّك التصميم على شكل كاميرا موبايلك قبل ما نطبع.
              </p>

              {/* Simple 3-step micro-path */}
              <ol className="mt-5 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-white/90">
                <li className="rounded-[6px] border border-white/20 bg-white/10 px-2.5 py-1">
                  1. ارفع صورتك
                </li>
                <li className="rounded-[6px] border border-white/20 bg-white/10 px-2.5 py-1">
                  2. اكتب اسمك لو حابب
                </li>
                <li className="rounded-[6px] border border-white/20 bg-white/10 px-2.5 py-1">
                  3. عاين واطلب كاش
                </li>
              </ol>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  to="/customize"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-ui)] border-[1.5px] border-white bg-[var(--brand)] px-6 text-[15.5px] font-bold text-white shadow-[-3px_3px_0_#F7C948] transition-transform duration-150 hover:bg-[var(--brand-hover)] hover:translate-x-[1px] hover:-translate-y-[1px]"
                >
                  <span>ابدأ تصميم جرابك</span>
                  <ForwardArrowRtlIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* End side (7 cols): 3 live customized case proofs on sunlit studio plinths */}
            <div
              aria-hidden="true"
              className="grid grid-cols-2 items-stretch gap-3.5 sm:grid-cols-3 sm:gap-4 lg:col-span-7"
            >
              <div className="flex flex-col items-center justify-between rounded-[14px] bg-[#EFE9DD] p-3.5 sm:p-4 text-[var(--ink)]">
                <span className="self-start rounded-[5px] bg-white/80 px-2 py-0.5 text-[11px] font-bold">
                  صورة + خط رقعة
                </span>
                <div className="my-3 w-[74%] max-w-[168px]">
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

              <div className="flex flex-col items-center justify-between rounded-[14px] bg-[#E6ECF6] p-3.5 sm:p-4 text-[var(--ink)]">
                <span className="self-start rounded-[5px] bg-white/80 px-2 py-0.5 text-[11px] font-bold">
                  اسم إنجليزي عريض
                </span>
                <div className="my-3 w-[74%] max-w-[168px]">
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

              <div className="hidden sm:flex flex-col items-center justify-between rounded-[14px] bg-[#E3EFE8] p-4 text-[var(--ink)]">
                <span className="self-start rounded-[5px] bg-white/80 px-2 py-0.5 text-[11px] font-bold">
                  صورة + خط كوفي
                </span>
                <div className="my-3 w-[74%] max-w-[168px]">
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
                      fontFamily: '"Reem Kufi", sans-serif',
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

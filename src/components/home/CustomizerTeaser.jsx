import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { SAMPLE_CUSTOM_IMAGES } from '../mockup/CaseArtworks';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

/**
 * Calm, asymmetric customizer teaser strip on the Home page.
 * Sits directly on the plaster wall without cards, boxes, or embedded controls.
 */
export function CustomizerTeaser() {
  const { visualPreviewModel } = useStore();
  const sunsetSample = SAMPLE_CUSTOM_IMAGES[0];
  const studioSample = SAMPLE_CUSTOM_IMAGES[1] || SAMPLE_CUSTOM_IMAGES[0];

  return (
    <section aria-labelledby="teaser-heading" className="section-band">
      <div className="page-container">
        <div className="grid grid-cols-1 items-center gap-y-6 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
          {/* Start side (right, 5 cols): concise copy (60ch on <p> only) + primary route CTA */}
          <div className="text-start lg:col-span-5">
            <h2 id="teaser-heading" className="type-h1 text-[var(--charcoal)]">
              عندك صورة في بالك؟
            </h2>
            <p className="type-body mt-3 max-w-[48ch] text-[var(--graphite)]">
              ارفع صورتك واكتب اسمك بالخط اللي يعجبك، وشوف شكل الجراب على موبايلك قبل ما نطبعه.
            </p>
            <div className="mt-6">
              <Link to="/customize" className="btn-primary">
                صمم جرابك
              </Link>
            </div>
          </div>

          {/* End side (7 cols): 3 scaled live-preview mockups filling the full column width cleanly */}
          <div
            aria-hidden="true"
            className="grid grid-cols-2 items-start gap-[var(--grid-col-gap)] sm:grid-cols-3 lg:col-span-7"
          >
            <div className="w-full max-w-[260px]">
              <PhoneCaseMockup
                model={visualPreviewModel}
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

            <div className="mt-4 w-full max-w-[260px] sm:mt-5">
              <PhoneCaseMockup
                model={visualPreviewModel}
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

            <div className="hidden w-full max-w-[260px] sm:mt-2 sm:block">
              <PhoneCaseMockup
                model={visualPreviewModel}
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
    </section>
  );
}

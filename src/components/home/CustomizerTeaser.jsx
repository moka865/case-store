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

  return (
    <section aria-labelledby="teaser-heading" className="py-16 md:py-28">
      <div className="page-container">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Start side (right): concise copy + primary route CTA */}
          <div className="text-start lg:col-span-6">
            <h2 id="teaser-heading" className="type-h1 text-[var(--charcoal)]">
              عندك صورة في بالك؟
            </h2>
            <p className="type-body mt-4 max-w-[42ch] text-[var(--graphite)]">
              ارفع صورتك واكتب اسمك بالخط اللي يعجبك، وشوف شكل الجراب على موبايلك قبل ما نطبعه.
            </p>
            <div className="mt-7">
              <Link to="/customize" className="btn-primary">
                صمم جرابك
              </Link>
            </div>
          </div>

          {/* End side (center-end, cols 7-11): two quiet offset static mini mockups pulled inward to form one lockup */}
          <div
            aria-hidden="true"
            className="flex items-start justify-start gap-6 sm:gap-8 lg:col-span-5 lg:col-start-7"
          >
            <div className="w-[136px] sm:w-[158px]">
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

            <div className="mt-10 w-[120px] sm:w-[140px]">
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
          </div>
        </div>
      </div>
    </section>
  );
}

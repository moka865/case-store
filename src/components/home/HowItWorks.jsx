import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

/**
 * Reusable HowItWorks steps section directly on the plaster wall.
 * - `editorial`: large open vertical narrative list used inside `/how-it-works`
 * - `compact`: 4+8 col summary layout
 * Zero cards, zero icons, zero 01/02/03 decorative numbering.
 */
const STEPS = [
  {
    step: '1',
    title: 'اختار موبايلك',
    description:
      'حدد ماركة وموديل موبايلك من القايمة عشان كل جراب يوصلك بمقاسه وفتحة كاميرته بالظبط. ولو موديلك مش موجود، ابعتهولنا وخدمة العملاء هتتواصل معاك لتأكيده.',
    actionType: 'select-model',
  },
  {
    step: '2',
    title: 'اختار تصميم أو ارفع صورتك',
    description:
      'نقّي من التصميمات الجاهزة في الأقسام، أو ارفع أي صورة من عندك واكتب اسمك بالعربي أو الإنجليزي بالخط اللي يعجبك وشوف المعاينة لحظة بلحظة.',
    actionType: 'browse-or-customize',
  },
  {
    step: '3',
    title: 'نطبع ونوصّلك لحد البيت',
    description:
      'فريق التصميم عندنا بيراجع الصورة ويظبط القص ومكان الكاميرا قبل الطباعة، وبعدها بنطبع جرابك ونبعتهولك لحد باب البيت والدفع كاش عند الاستلام.',
    actionType: null,
  },
];

export function HowItWorks({ variant = 'compact' }) {
  const { setIsModelSelectorOpen } = useStore();

  if (variant === 'editorial') {
    return (
      <ol aria-label="خطوات الطلب" className="space-y-8 md:space-y-10">
        {STEPS.map((item) => (
          <li key={item.step} className="text-start">
            <h2 className="flex items-baseline gap-3 text-[24px] leading-[1.3] font-bold text-[var(--charcoal)] sm:text-[30px]">
              <span className="text-[16px] font-semibold tabular-nums text-[var(--graphite)] sm:text-[18px]">
                {item.step}
              </span>
              <span>{item.title}</span>
            </h2>
            <p className="type-body mt-3 max-w-[60ch] text-[var(--graphite)]">
              {item.description}
            </p>

            {item.actionType === 'select-model' ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setIsModelSelectorOpen(true)}
                  className="btn-secondary !text-[15px]"
                >
                  اختار موبايلك دلوقتي
                </button>
              </div>
            ) : null}

            {item.actionType === 'browse-or-customize' ? (
              <div className="mt-3 flex flex-wrap items-center gap-6">
                <Link to="/categories" className="btn-secondary !text-[15px]">
                  شوف الأقسام
                </Link>
                <Link to="/customize" className="btn-secondary !text-[15px]">
                  ارفع صورتك
                </Link>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <section aria-labelledby="how-heading" className="section-band">
      <div className="page-container">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
          <div className="lg:col-span-4 text-start">
            <h2 id="how-heading" className="type-h2 text-[var(--charcoal)]">
              إزاي بتطلب؟
            </h2>
            <p className="type-body mt-3 max-w-[40ch] text-[var(--graphite)]">
              ثلاث خطوات بسيطة والدفع كاش عند الاستلام لما المندوب يوصلك.
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-8 lg:gap-x-[var(--grid-col-gap)]">
            {STEPS.map((item) => (
              <li key={item.step} className="text-start">
                <h3 className="type-h3 flex items-baseline gap-2.5 text-[var(--charcoal)]">
                  <span className="text-[15px] font-semibold tabular-nums text-[var(--graphite)]">
                    {item.step}
                  </span>
                  <span>{item.title}</span>
                </h3>
                <p className="type-body mt-3 text-[16px] leading-[1.7] text-[var(--graphite)]">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

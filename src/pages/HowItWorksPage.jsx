import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../components/common/PageHeading';
import { HowItWorks } from '../components/home/HowItWorks';
import { STORE_CONFIG } from '../config/store';
import { useStore } from '../context/StoreContext';

/**
 * Editorial "How it works" page (`/how-it-works`):
 * Distinct sticky-spine + open typographic flow directly on the plaster wall.
 * Reuses `<HowItWorks variant="editorial" />` plus data-driven governorate shipping tiers.
 */
export function HowItWorksPage() {
  const { governorates } = useStore();

  const activeGovernorates = useMemo(
    () => governorates.filter((g) => g.codAvailable !== false),
    [governorates]
  );

  const shippingTiers = useMemo(() => {
    if (!activeGovernorates.length) return [];
    const cairoGiza = activeGovernorates.filter((g) => g.id === 'cairo' || g.id === 'giza');
    const alex = activeGovernorates.find((g) => g.id === 'alexandria');
    const rest = activeGovernorates.filter(
      (g) => g.id !== 'cairo' && g.id !== 'giza' && g.id !== 'alexandria'
    );
    const restFees = rest.map((g) => g.shippingFee);

    return [
      {
        label: cairoGiza.map((g) => g.nameAr).join(' و'),
        feeText: `${cairoGiza[0]?.shippingFee ?? 50} ${STORE_CONFIG.currencyLabel}`,
        daysText: `خلال ${cairoGiza[0]?.estimatedDays ?? '2-3'} أيام`,
      },
      alex
        ? {
            label: alex.nameAr,
            feeText: `${alex.shippingFee} ${STORE_CONFIG.currencyLabel}`,
            daysText: `خلال ${alex.estimatedDays} أيام`,
          }
        : null,
      rest.length
        ? {
            label: `باقي المحافظات (${rest.length} محافظة)`,
            feeText: `${Math.min(...restFees)}–${Math.max(...restFees)} ${STORE_CONFIG.currencyLabel}`,
            daysText: 'خلال 3-6 أيام',
          }
        : null,
    ].filter(Boolean);
  }, [activeGovernorates]);

  return (
    <div className="page-band-single">
      <div className="page-container">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
          {/* Start editorial spine (sticky on desktop): Page H1 + primary/secondary actions */}
          <div className="lg:sticky lg:top-[var(--header-offset)] lg:col-span-4 text-start">
            <PageHeading
              title="إزاي تطلب؟"
              description="من اختيار الموبايل لحد ما المندوب يوصلك، كل خطوة واضحة وبسيطة."
            />

            <div className="mt-6 flex flex-wrap items-center gap-6">
              <Link to="/customize" className="btn-primary">
                صمم جرابك
              </Link>
              <Link to="/categories" className="btn-secondary">
                شوف الجرابات
              </Link>
            </div>
          </div>

          {/* End open narrative column directly on the plaster wall (full 8 cols, no empty column gap) */}
          <div className="lg:col-span-8">
            <HowItWorks variant="editorial" />

            {/* Open typographic COD & Governorate shipping overview (no card box, driven by storeService) */}
            <section
              aria-labelledby="cod-shipping-heading"
              className="mt-10 pt-6 text-start md:mt-12 md:pt-6"
            >
              <h2 id="cod-shipping-heading" className="type-h2 text-[var(--charcoal)]">
                {STORE_CONFIG.paymentLabelAr} والشحن لكل المحافظات
              </h2>
              <p className="type-body mt-2.5 max-w-[60ch] text-[var(--graphite)]">
                ما بتحتاجش كارت بنكي أو دفع مسبق. بتدفع كاش للمندوب وقت ما تستلم جرابك وتتأكد منه،
                والشحن متاح لكل محافظات مصر ({activeGovernorates.length} محافظة).
              </p>

              <dl className="mt-[var(--heading-to-content)] grid grid-cols-1 gap-[var(--grid-col-gap)] sm:grid-cols-3">
                {shippingTiers.map((tier) => (
                  <div key={tier.label} className="text-start">
                    <dt className="type-caption text-[14px]">{tier.label}</dt>
                    <dd className="mt-1 text-[20px] font-bold tabular-nums text-[var(--charcoal)]">
                      {tier.feeText}
                    </dd>
                    <dd className="type-caption mt-0.5 text-[13px]">{tier.daysText}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

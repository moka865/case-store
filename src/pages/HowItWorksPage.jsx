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

  const shippingTiers = useMemo(() => {
    if (!governorates.length) return [];
    const cairoGiza = governorates.filter((g) => g.id === 'cairo' || g.id === 'giza');
    const alex = governorates.find((g) => g.id === 'alexandria');
    const rest = governorates.filter(
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
  }, [governorates]);

  return (
    <div className="pt-8 pb-16 md:pt-14 md:pb-28">
      <div className="page-container">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-8">
          {/* Start editorial spine (sticky on desktop): Page H1 + primary/secondary actions */}
          <div className="lg:sticky lg:top-[112px] lg:col-span-4 text-start">
            <PageHeading
              title="إزاي تطلب؟"
              description="من اختيار الموبايل لحد ما المندوب يوصلك، كل خطوة واضحة وبسيطة."
            />

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link to="/customize" className="btn-primary">
                صمم جرابك
              </Link>
              <Link to="/categories" className="btn-secondary">
                شوف الجرابات
              </Link>
            </div>
          </div>

          {/* End open narrative column directly on the plaster wall */}
          <div className="lg:col-span-7 lg:col-start-6">
            <HowItWorks variant="editorial" />

            {/* Open typographic COD & Governorate shipping overview (no card box, driven by storeService) */}
            <section
              aria-labelledby="cod-shipping-heading"
              className="mt-16 pt-10 text-start md:mt-24 md:pt-12"
            >
              <h2 id="cod-shipping-heading" className="type-h2 text-[var(--charcoal)]">
                {STORE_CONFIG.paymentLabelAr} والشحن لكل المحافظات
              </h2>
              <p className="type-body mt-3 max-w-[50ch] text-[var(--graphite)]">
                ما بتحتاجش كارت بنكي أو دفع مسبق. بتدفع كاش للمندوب وقت ما تستلم جرابك وتتأكد منه،
                والشحن متاح لكل محافظات مصر ({governorates.length} محافظة).
              </p>

              <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
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

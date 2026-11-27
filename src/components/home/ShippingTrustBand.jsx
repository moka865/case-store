import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { CashCodIcon } from '../icons/Icons';

/**
 * Honest, data-driven COD & Governorate Shipping ledger on the Home Page.
 * Makes payment terms, shipping fees, and delivery timing transparent before checkout.
 */
export function ShippingTrustBand() {
  const { governorates } = useStore();

  const tiers = useMemo(() => {
    const active = governorates.filter((g) => g.codAvailable !== false);
    const cairoGiza = active.filter((g) => g.id === 'cairo' || g.id === 'giza');
    const deltaCanal = active.filter((g) =>
      ['alexandria', 'qalyubia', 'dakahlia', 'sharqia', 'gharbia', 'monufia', 'port-said', 'ismailia', 'suez'].includes(g.id)
    );
    const upperRedSea = active.filter((g) =>
      ['beheira', 'fayoum', 'assiut', 'aswan', 'red-sea'].includes(g.id)
    );

    const minMax = (arr, fallback) => {
      if (!arr.length) return fallback;
      const fees = arr.map((x) => x.shippingFee);
      const lo = Math.min(...fees);
      const hi = Math.max(...fees);
      return lo === hi ? `${lo}` : `${lo}–${hi}`;
    };

    return [
      {
        region: 'القاهرة والجيزة',
        fee: `${minMax(cairoGiza, '50')} ${STORE_CONFIG.currencyLabel}`,
        windowAr: 'شحن خلال 2-3 أيام عمل',
      },
      {
        region: 'الإسكندرية والدلتا والقناة',
        fee: `${minMax(deltaCanal, '60–75')} ${STORE_CONFIG.currencyLabel}`,
        windowAr: 'شحن خلال 2-5 أيام عمل',
      },
      {
        region: 'الصعيد والبحيرة والبحر الأحمر',
        fee: `${minMax(upperRedSea, '80–95')} ${STORE_CONFIG.currencyLabel}`,
        windowAr: 'شحن خلال 3-6 أيام عمل',
      },
    ];
  }, [governorates]);

  return (
    <section aria-labelledby="shipping-trust-heading" className="section-band">
      <div className="page-container">
        <div className="rounded-[16px] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 sm:p-7">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
            <div className="text-start lg:col-span-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--jade-tint)] px-3 py-1 text-[12.5px] font-bold text-[var(--jade)]">
                <CashCodIcon className="h-4 w-4" />
                <span>{STORE_CONFIG.paymentLabelAr} فقط</span>
              </div>
              <h2 id="shipping-trust-heading" className="type-h2 mt-3 text-[var(--ink)]">
                شحن سريع ومصاريف واضحة لكل المحافظات
              </h2>
              <p className="type-caption mt-2 max-w-[42ch] text-[14px]">
                بتدفع كاش للمندوب وقت الاستلام من غير فيزا. بنطبع جرابك مخصوص في {STORE_CONFIG.productionDays} يوم عمل وبعدها يتشحن لمحافظتك.
              </p>
              <div className="mt-3">
                <Link to="/how-it-works" className="btn-secondary !min-h-[38px] !text-[14px]">
                  تفاصيل الطلب والشحن
                </Link>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 lg:col-span-8">
              {tiers.map((tier) => (
                <div
                  key={tier.region}
                  className="flex flex-col justify-between rounded-[12px] border border-[var(--border-subtle)] bg-[var(--paper)] p-4 text-start"
                >
                  <dt className="text-[14px] font-bold text-[var(--ink)]">{tier.region}</dt>
                  <dd className="mt-3 text-[22px] font-extrabold tabular-nums text-[var(--brand)]">
                    {tier.fee}
                  </dd>
                  <dd className="type-caption mt-1 text-[12.5px]">{tier.windowAr}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

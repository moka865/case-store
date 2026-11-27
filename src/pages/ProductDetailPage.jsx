import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeading } from '../components/common/PageHeading';
import { BackArrowRtlIcon, CashCodIcon, CheckIcon, PhoneHardwareIcon } from '../components/icons/Icons';
import { PhoneCaseMockup } from '../components/mockup/PhoneCaseMockup';
import { getProductStageTheme } from '../components/mockup/productPresentation';
import { ProductCard } from '../components/product/ProductCard';
import { STORE_CONFIG } from '../config/store';
import { useStore } from '../context/StoreContext';
import { storeService } from '../services/storeService';

/**
 * Product Detail Page (`/products/:slug`) — functional route so every product link
 * (`<a href="/products/:slug">`) resolves cleanly in Stage 1 and expands fully in Stage 2.
 */
export function ProductDetailPage() {
  const { slug } = useParams();
  const {
    categories,
    selectedModel,
    visualPreviewModel,
    phoneSelection,
    setIsModelSelectorOpen,
    addCatalogProductToCart,
  } = useStore();

  const [justAdded, setJustAdded] = useState(false);

  const product = useMemo(() => storeService.getProductBySlug(slug), [slug]);
  const category = useMemo(
    () => categories.find((c) => c.id === product?.categoryId) || null,
    [categories, product]
  );

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return storeService
      .getProducts({
        modelId: phoneSelection.modelId,
        modelStatus: phoneSelection.status,
      })
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [product, phoneSelection.modelId, phoneSelection.status]);

  if (!product) {
    return (
      <section className="page-band-single">
        <div className="page-container">
          <PageHeading
            title="التصميم ده مش موجود"
            description="ممكن الرابط يكون اتكتب غلط. شوف باقي طبعات غلاف المتاحة دلوقتي."
          />
          <div className="mt-6 flex flex-wrap gap-4">
            <Link to="/categories" className="btn-primary">
              كل التصميمات
            </Link>
            <Link to="/" className="btn-outline">
              الرئيسية
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const stage = getProductStageTheme(product.artworkId);
  const material = storeService.getMaterialById(product.materialId);
  const isCompatible =
    !selectedModel || product.compatibleModelIds.includes(selectedModel.id);

  const handleAdd = () => {
    if (!isCompatible) return;
    addCatalogProductToCart(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div className="page-band-single">
      <div className="page-container">
        <nav aria-label="مسار الصفحة" className="mb-5 flex items-center gap-2 text-[13.5px] text-[var(--ink-muted)]">
          <Link to="/categories" className="inline-flex items-center gap-1.5 font-semibold text-[var(--ink)] hover:text-[var(--brand)]">
            <BackArrowRtlIcon className="h-3.5 w-3.5" />
            <span>الأقسام</span>
          </Link>
          {category ? (
            <>
              <span aria-hidden="true">/</span>
              <Link to={`/categories/${category.slug}`} className="hover:text-[var(--ink)]">
                {category.nameAr}
              </Link>
            </>
          ) : null}
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
          {/* Case stage */}
          <div
            style={{ backgroundColor: stage.bg }}
            className="flex flex-col items-center justify-center rounded-[18px] border-[1.5px] border-[var(--ink)] p-8 sm:p-10 lg:col-span-6"
          >
            <div className="w-[190px] sm:w-[230px] lg:w-[250px]">
              <PhoneCaseMockup
                model={visualPreviewModel}
                artworkId={product.artworkId}
                interactive={false}
                className="w-full"
                ariaLabel={`جراب ${product.name} لموبايل ${visualPreviewModel.name}`}
              />
            </div>
          </div>

          {/* Details & conversion */}
          <div className="text-start lg:col-span-6 space-y-5">
            {category ? (
              <span className="inline-flex rounded-[6px] bg-[var(--surface-warm)] px-2.5 py-1 text-[12.5px] font-bold text-[var(--ink)]">
                {category.nameAr}
              </span>
            ) : null}

            <h1 tabIndex={-1} className="type-h1 text-[var(--ink)] outline-none">
              <bdi dir="ltr" className="latin-title">{product.name}</bdi>
            </h1>

            <p className="text-[26px] font-extrabold tabular-nums text-[var(--ink)]">
              {product.price} {STORE_CONFIG.currencyLabel}
            </p>

            {/* Phone model selector card */}
            <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <PhoneHardwareIcon className="h-4 w-4 text-[var(--cobalt)]" />
                  <span className="text-[14.5px] font-bold text-[var(--ink)]">
                    الموبايل:{' '}
                    <bdi dir="ltr" className="latin-title text-[var(--cobalt)]">
                      {selectedModel ? selectedModel.name : `${visualPreviewModel.name} (معاينة)`}
                    </bdi>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModelSelectorOpen(true)}
                  className="btn-secondary !min-h-[36px] !text-[13.5px]"
                >
                  {selectedModel ? 'غيّر الموبايل' : 'اختار موبايلك'}
                </button>
              </div>
              {!isCompatible ? (
                <p className="mt-2 text-[13.5px] font-semibold text-[var(--brand)]">
                  التصميم ده مش متاح للموديل ده حالياً — اختار موبايل تاني أو ارفع صورتك المخصوصة.
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                disabled={!isCompatible}
                onClick={handleAdd}
                className="btn-primary flex-1 min-w-[200px]"
              >
                {justAdded ? (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>اتضاف للسلة</span>
                  </>
                ) : (
                  <span>ضيف للسلة — {product.price} {STORE_CONFIG.currencyLabel}</span>
                )}
              </button>
              <Link to="/customize" className="btn-outline">
                صمّم بصورتك أو اسمك
              </Link>
            </div>

            <ul className="space-y-2 border-t border-[var(--border-subtle)] pt-4 text-[14px] text-[var(--ink-muted)]">
              <li className="flex items-center gap-2">
                <CashCodIcon className="h-4 w-4 text-[var(--jade)]" />
                <span>{STORE_CONFIG.paymentLabelAr} — شحن القاهرة والجيزة 50 ج.م، وباقي المحافظات 60–95 ج.م</span>
              </li>
              <li>• الخامة: {material?.nameAr} ({material?.descriptionAr})</li>
              <li>• تجهيز وطباعة خلال {STORE_CONFIG.productionDays} يوم عمل</li>
            </ul>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
            <h2 className="type-h2 mb-5 text-[var(--ink)]">طبعات تانية هتعجبك</h2>
            <div className="grid grid-cols-2 gap-x-[var(--grid-col-gap)] gap-y-[var(--grid-row-gap)] lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  displayModel={visualPreviewModel}
                  selectedModel={selectedModel}
                  onAdd={addCatalogProductToCart}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

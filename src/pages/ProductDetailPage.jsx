import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PageHeading } from '../components/common/PageHeading';
import {
  NamePrintControl,
  createInitialNamePrintState,
  resolveNamePrintState,
  validateNamePrintState,
} from '../components/customizer/NamePrintControl';
import {
  PhoneModelFields,
  createItemPhoneState,
} from '../components/header/PhoneModelFields';
import { BackArrowRtlIcon, CashCodIcon, CheckIcon } from '../components/icons/Icons';
import { PhoneCaseMockup } from '../components/mockup/PhoneCaseMockup';
import { ProductCard } from '../components/product/ProductCard';
import { STORE_CONFIG } from '../config/store';
import { useStore } from '../context/StoreContext';
import { storeService } from '../services/storeService';

const LIGHT_INK_ARTWORKS = new Set([
  'zamalek-dusk',
  'extra-time-90',
  'midnight-ronin',
  'golden-boot-club',
  'nile-frequency',
  'mecha-pulse-09',
]);

function getRecommendedInkForArtwork(artworkId) {
  return LIGHT_INK_ARTWORKS.has(artworkId) ? 'light' : 'dark';
}

/**
 * Catalog Product Detail Page (`/products/:slug`):
 * 1. Per-item Phone Model step ("الماركة" -> "الموديل" + "موبايلي مش في القايمة"), prefilled
 *    from site-wide selection if chosen, affecting ONLY this item.
 * 2. Optional Name Printing step ("اسمك على الجراب (اختياري · +50 جنيه)") reusing NamePrintControl
 *    with live case preview and live +50 EGP pricing.
 */
export function ProductDetailPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const {
    categories,
    allPhoneModels,
    phoneSelection,
    selectedModel,
    visualPreviewModel,
    addCatalogProductToCart,
    setIsCartOpen,
  } = useStore();

  const product = useMemo(() => storeService.getProductBySlug(slug), [slug]);
  const category = useMemo(
    () => categories.find((c) => c.id === product?.categoryId) || null,
    [categories, product]
  );

  const [itemPhone, setItemPhone] = useState(() =>
    createItemPhoneState(phoneSelection, allPhoneModels)
  );
  const [hasCustomItemPhone, setHasCustomItemPhone] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const [nameState, setNameState] = useState(() => ({
    ...createInitialNamePrintState(null, getRecommendedInkForArtwork(product?.artworkId)),
    enabled: searchParams.get('name') === '1',
  }));
  const [nameError, setNameError] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  const phoneStepRef = useRef(null);
  const brandSelectRef = useRef(null);
  const modelSelectRef = useRef(null);
  const nameInputRef = useRef(null);

  // Reset per-product name state & sync default phone when navigating between products
  useEffect(() => {
    setNameState({
      ...createInitialNamePrintState(null, getRecommendedInkForArtwork(product?.artworkId)),
      enabled: searchParams.get('name') === '1',
    });
    setNameError('');
    setPhoneError('');
    setHasCustomItemPhone(false);
    setItemPhone(createItemPhoneState(phoneSelection, allPhoneModels));
  }, [slug, product?.artworkId]);

  // If the customer hasn't overridden the phone on this page yet and changes the header phone, sync prefill
  useEffect(() => {
    if (!hasCustomItemPhone) {
      setItemPhone(createItemPhoneState(phoneSelection, allPhoneModels));
      setPhoneError('');
    }
  }, [phoneSelection, allPhoneModels, hasCustomItemPhone]);

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
            description="ممكن الرابط يكون اتكتب غلط. شوف باقي تصميمات غلاف المتاحة دلوقتي."
          />
          <div className="mt-6 flex flex-wrap gap-4">
            <Link to="/categories" className="btn-primary">
              كل الجرابات
            </Link>
            <Link to="/" className="btn-outline">
              الرئيسية
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const material = storeService.getMaterialById(product.materialId);

  // Live hardware preview reflects the item-specific phone model if chosen
  const itemSelectedModelObj =
    itemPhone.status === 'selected' && itemPhone.modelId
      ? storeService.getPhoneModelById(itemPhone.modelId)
      : null;
  const previewModel = itemSelectedModelObj || visualPreviewModel;

  const isIncompatible =
    Boolean(itemSelectedModelObj) &&
    !product.compatibleModelIds.includes(itemSelectedModelObj.id);

  const { livePreview: livePrintedName, spec: normalizedNameSpec } =
    resolveNamePrintState(nameState);

  const activeNameFee = nameState.enabled ? STORE_CONFIG.namePrintFee : 0;
  const displayedTotal = product.price + activeNameFee;

  const handleAdd = () => {
    // 1. Validate per-item phone model selection
    if (
      itemPhone.status === 'none' ||
      (itemPhone.status === 'selected' && !itemPhone.modelId)
    ) {
      setPhoneError('اختار الماركة والموديل الأول عشان نطبع الجراب على مقاس موبايلك.');
      phoneStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => {
        if (!itemPhone.brand) {
          brandSelectRef.current?.focus();
        } else {
          modelSelectRef.current?.focus();
        }
      }, 180);
      return;
    }

    if (isIncompatible) {
      return;
    }

    // 2. Validate optional name printing when toggle is ON
    const nameValidation = validateNamePrintState(nameState);
    if (!nameValidation.ok) {
      setNameError(nameValidation.error);
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      requestAnimationFrame(() => nameInputRef.current?.focus());
      return;
    }

    setPhoneError('');
    setNameError('');

    addCatalogProductToCart(product, {
      itemPhone,
      printedName: normalizedNameSpec,
    });

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div className="page-band-single pb-24 sm:pb-[var(--section-pad-y)]">
      <div className="page-container">
        <nav
          aria-label="مسار الصفحة"
          className="mb-5 flex items-center gap-2 text-[13.5px] text-[var(--ink-muted)]"
        >
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 font-semibold text-[var(--ink)] hover:text-[var(--brand)]"
          >
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
          {/* START PANE (Cols 1-5): Sticky Live Case Preview on unified `.product-stage` */}
          <div className="lg:sticky lg:top-[var(--header-offset)] lg:col-span-5">
            <div className="product-stage flex flex-col items-center justify-center p-7 sm:p-10">
              <div className="w-[180px] sm:w-[224px] lg:w-[244px]">
                <PhoneCaseMockup
                  model={previewModel}
                  artworkId={product.artworkId}
                  printedName={livePrintedName}
                  interactive={false}
                  className="w-full"
                  ariaLabel={`معاينة جراب ${product.name} لموبايل ${previewModel.name}`}
                />
              </div>

              <p className="type-caption mt-4 text-[13px]">
                معاينة حية على قالب{' '}
                <bdi dir="ltr" className="latin-title font-bold text-[var(--ink)]">
                  {itemPhone.status === 'pending' && itemPhone.pendingPhoneName
                    ? itemPhone.pendingPhoneName
                    : previewModel.name}
                </bdi>
              </p>
            </div>
          </div>

          {/* END PANE (Cols 6-12): Title, Price, Step 1 (Phone), Step 2 (Name), Add to Cart */}
          <div className="space-y-5 text-start lg:col-span-7">
            <div>
              {category ? (
                <span className="inline-flex rounded-[6px] bg-[var(--card-bg)] px-2.5 py-1 text-[12.5px] font-bold text-[var(--ink)]">
                  {category.nameAr}
                </span>
              ) : null}

              <h1 tabIndex={-1} className="type-h1 mt-2 text-[var(--ink)] outline-none">
                <bdi dir="ltr" className="latin-title">{product.name}</bdi>
              </h1>

              {/* Live Price Display with Western Digits & Explicit +50 EGP Breakdown */}
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[28px] font-extrabold tabular-nums text-[var(--ink)]">
                  {displayedTotal} {STORE_CONFIG.currencyLabel}
                </span>
                {nameState.enabled ? (
                  <span className="rounded-[6px] bg-[var(--brand-yellow-tint)] px-2.5 py-0.5 text-[13px] font-bold tabular-nums text-[var(--ink)]">
                    {product.price} {STORE_CONFIG.currencyLabel} الجراب + {STORE_CONFIG.namePrintFee}{' '}
                    {STORE_CONFIG.currencyLabel} طباعة الاسم
                  </span>
                ) : (
                  <span className="type-caption text-[13.5px]">
                    شامل الطباعة المطفية عالية الدقة
                  </span>
                )}
              </div>
            </div>

            {/* STEP 1: Per-Item Phone Brand & Model */}
            <PhoneModelFields
              containerRef={phoneStepRef}
              brandSelectRef={brandSelectRef}
              modelSelectRef={modelSelectRef}
              value={itemPhone}
              onChange={(next) => {
                setHasCustomItemPhone(true);
                setItemPhone(next);
                setPhoneError('');
              }}
              compatibleModelIds={product.compatibleModelIds}
              error={phoneError}
            />

            {/* STEP 2: Optional Name Printing (+50 EGP) */}
            <NamePrintControl
              state={nameState}
              onChange={(next) => {
                setNameState(next);
                setNameError('');
              }}
              error={nameError}
              inputRef={nameInputRef}
            />

            {/* Primary CTA Row */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                disabled={isIncompatible}
                onClick={handleAdd}
                className="btn-primary flex-1 min-w-[220px] tabular-nums"
              >
                {justAdded ? (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>اتضاف للسلة</span>
                  </>
                ) : (
                  <span>
                    ضيف للسلة — {displayedTotal} {STORE_CONFIG.currencyLabel}
                  </span>
                )}
              </button>

              {justAdded ? (
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="btn-outline"
                >
                  افتح السلة
                </button>
              ) : (
                <Link to="/customize" className="btn-outline">
                  ارفع صورتك الخاصة
                </Link>
              )}
            </div>

            <ul className="space-y-2 border-t border-[var(--border-subtle)] pt-4 text-[14px] text-[var(--ink-muted)]">
              <li className="flex items-center gap-2">
                <CashCodIcon className="h-4 w-4 text-[var(--jade)]" />
                <span>
                  {STORE_CONFIG.paymentLabelAr} — شحن القاهرة والجيزة 50 {STORE_CONFIG.currencyLabel}، وباقي المحافظات 60–95 {STORE_CONFIG.currencyLabel}
                </span>
              </li>
              <li>• الخامة: {material?.nameAr} ({material?.descriptionAr})</li>
              <li>• تجهيز وطباعة خلال {STORE_CONFIG.productionDays} أيام عمل</li>
            </ul>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="mt-12 border-t border-[var(--border-subtle)] pt-8">
            <h2 className="type-h2 mb-5 text-[var(--ink)]">تصميمات تانية هتعجبك</h2>
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

      {/* Mobile Sticky Add-to-Cart Bar — docked cleanly above MobileBottomNav and hidden during keyboard entry */}
      <div
        style={{ bottom: 'var(--mobile-bottom-nav-h)' }}
        className="surface-light-panel fixed inset-x-0 z-20 border-t border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 sm:hidden [@media(max-height:500px)]:hidden [[data-keyboard-open=true]_&]:hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[17px] font-extrabold tabular-nums text-[var(--ink)]">
              {displayedTotal} {STORE_CONFIG.currencyLabel}
            </p>
            {nameState.enabled ? (
              <p className="truncate text-[11.5px] text-[var(--ink-muted)] tabular-nums">
                {product.price} + {STORE_CONFIG.namePrintFee} طباعة الاسم
              </p>
            ) : null}
          </div>

          <button
            type="button"
            disabled={isIncompatible}
            onClick={handleAdd}
            className="btn-primary !min-h-[44px] flex-1 max-w-[220px] tabular-nums"
          >
            {justAdded ? 'اتضاف ✓' : 'ضيف للسلة'}
          </button>
        </div>
      </div>
    </div>
  );
}

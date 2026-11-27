import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { storeService } from '../../services/storeService';
import {
  PhoneModelFields,
  createItemPhoneState,
} from '../header/PhoneModelFields';
import { CheckIcon, UploadIcon } from '../icons/Icons';
import { SAMPLE_CUSTOM_IMAGES } from '../mockup/CaseArtworks';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';
import {
  NamePrintControl,
  createInitialNamePrintState,
  resolveNamePrintState,
  validateNamePrintState,
} from './NamePrintControl';

const EASE = [0.22, 1, 0.36, 1];

const INITIAL_TRANSFORM = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
};

/**
 * Reusable Case Customizer ("صمم جرابك" flow):
 * Shares both `<PhoneModelFields />` (per-item phone model) and `<NamePrintControl />`
 * ("اسمك على الجراب (اختياري · +50 جنيه)") with `ProductDetailPage`, applying the single
 * `STORE_CONFIG.namePrintFee` (+50 EGP) whenever a printed name is enabled.
 */
export function CaseCustomizer({
  modelOverride = null,
  onPrintSpecSubmit = null,
  hideHeader = false,
}) {
  const {
    phoneSelection,
    allPhoneModels,
    visualPreviewModel,
    resolvePhoneSpecFields,
    addCustomSpecToCart,
  } = useStore();

  const prefersReducedMotion = useReducedMotion();

  const [itemPhone, setItemPhone] = useState(() =>
    modelOverride
      ? {
          status: 'selected',
          brand: modelOverride.brand,
          modelId: modelOverride.id,
          pendingPhoneName: null,
          pendingRequestId: null,
        }
      : createItemPhoneState(phoneSelection, allPhoneModels)
  );
  const [hasCustomItemPhone, setHasCustomItemPhone] = useState(Boolean(modelOverride));
  const [phoneError, setPhoneError] = useState('');

  const [imageUrl, setImageUrl] = useState(null);
  const [imageFileName, setImageFileName] = useState(null);
  const [transform, setTransform] = useState(INITIAL_TRANSFORM);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [nameState, setNameState] = useState(() => createInitialNamePrintState(null, 'dark'));
  const [nameError, setNameError] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  const fileInputRef = useRef(null);
  const dragOriginRef = useRef(null);
  const phoneStepRef = useRef(null);
  const brandSelectRef = useRef(null);
  const modelSelectRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (!hasCustomItemPhone && !modelOverride) {
      setItemPhone(createItemPhoneState(phoneSelection, allPhoneModels));
      setPhoneError('');
    }
  }, [phoneSelection, allPhoneModels, hasCustomItemPhone, modelOverride]);

  const itemSelectedModelObj =
    itemPhone.status === 'selected' && itemPhone.modelId
      ? storeService.getPhoneModelById(itemPhone.modelId)
      : null;

  const previewModel = modelOverride || itemSelectedModelObj || visualPreviewModel;

  const { livePreview: livePrintedName, spec: normalizedNameSpec } =
    resolveNamePrintState(nameState);

  const activeNameFee = nameState.enabled ? STORE_CONFIG.namePrintFee : 0;
  const displayedTotal = STORE_CONFIG.customCasePrice + activeNameFee;

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setValidationMessage('اختار ملف صورة (PNG أو JPG أو WebP) عشان نقدر نطبعه.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setImageFileName(file.name);
        setTransform(INITIAL_TRANSFORM);
        setNameState((prev) => ({ ...prev, ink: 'light' }));
        setValidationMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const handlePreviewPointerDown = (e) => {
    if (!imageUrl) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragOriginRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: transform.x,
      startY: transform.y,
    };
  };

  const handlePreviewPointerMove = (e) => {
    if (!dragOriginRef.current || !imageUrl) return;
    const dx = (e.clientX - dragOriginRef.current.clientX) * 0.45;
    const dy = (e.clientY - dragOriginRef.current.clientY) * 0.45;
    setTransform((prev) => ({
      ...prev,
      x: Math.max(-60, Math.min(60, Math.round(dragOriginRef.current.startX + dx))),
      y: Math.max(-60, Math.min(60, Math.round(dragOriginRef.current.startY + dy))),
    }));
  };

  const handlePreviewPointerUp = () => {
    dragOriginRef.current = null;
  };

  const handleAddToCart = () => {
    // 1. Validate phone model per item
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

    // 2. Validate optional name printing if toggle is ON
    const nameValidation = validateNamePrintState(nameState);
    if (!nameValidation.ok) {
      setNameError(nameValidation.error);
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      requestAnimationFrame(() => nameInputRef.current?.focus());
      return;
    }

    const hasImage = Boolean(imageUrl);
    const hasName = normalizedNameSpec.enabled;

    if (!hasImage && !hasName) {
      setValidationMessage('ارفع صورة أو فعل اختيار الاسم واكتبه الأول عشان نجهز الجراب.');
      return;
    }

    setPhoneError('');
    setNameError('');
    setValidationMessage('');

    const phoneFields = resolvePhoneSpecFields(itemPhone);

    const printSpec = {
      ...phoneFields,
      materialId: STORE_CONFIG.defaultMaterialId,
      designSource: {
        type: hasImage ? 'custom-upload' : 'custom-text-only',
        productId: null,
        artworkId: null,
        imageUrl: hasImage ? imageUrl : null,
        fileName: hasImage ? imageFileName : null,
      },
      imageTransform: {
        x: transform.x,
        y: transform.y,
        scale: transform.scale,
        rotation: transform.rotation,
      },
      printedName: normalizedNameSpec,
      createdAt: new Date().toISOString(),
    };

    const payload = {
      name: hasImage ? 'Custom Photo Print' : 'Custom Name Print',
      price: STORE_CONFIG.customCasePrice,
      printSpec,
    };

    if (onPrintSpecSubmit) {
      onPrintSpecSubmit(payload);
    } else {
      addCustomSpecToCart(payload);
    }

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <section
      aria-labelledby={hideHeader ? undefined : 'customizer-heading'}
      aria-label={hideHeader ? 'أدوات تصميم الجراب' : undefined}
      className={
        hideHeader
          ? 'pt-[var(--heading-to-content)] pb-[var(--section-pad-y)]'
          : 'section-band'
      }
    >
      <div className="page-container">
        {!hideHeader ? (
          <div className="mb-[var(--heading-to-content)] text-start">
            <h2 id="customizer-heading" className="type-h1 text-[var(--ink)]">
              صمم جرابك بنفسك
            </h2>
            <p className="type-body mt-2.5 max-w-[60ch] text-[var(--ink-muted)]">
              ارفع صورتك واكتب اسمك لو حابب. فريق التصميم عندنا بيظبط القص ومكان الكاميرا قبل الطباعة.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
          {/* START PANE: Live case preview on unified `.product-stage` */}
          <div className="sticky top-[var(--header-offset)] max-[1023px]:[@media(max-height:500px)]:static z-20 -mx-[var(--page-margin)] bg-[var(--paper)] px-[var(--page-margin)] py-2.5 lg:col-span-4 lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0">
            <div className="product-stage flex flex-col items-center p-4 sm:p-6">
              <div
                className={`w-[128px] transition-transform duration-150 sm:w-[168px] lg:w-full lg:max-w-[260px] ${
                  imageUrl ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
              >
                <PhoneCaseMockup
                  model={previewModel}
                  interactive={false}
                  customImage={
                    imageUrl
                      ? {
                          url: imageUrl,
                          x: transform.x,
                          y: transform.y,
                          scale: transform.scale,
                          rotation: transform.rotation,
                        }
                      : null
                  }
                  printedName={livePrintedName}
                  onPointerDown={handlePreviewPointerDown}
                  onPointerMove={handlePreviewPointerMove}
                  onPointerUp={handlePreviewPointerUp}
                  className="w-full touch-none"
                  ariaLabel={`معاينة جرابك المخصص لموبايل ${previewModel.name}`}
                />
              </div>

              <span className="type-caption mt-3 text-[13px]">
                المعاينة على{' '}
                <bdi dir="ltr" className="latin-title font-bold text-[var(--ink)]">
                  {itemPhone.status === 'pending' && itemPhone.pendingPhoneName
                    ? itemPhone.pendingPhoneName
                    : previewModel.name}
                </bdi>
              </span>

              {imageUrl ? (
                <p className="type-caption mt-1 hidden text-[12.5px] lg:block">
                  اسحب الصورة مباشرة على الجراب عشان تحرك مكانها.
                </p>
              ) : null}
            </div>
          </div>

          {/* END PANE: Controls */}
          <div className="space-y-5 text-start lg:col-span-8">
            {/* Step 1: Per-Item Phone Model */}
            {!modelOverride ? (
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
                error={phoneError}
              />
            ) : null}

            {/* Step 2: Image upload & transform controls */}
            <div className="rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-4 sm:p-5">
              <h3 className="type-h3 !text-[17px] text-[var(--ink)]">ارفع صورتك</h3>
              <p className="type-caption mt-0.5 text-[13px]">
                اختار صورة واضحة من موبايلك أو جهازك، واحنا بنطبعها على كامل الجراب.
              </p>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDrop}
                className={`mt-3.5 rounded-[var(--radius-ui)] border border-dashed p-4 transition-colors duration-150 ${
                  isDraggingFile
                    ? 'border-[var(--brand)] bg-[var(--brand-tint)]/40'
                    : 'border-[var(--border-strong)] bg-[var(--paper)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="sr-only"
                  id="custom-case-file-input"
                />

                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <UploadIcon className="h-5 w-5 shrink-0 text-[var(--ink)]" />
                    <div>
                      <p className="text-[14.5px] font-semibold text-[var(--ink)]">
                        {imageFileName ? imageFileName : 'اسحب الصورة هنا أو اختارها من جهازك'}
                      </p>
                      <p className="type-caption text-[12.5px]">PNG أو JPG أو WebP</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-outline !min-h-[40px] !px-4 !text-[14px] shrink-0"
                  >
                    {imageUrl ? 'غير الصورة' : 'اختار صورة'}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="type-caption text-[12.5px]">أو جرب بصورة جاهزة:</span>
                {SAMPLE_CUSTOM_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setImageUrl(sample.url);
                      setImageFileName(`${sample.labelAr}.svg`);
                      setTransform(INITIAL_TRANSFORM);
                      setNameState((prev) => ({ ...prev, ink: sample.recommendedInk || 'light' }));
                      setValidationMessage('');
                    }}
                    className="btn-secondary !min-h-[34px] !text-[13.5px] text-[var(--ink-muted)]"
                  >
                    {sample.labelAr}
                  </button>
                ))}
                {imageUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl(null);
                      setImageFileName(null);
                      setTransform(INITIAL_TRANSFORM);
                      setNameState((prev) => ({ ...prev, ink: 'dark' }));
                    }}
                    className="btn-secondary !min-h-[34px] !text-[13.5px] text-[var(--brand)]"
                  >
                    امسح الصورة
                  </button>
                ) : null}
              </div>

              {imageUrl ? (
                <div className="mt-5 space-y-4 border-t border-[var(--border-subtle)] pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[13.5px]">
                        <label htmlFor="custom-scale" className="font-semibold text-[var(--ink)]">
                          التكبير
                        </label>
                        <span className="type-caption tabular-nums">
                          {Math.round(transform.scale * 100)}%
                        </span>
                      </div>
                      <input
                        id="custom-scale"
                        type="range"
                        min="0.6"
                        max="2.4"
                        step="0.05"
                        value={transform.scale}
                        onChange={(e) =>
                          setTransform((prev) => ({ ...prev, scale: Number(e.target.value) }))
                        }
                        className="gallery-range"
                      />
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[13.5px]">
                        <label htmlFor="custom-rotation" className="font-semibold text-[var(--ink)]">
                          الدوران
                        </label>
                        <span className="type-caption tabular-nums" dir="ltr">
                          {transform.rotation}°
                        </span>
                      </div>
                      <input
                        id="custom-rotation"
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={transform.rotation}
                        onChange={(e) =>
                          setTransform((prev) => ({ ...prev, rotation: Number(e.target.value) }))
                        }
                        className="gallery-range"
                      />
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[13.5px]">
                        <label htmlFor="custom-pos-x" className="font-semibold text-[var(--ink)]">
                          تحريك أفقي
                        </label>
                        <span className="type-caption tabular-nums" dir="ltr">
                          {transform.x}%
                        </span>
                      </div>
                      <input
                        id="custom-pos-x"
                        type="range"
                        min="-60"
                        max="60"
                        step="1"
                        value={transform.x}
                        onChange={(e) =>
                          setTransform((prev) => ({ ...prev, x: Number(e.target.value) }))
                        }
                        className="gallery-range"
                      />
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[13.5px]">
                        <label htmlFor="custom-pos-y" className="font-semibold text-[var(--ink)]">
                          تحريك رأسي
                        </label>
                        <span className="type-caption tabular-nums" dir="ltr">
                          {transform.y}%
                        </span>
                      </div>
                      <input
                        id="custom-pos-y"
                        type="range"
                        min="-60"
                        max="60"
                        step="1"
                        value={transform.y}
                        onChange={(e) =>
                          setTransform((prev) => ({ ...prev, y: Number(e.target.value) }))
                        }
                        className="gallery-range"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTransform(INITIAL_TRANSFORM)}
                    className="btn-secondary !min-h-[34px] !text-[13.5px] text-[var(--ink-muted)]"
                  >
                    رجع الصورة لمكانها
                  </button>
                </div>
              ) : null}
            </div>

            {/* Step 3: Shared Optional Name Printing (+50 EGP) */}
            <NamePrintControl
              state={nameState}
              onChange={(next) => {
                setNameState(next);
                setNameError('');
                setValidationMessage('');
              }}
              error={nameError}
              inputRef={nameInputRef}
            />

            {validationMessage ? (
              <p role="alert" className="text-[14px] font-bold text-[var(--brand)]">
                {validationMessage}
              </p>
            ) : null}

            {/* Step 4: Live Price & Add to Cart */}
            <div className="flex flex-col items-stretch justify-between gap-4 rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:p-5">
              <div>
                <p className="text-[24px] font-extrabold tabular-nums text-[var(--ink)]">
                  {displayedTotal} {STORE_CONFIG.currencyLabel}
                </p>
                {nameState.enabled ? (
                  <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[var(--ink-muted)]">
                    {STORE_CONFIG.customCasePrice} {STORE_CONFIG.currencyLabel} جراب مخصص +{' '}
                    {STORE_CONFIG.namePrintFee} {STORE_CONFIG.currencyLabel} طباعة الاسم
                  </p>
                ) : (
                  <p className="type-caption text-[13px]">
                    شامل الطباعة المخصصة والدفع عند الاستلام
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary min-w-[200px] tabular-nums"
                aria-live="polite"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {justAdded ? (
                    <motion.span
                      key="added"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="inline-flex items-center gap-1.5"
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>اتضاف للسلة</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.18, ease: EASE }}
                    >
                      ضيف للسلة — {displayedTotal} {STORE_CONFIG.currencyLabel}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

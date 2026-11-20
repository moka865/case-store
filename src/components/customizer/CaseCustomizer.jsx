import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import {
  CUSTOMIZER_FONTS,
  NAME_PLACEMENTS,
  detectTextScript,
} from '../../data/customizerFonts';
import { CheckIcon, UploadIcon } from '../icons/Icons';
import { SAMPLE_CUSTOM_IMAGES } from '../mockup/CaseArtworks';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

const EASE = [0.22, 1, 0.36, 1];

const INITIAL_TRANSFORM = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
};

/**
 * Reusable Case Customizer component.
 * Can be placed on the Home page or any Product page.
 *
 * Props (all optional; integrates cleanly with StoreContext by default):
 * - modelOverride: PhoneModel object to preview
 * - onPrintSpecSubmit: (cartPayload) => void
 */
export function CaseCustomizer({
  modelOverride = null,
  onPrintSpecSubmit = null,
  hideHeader = false,
}) {
  const {
    phoneSelection,
    selectedModel,
    visualPreviewModel,
    setIsModelSelectorOpen,
    addCustomSpecToCart,
  } = useStore();

  const prefersReducedMotion = useReducedMotion();
  const previewModel = modelOverride || visualPreviewModel;

  const [imageUrl, setImageUrl] = useState(null);
  const [imageFileName, setImageFileName] = useState(null);
  const [transform, setTransform] = useState(INITIAL_TRANSFORM);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [nameEnabled, setNameEnabled] = useState(false);
  const [nameText, setNameText] = useState('');
  const [selectedFontByScript, setSelectedFontByScript] = useState({
    arabic: CUSTOMIZER_FONTS.arabic[0].id,
    latin: CUSTOMIZER_FONTS.latin[0].id,
  });
  const [placement, setPlacement] = useState('bottom');
  const [ink, setInk] = useState('dark');

  const [validationMessage, setValidationMessage] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  const fileInputRef = useRef(null);
  const dragOriginRef = useRef(null);

  // Detect Arabic vs Latin dynamically from typed name
  const detectedScript = useMemo(() => detectTextScript(nameText), [nameText]);
  const availableFonts = CUSTOMIZER_FONTS[detectedScript];
  const activeFontId = selectedFontByScript[detectedScript] || availableFonts[0].id;
  const activeFont = availableFonts.find((f) => f.id === activeFontId) || availableFonts[0];

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
        setInk('light');
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

  // Direct pointer drag on preview mockup to reposition uploaded image smoothly
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

  const handleSelectFont = (fontId) => {
    setSelectedFontByScript((prev) => ({
      ...prev,
      [detectedScript]: fontId,
    }));
  };

  const handleAddToCart = () => {
    const cleanName = nameText.trim();
    const hasImage = Boolean(imageUrl);
    const hasName = nameEnabled && cleanName.length > 0;

    if (!hasImage && !hasName) {
      setValidationMessage('ارفع صورة أو شغّل "اطبع اسمك" واكتب اسمك الأول عشان نجهز الجراب.');
      return;
    }

    setValidationMessage('');

    const modelStatus =
      phoneSelection.status === 'pending'
        ? 'pending'
        : selectedModel
          ? 'selected'
          : 'unassigned';

    const resolvedModelName =
      phoneSelection.status === 'pending'
        ? phoneSelection.pendingPhoneName || 'موديلك بيتأكد'
        : previewModel.name;

    /**
     * Structured Print Spec Object stored on the cart item.
     * Ready to be sent straight to a print-fulfillment API.
     */
    const printSpec = {
      phoneModelId: selectedModel ? selectedModel.id : null,
      phoneModelName: resolvedModelName,
      phoneModelStatus: modelStatus,
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
      printedName: {
        enabled: hasName,
        text: hasName ? cleanName : '',
        script: hasName ? detectedScript : null,
        fontId: hasName ? activeFont.id : null,
        fontFamily: hasName ? activeFont.fontFamily : null,
        fontWeight: hasName ? activeFont.fontWeight : null,
        letterSpacing: hasName ? activeFont.letterSpacing : '0px',
        placement,
        ink,
      },
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

  const livePrintedName = {
    enabled: nameEnabled && Boolean(nameText.trim()),
    text: nameText,
    script: detectedScript,
    fontFamily: activeFont.fontFamily,
    fontWeight: activeFont.fontWeight,
    letterSpacing: activeFont.letterSpacing,
    placement,
    ink,
  };

  return (
    <section
      aria-labelledby={hideHeader ? undefined : 'customizer-heading'}
      aria-label={hideHeader ? 'أدوات تصميم الجراب' : undefined}
      className={hideHeader ? 'pt-8 pb-16 md:pt-12 md:pb-28' : 'py-16 md:py-32'}
    >
      <div className="page-container">
        {!hideHeader ? (
          <div className="mb-10 max-w-[54ch] text-start md:mb-14">
            <h2 id="customizer-heading" className="type-h1 text-[var(--charcoal)]">
              صمّم جرابك بنفسك
            </h2>
            <p className="type-body mt-3 text-[var(--graphite)]">
              ارفع صورتك واكتب اسمك لو حابب. فريق التصميم عندنا بيظبط القص ومكان الكاميرا قبل الطباعة.
            </p>
          </div>
        ) : null}

        {/* Desktop: 2 panes (Start/right = preview, End/left = controls). Mobile: sticky preview on top, controls below. */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* START PANE: Live case preview (sticky top below 2-row mobile header & desktop header) */}
          <div className="sticky top-[104px] z-20 -mx-[var(--page-margin)] bg-[var(--plaster)] px-[var(--page-margin)] py-3 lg:top-[104px] lg:col-span-5 lg:mx-0 lg:px-0 lg:py-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-[136px] transition-transform duration-150 sm:w-[172px] lg:w-[276px] ${
                  imageUrl ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
              >
                <PhoneCaseMockup
                  model={previewModel}
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

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 lg:mt-5">
                <span className="type-caption">
                  المعاينة على{' '}
                  <bdi dir="ltr" className="font-semibold text-[var(--charcoal)]">
                    {phoneSelection.status === 'pending' && phoneSelection.pendingPhoneName
                      ? phoneSelection.pendingPhoneName
                      : previewModel.name}
                  </bdi>
                </span>
                <button
                  type="button"
                  onClick={() => setIsModelSelectorOpen(true)}
                  className="btn-secondary !min-h-[36px] !text-[14px] text-[var(--klein)]"
                >
                  غيّر الموبايل
                </button>
              </div>

              {imageUrl ? (
                <p className="type-caption mt-1 hidden text-[13px] lg:block">
                  اسحب الصورة مباشرة على الجراب عشان تحرك مكانها.
                </p>
              ) : null}
            </div>
          </div>

          {/* END PANE: Gallery-white controls surface */}
          <div className="rounded-[4px] bg-[var(--gallery-white)] p-5 text-start sm:p-8 lg:col-span-7">
            <div className="space-y-8">
              {/* 1. Image upload drop zone */}
              <div>
                <h3 className="type-h3 text-[var(--charcoal)]">ارفع صورتك</h3>
                <p className="type-caption mt-1">
                  اختار صورة واضحة من موبايلك أو جهازك، واحنا بنطبعها على كامل الجراب.
                </p>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={handleDrop}
                  className={`mt-4 rounded-[4px] border border-dashed p-5 transition-colors duration-150 ${
                    isDraggingFile
                      ? 'border-[var(--klein)] is-selected'
                      : 'border-[rgba(38,40,43,0.28)]'
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

                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <UploadIcon className="h-5 w-5 shrink-0 text-[var(--charcoal)]" />
                      <div>
                        <p className="text-[15px] font-medium text-[var(--charcoal)]">
                          {imageFileName ? imageFileName : 'اسحب الصورة هنا أو اختارها من جهازك'}
                        </p>
                        <p className="type-caption text-[13px]">PNG أو JPG أو WebP</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary shrink-0 !text-[15px]"
                    >
                      {imageUrl ? 'غيّر الصورة' : 'اختار صورة'}
                    </button>
                  </div>
                </div>

                {/* Quick built-in generated SVG samples to try transforms immediately */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="type-caption text-[13px]">أو جرّب بصورة جاهزة:</span>
                  {SAMPLE_CUSTOM_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => {
                        setImageUrl(sample.url);
                        setImageFileName(`${sample.labelAr}.svg`);
                        setTransform(INITIAL_TRANSFORM);
                        setInk(sample.recommendedInk || 'light');
                        setValidationMessage('');
                      }}
                      className="btn-secondary !min-h-[36px] !text-[14px] text-[var(--graphite)]"
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
                        setInk('dark');
                      }}
                      className="btn-secondary !min-h-[36px] !text-[14px] text-[var(--graphite)]"
                    >
                      امسح الصورة
                    </button>
                  ) : null}
                </div>

                {/* Image position, scale & rotation controls */}
                {imageUrl ? (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-[14px]">
                          <label htmlFor="custom-scale" className="font-medium text-[var(--charcoal)]">
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
                        <div className="mb-1.5 flex items-center justify-between text-[14px]">
                          <label htmlFor="custom-rotation" className="font-medium text-[var(--charcoal)]">
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
                        <div className="mb-1.5 flex items-center justify-between text-[14px]">
                          <label htmlFor="custom-pos-x" className="font-medium text-[var(--charcoal)]">
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
                        <div className="mb-1.5 flex items-center justify-between text-[14px]">
                          <label htmlFor="custom-pos-y" className="font-medium text-[var(--charcoal)]">
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
                      className="btn-secondary !min-h-[36px] !text-[14px] text-[var(--graphite)]"
                    >
                      رجّع الصورة لمكانها
                    </button>
                  </div>
                ) : null}
              </div>

              {/* 2. "Print your name" toggle + dynamic Arabic/Latin fonts + placement */}
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="type-h3 text-[var(--charcoal)]">اطبع اسمك</h3>
                    <p className="type-caption mt-0.5">
                      اكتب بالعربي أو الإنجليزي والخطوط هتتغير تلقائي حسب اللغة.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={nameEnabled}
                    aria-label="تفعيل طباعة الاسم على الجراب"
                    onClick={() => {
                      setNameEnabled((prev) => !prev);
                      setValidationMessage('');
                    }}
                    className={`relative inline-flex h-[32px] w-[56px] shrink-0 items-center rounded-[4px] p-1 transition-colors duration-150 cursor-pointer ${
                      nameEnabled
                        ? 'is-selected bg-[var(--plaster)]'
                        : 'border border-[rgba(38,40,43,0.22)] bg-[var(--plaster)]'
                    }`}
                  >
                    <span
                      className={`block h-[22px] w-[22px] rounded-[3px] transition-transform duration-150 ${
                        nameEnabled
                          ? 'bg-[var(--klein)] -translate-x-[24px]'
                          : 'bg-[var(--graphite)] translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {nameEnabled ? (
                  <div className="space-y-5 pt-1">
                    {/* Name input */}
                    <div>
                      <label
                        htmlFor="custom-name-input"
                        className="mb-1.5 flex items-center justify-between text-[14px] font-medium text-[var(--charcoal)]"
                      >
                        <span>اكتب اسمك</span>
                        <span className="type-caption text-[13px]">
                          {detectedScript === 'arabic' ? 'خطوط عربي' : 'خطوط إنجليزي'}
                        </span>
                      </label>
                      <input
                        id="custom-name-input"
                        type="text"
                        maxLength={24}
                        value={nameText}
                        onChange={(e) => {
                          setNameText(e.target.value);
                          setValidationMessage('');
                        }}
                        dir={detectedScript === 'arabic' ? 'rtl' : 'ltr'}
                        placeholder="مثلاً: يوسف أو Youssef"
                        className="min-h-[48px] w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] px-3.5 text-[16px] text-[var(--charcoal)] placeholder:text-[var(--graphite)]"
                      />
                    </div>

                    {/* 4 script-adaptive live font samples */}
                    <div>
                      <span className="mb-2 block text-[14px] font-medium text-[var(--charcoal)]">
                        اختار الخط
                      </span>
                      <div
                        role="radiogroup"
                        aria-label="اختيار نوع الخط"
                        className="grid grid-cols-2 gap-3"
                      >
                        {availableFonts.map((font) => {
                          const isSelected = activeFont.id === font.id;
                          const sampleText = nameText.trim() || font.sampleFallback;
                          return (
                            <button
                              key={font.id}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => handleSelectFont(font.id)}
                              className={`flex min-h-[76px] flex-col items-start justify-between rounded-[4px] bg-[var(--plaster)]/55 p-3.5 text-start transition-colors cursor-pointer ${
                                isSelected ? 'is-selected' : 'hover:bg-[var(--plaster)]'
                              }`}
                            >
                              <span
                                dir={detectedScript === 'arabic' ? 'rtl' : 'ltr'}
                                lang={detectedScript === 'arabic' ? 'ar' : 'en'}
                                className="w-full truncate text-[21px] leading-[1.4] text-[var(--charcoal)]"
                                style={{
                                  fontFamily: font.fontFamily,
                                  fontWeight: font.fontWeight,
                                  letterSpacing:
                                    detectedScript === 'arabic' ? '0px' : font.letterSpacing,
                                }}
                              >
                                {sampleText}
                              </span>
                              <span className="type-caption mt-1 text-[12px]">{font.labelAr}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Placement & text ink */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <span className="mb-2 block text-[14px] font-medium text-[var(--charcoal)]">
                          مكان الاسم
                        </span>
                        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="مكان الاسم">
                          {NAME_PLACEMENTS.map((pos) => {
                            const isSelected = placement === pos.id;
                            return (
                              <button
                                key={pos.id}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setPlacement(pos.id)}
                                className={`min-h-[44px] rounded-[4px] bg-[var(--plaster)]/55 px-2 text-[14px] font-medium text-[var(--charcoal)] cursor-pointer ${
                                  isSelected ? 'is-selected font-semibold' : 'hover:bg-[var(--plaster)]'
                                }`}
                              >
                                {pos.labelAr}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <span className="mb-2 block text-[14px] font-medium text-[var(--charcoal)]">
                          وضوح الكتابة
                        </span>
                        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="وضوح لون الاسم">
                          {[
                            { id: 'dark', labelAr: 'غامق' },
                            { id: 'light', labelAr: 'فاتح' },
                          ].map((opt) => {
                            const isSelected = ink === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setInk(opt.id)}
                                className={`min-h-[44px] rounded-[4px] bg-[var(--plaster)]/55 px-3 text-[14px] font-medium text-[var(--charcoal)] cursor-pointer ${
                                  isSelected ? 'is-selected font-semibold' : 'hover:bg-[var(--plaster)]'
                                }`}
                              >
                                {opt.labelAr}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Validation feedback */}
              {validationMessage ? (
                <p role="alert" className="text-[14px] font-medium text-[var(--klein)]">
                  {validationMessage}
                </p>
              ) : null}

              {/* 3. Price & Add to Cart */}
              <div className="flex flex-col items-stretch justify-between gap-4 pt-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[22px] font-bold tabular-nums text-[var(--charcoal)]">
                    {STORE_CONFIG.customCasePrice} {STORE_CONFIG.currencyLabel}
                  </p>
                  <p className="type-caption text-[13px]">شامل الطباعة المخصصة والدفع عند الاستلام</p>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn-primary min-w-[184px]"
                  aria-live="polite"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {justAdded ? (
                      <motion.span
                        key="added"
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="inline-flex items-center gap-1.5"
                      >
                        <CheckIcon className="h-4 w-4" />
                        <span>اتضاف</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={prefersReducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.2, ease: EASE }}
                      >
                        ضيف للسلة
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

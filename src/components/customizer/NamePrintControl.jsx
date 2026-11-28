import { useId } from 'react';
import { STORE_CONFIG } from '../../config/store';
import {
  CUSTOMIZER_FONTS,
  NAME_PLACEMENTS,
  detectTextScript,
} from '../../data/customizerFonts';
import { MAX_PRINTED_NAME_LENGTH } from '../../utils/pricing';
import { CheckIcon, CloseIcon, CustomPenIcon } from '../icons/Icons';

/** Exact label kept exported for shared references across product and custom flows. */
export const NAME_PRINT_OPTION_LABEL = `اسمك على الجراب (اختياري · +${STORE_CONFIG.namePrintFee} جنيه)`;

export function createInitialNamePrintState(existingPrintedName = null, defaultInk = 'light') {
  const isEnabled = Boolean(existingPrintedName?.enabled && existingPrintedName?.text?.trim());
  const text = existingPrintedName?.text || '';
  const script = detectTextScript(text);
  const initialArabicFont =
    (existingPrintedName?.script === 'arabic' && existingPrintedName?.fontId) ||
    CUSTOMIZER_FONTS.arabic[0].id;
  const initialLatinFont =
    (existingPrintedName?.script === 'latin' && existingPrintedName?.fontId) ||
    CUSTOMIZER_FONTS.latin[0].id;

  return {
    enabled: isEnabled,
    text,
    selectedFontByScript: {
      arabic: initialArabicFont,
      latin: initialLatinFont,
    },
    placement: existingPrintedName?.placement || 'bottom',
    ink: existingPrintedName?.ink || defaultInk,
    detectedScript: script,
  };
}

/**
 * Resolves live preview & normalized printSpec.printedName fields from state.
 */
export function resolveNamePrintState(state) {
  const rawText = String(state?.text || '');
  const trimmed = rawText.trim();
  const detectedScript = detectTextScript(rawText);
  const availableFonts = CUSTOMIZER_FONTS[detectedScript];
  const activeFontId = state?.selectedFontByScript?.[detectedScript] || availableFonts[0].id;
  const activeFont = availableFonts.find((f) => f.id === activeFontId) || availableFonts[0];
  const placement = state?.placement || 'bottom';
  const ink = state?.ink || 'light';
  const isActive = Boolean(state?.enabled && trimmed.length > 0);

  return {
    detectedScript,
    availableFonts,
    activeFont,
    isActive,
    livePreview: {
      enabled: isActive,
      text: rawText,
      script: detectedScript,
      fontId: activeFont.id,
      fontFamily: activeFont.fontFamily,
      fontWeight: activeFont.fontWeight,
      letterSpacing: detectedScript === 'arabic' ? '0px' : activeFont.letterSpacing,
      placement,
      ink,
    },
    spec: {
      enabled: isActive,
      text: isActive ? trimmed : '',
      script: isActive ? detectedScript : null,
      fontId: isActive ? activeFont.id : null,
      fontFamily: isActive ? activeFont.fontFamily : null,
      fontWeight: isActive ? activeFont.fontWeight : null,
      letterSpacing: isActive ? (detectedScript === 'arabic' ? '0px' : activeFont.letterSpacing) : '0px',
      placement,
      ink,
    },
  };
}

/**
 * Validates the name-printing state when adding to cart or saving cart edits.
 */
export function validateNamePrintState(state) {
  if (!state?.enabled) {
    return { ok: true, error: '' };
  }
  const trimmed = String(state.text || '').trim();
  if (!trimmed) {
    return {
      ok: false,
      error: 'اكتب الاسم اللي حابب تطبعه على الجراب، أو اقفل الاختيار.',
    };
  }
  if (trimmed.length > MAX_PRINTED_NAME_LENGTH) {
    return {
      ok: false,
      error: `الاسم طويل شوية — خليه في حدود ${MAX_PRINTED_NAME_LENGTH} حرف عشان يطلع واضح.`,
    };
  }
  return { ok: true, error: '' };
}

/**
 * Single shared Name-Printing component used across:
 * 1. Every catalog Product Detail Page (`/products/:slug`)
 * 2. The Customizer studio (`/customize`)
 * 3. In-cart name editing (`CartDrawer`)
 */
export function NamePrintControl({
  state,
  onChange,
  error = '',
  compact = false,
  hideToggle = false,
  inputRef = null,
}) {
  const uid = useId();
  const { detectedScript, availableFonts, activeFont } = resolveNamePrintState(state);

  const update = (patch) => {
    onChange({
      ...state,
      ...patch,
    });
  };

  const handleSelectFont = (fontId) => {
    update({
      selectedFontByScript: {
        ...state.selectedFontByScript,
        [detectedScript]: fontId,
      },
    });
  };

  const isExpanded = Boolean(state.enabled || hideToggle);

  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-stage)] border bg-[var(--surface)] transition-colors duration-150 ${
        error
          ? 'border-[var(--brand)]'
          : state.enabled && !hideToggle
            ? 'border-[var(--ink)]'
            : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
      }`}
    >
      {!hideToggle ? (
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(state.enabled)}
          aria-labelledby={`name-toggle-label-${uid}`}
          aria-describedby={`name-toggle-desc-${uid}`}
          onClick={() => update({ enabled: !state.enabled })}
          className={`flex w-full flex-col text-start transition-colors duration-150 cursor-pointer ${
            compact ? 'p-3.5' : 'p-4 sm:p-5'
          } ${
            state.enabled
              ? 'bg-[var(--brand-yellow-tint)]/55'
              : 'bg-[var(--surface)] hover:bg-[var(--paper)]/70'
          }`}
        >
          {/* Top bar: Icon + Title + Fee/Status Pill + Precision Switch */}
          <span className="flex w-full items-start justify-between gap-3 sm:items-center">
            <span className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center sm:gap-3">
              {!compact ? (
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-ui)] border transition-colors duration-150 sm:mt-0 sm:h-10 sm:w-10 ${
                    state.enabled
                      ? 'border-[var(--brand-black)] bg-[var(--brand-black)] text-[var(--brand-yellow)]'
                      : 'border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--ink)]'
                  }`}
                >
                  <CustomPenIcon className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]" />
                </span>
              ) : null}

              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1.5">
                <span
                  id={`name-toggle-label-${uid}`}
                  className={
                    compact
                      ? 'text-[14.5px] font-bold leading-snug text-[var(--ink)]'
                      : 'type-h3 !text-[17px] sm:!text-[18px] text-[var(--ink)]'
                  }
                >
                  اسمك على الجراب
                </span>

                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-[6px] bg-[var(--brand-yellow)] px-2 py-0.5 text-[12px] font-extrabold leading-[1.35] text-[var(--ink)]">
                  <bdi dir="ltr" className="latin-title tabular-nums">
                    +{STORE_CONFIG.namePrintFee}
                  </bdi>
                  <span>جنيه</span>
                </span>

                {state.enabled ? (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-[6px] bg-[var(--jade-tint)] px-2 py-0.5 text-[11.5px] font-bold leading-[1.35] text-[var(--jade)]">
                    <CheckIcon className="h-3 w-3 shrink-0" />
                    <span>مفعل</span>
                  </span>
                ) : (
                  <span className="whitespace-nowrap rounded-[6px] bg-[var(--card-bg)] px-2 py-0.5 text-[11.5px] font-semibold leading-[1.35] text-[var(--ink-muted)]">
                    اختياري
                  </span>
                )}
              </span>
            </span>

            {/* Precision RTL Switch Track (`54x30`, equal 1px border in both states for zero shift) */}
            <span
              aria-hidden="true"
              className={`relative mt-0.5 inline-flex h-[30px] w-[54px] shrink-0 items-center rounded-full border p-1 transition-colors duration-150 sm:mt-0 ${
                state.enabled
                  ? 'border-transparent bg-[var(--brand)]'
                  : 'border-[var(--border-strong)] bg-[var(--card-bg)]'
              }`}
            >
              <span
                className={`block h-[20px] w-[20px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
                  state.enabled ? '-translate-x-[24px]' : 'translate-x-0'
                }`}
              />
            </span>
          </span>

          {/* Full-width on mobile (`ps-0`), aligned to title on `sm:` (`sm:ps-[52px]`) */}
          <span
            className={`mt-2 block w-full ${!compact ? 'sm:ps-[52px]' : ''}`}
          >
            <span
              id={`name-toggle-desc-${uid}`}
              className="block text-[13px] leading-[1.6] text-[var(--ink-muted)] sm:text-[13.5px]"
            >
              اكتب بالعربي أو الإنجليزي والخطوط بتتغير تلقائي حسب اللغة.
            </span>

            {!compact && !state.enabled ? (
              <span
                aria-hidden="true"
                className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ink)]"
              >
                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-[6px] border border-[var(--border-subtle)] bg-[var(--paper)] px-2 py-0.5">
                  <span className="font-bold text-[var(--brand)]">أ</span>
                  <span className="text-[var(--ink-muted)]">عربي</span>
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-[6px] border border-[var(--border-subtle)] bg-[var(--paper)] px-2 py-0.5">
                  <span dir="ltr" className="latin-title font-bold text-[var(--ink)]">Aa</span>
                  <span className="text-[var(--ink-muted)]">إنجليزي</span>
                </span>
                <span className="inline-flex items-center whitespace-nowrap rounded-[6px] border border-[var(--border-subtle)] bg-[var(--paper)] px-2 py-0.5 text-[var(--ink-muted)]">
                  معاينة فورية على الجراب
                </span>
              </span>
            ) : null}
          </span>
        </button>
      ) : null}

      {isExpanded ? (
        <div
          className={`${
            hideToggle
              ? compact
                ? 'p-3.5'
                : 'p-4 sm:p-5'
              : `border-t border-[var(--border-subtle)] ${compact ? 'p-3.5 pt-3.5' : 'p-4 pt-4 sm:p-5 sm:pt-4'}`
          } space-y-4`}
        >
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor={`name-print-input-${uid}`}
                className="text-[13.5px] font-semibold text-[var(--ink)]"
              >
                اكتب الاسم
              </label>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--card-bg)] px-2 py-0.5 font-semibold text-[var(--ink)]">
                  <span className={detectedScript === 'latin' ? 'latin-title font-bold' : 'font-bold text-[var(--brand)]'}>
                    {detectedScript === 'arabic' ? 'أ' : 'Aa'}
                  </span>
                  <span>
                    {detectedScript === 'arabic' ? 'خطوط عربي تلقائي' : 'خطوط إنجليزي تلقائي'}
                  </span>
                </span>
                <span className="type-caption tabular-nums">
                  {String(state.text || '').trim().length}/{MAX_PRINTED_NAME_LENGTH}
                </span>
              </div>
            </div>

            <div
              dir={detectedScript === 'arabic' ? 'rtl' : 'ltr'}
              className="relative"
            >
              <input
                ref={inputRef}
                id={`name-print-input-${uid}`}
                type="text"
                maxLength={MAX_PRINTED_NAME_LENGTH}
                value={state.text}
                onChange={(e) => update({ text: e.target.value })}
                dir={detectedScript === 'arabic' ? 'rtl' : 'ltr'}
                placeholder="مثلا: يوسف أو Youssef"
                aria-invalid={Boolean(error)}
                className={`min-h-[46px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] px-3.5 text-[15.5px] text-[var(--ink)] placeholder:text-[var(--ink-muted)] ${
                  state.text ? 'pe-11' : ''
                }`}
              />
              {state.text ? (
                <button
                  type="button"
                  onClick={() => update({ text: '' })}
                  aria-label="مسح الاسم"
                  className="absolute end-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[6px] text-[var(--ink-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--ink)] cursor-pointer"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {error ? (
              <p role="alert" className="mt-1.5 text-[13px] font-bold text-[var(--brand)]">
                {error}
              </p>
            ) : null}
          </div>

          {/* 4 Script-Adaptive Live Font Previews */}
          <div>
            <span className="mb-2 block text-[13.5px] font-semibold text-[var(--ink)]">
              اختار الخط
            </span>
            <div
              role="radiogroup"
              aria-label="اختيار نوع الخط"
              className="grid grid-cols-2 gap-2.5"
            >
              {availableFonts.map((font) => {
                const isSelected = activeFont.id === font.id;
                const sampleText = String(state.text || '').trim() || font.sampleFallback;
                return (
                  <button
                    key={font.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectFont(font.id)}
                    className={`flex min-h-[68px] flex-col items-start justify-between rounded-[var(--radius-ui)] border p-3 text-start transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[var(--ink)] bg-[var(--brand-yellow-tint)]'
                        : 'border-[var(--border-subtle)] bg-[var(--card-bg)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <span
                      dir={detectedScript === 'arabic' ? 'rtl' : 'ltr'}
                      lang={detectedScript === 'arabic' ? 'ar' : 'en'}
                      className="w-full truncate text-[19px] leading-[1.4] text-[var(--ink)]"
                      style={{
                        fontFamily: font.fontFamily,
                        fontWeight: font.fontWeight,
                        letterSpacing: detectedScript === 'arabic' ? '0px' : font.letterSpacing,
                      }}
                    >
                      {sampleText}
                    </span>
                    <span className="type-caption mt-1 text-[11.5px]">{font.labelAr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Placement & Ink */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-[13.5px] font-semibold text-[var(--ink)]">
                مكان الاسم
              </span>
              <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="مكان الاسم">
                {NAME_PLACEMENTS.map((pos) => {
                  const isSelected = state.placement === pos.id;
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => update({ placement: pos.id })}
                      className={`min-h-[40px] rounded-[var(--radius-ui)] border px-2 text-[13.5px] font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                          : 'border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--ink)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      {pos.labelAr}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-[13.5px] font-semibold text-[var(--ink)]">
                لون الكتابة
              </span>
              <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="لون الكتابة">
                {[
                  { id: 'light', labelAr: 'أبيض فاتح' },
                  { id: 'dark', labelAr: 'أسود غامق' },
                ].map((opt) => {
                  const isSelected = state.ink === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => update({ ink: opt.id })}
                      className={`min-h-[40px] rounded-[var(--radius-ui)] border px-2.5 text-[13.5px] font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                          : 'border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--ink)] hover:border-[var(--border-strong)]'
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
  );
}

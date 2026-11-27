import { useId } from 'react';
import { STORE_CONFIG } from '../../config/store';
import {
  CUSTOMIZER_FONTS,
  NAME_PLACEMENTS,
  detectTextScript,
} from '../../data/customizerFonts';
import { MAX_PRINTED_NAME_LENGTH } from '../../utils/pricing';

/** Exact label required across catalog product pages and custom studio flow. */
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

  return (
    <div
      className={`rounded-[var(--radius-stage)] border bg-[var(--surface)] ${
        error ? 'border-[var(--brand)]' : 'border-[var(--border-subtle)]'
      } ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}
    >
      {!hideToggle ? (
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span
              id={`name-toggle-label-${uid}`}
              className={
                compact
                  ? 'block text-[14px] font-bold text-[var(--ink)]'
                  : 'type-h3 block !text-[17px] text-[var(--ink)]'
              }
            >
              {NAME_PRINT_OPTION_LABEL}
            </span>
            <p className="type-caption mt-0.5 text-[12.5px]">
              اكتب بالعربي أو الإنجليزي والخطوط بتتغير تلقائي حسب اللغة.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(state.enabled)}
            aria-labelledby={`name-toggle-label-${uid}`}
            onClick={() => update({ enabled: !state.enabled })}
            className={`relative inline-flex h-[32px] w-[56px] shrink-0 items-center rounded-full p-1 transition-colors duration-150 cursor-pointer ${
              state.enabled
                ? 'bg-[var(--brand)]'
                : 'border border-[var(--border-strong)] bg-[var(--card-bg)]'
            }`}
          >
            <span
              className={`block h-[22px] w-[22px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
                state.enabled ? '-translate-x-[24px]' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      ) : null}

      {state.enabled || hideToggle ? (
        <div className={`${hideToggle ? '' : 'mt-4 border-t border-[var(--border-subtle)] pt-4'} space-y-4`}>
          <div>
            <label
              htmlFor={`name-print-input-${uid}`}
              className="mb-1.5 flex items-center justify-between text-[13.5px] font-semibold text-[var(--ink)]"
            >
              <span>اكتب الاسم</span>
              <span className="type-caption text-[12px] tabular-nums">
                {detectedScript === 'arabic' ? 'خطوط عربي' : 'خطوط إنجليزي'} ·{' '}
                {String(state.text || '').trim().length}/{MAX_PRINTED_NAME_LENGTH}
              </span>
            </label>
            <input
              ref={inputRef}
              id={`name-print-input-${uid}`}
              type="text"
              maxLength={MAX_PRINTED_NAME_LENGTH}
              value={state.text}
              onChange={(e) => update({ text: e.target.value })}
              dir={detectedScript === 'arabic' ? 'rtl' : 'ltr'}
              placeholder="مثلاً: يوسف أو Youssef"
              aria-invalid={Boolean(error)}
              className="min-h-[46px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] px-3.5 text-[15.5px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
            />
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

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EGYPT_MOBILE_REGEX } from '../../contracts/handoffSchema';
import { useStore } from '../../context/StoreContext';
import { BackArrowRtlIcon, CloseIcon, SearchIcon } from '../icons/Icons';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Phone model selector:
 * - Desktop: anchored dropdown panel under the top-left selector
 * - Mobile: bottom sheet
 * Includes brand tabs (RTL horizontal strip), search input, model list,
 * and the persistent "موبايلي مش في القايمة" request form.
 */
export function ModelSelector({ open, onClose }) {
  const {
    phoneBrands,
    allPhoneModels,
    selectedModel,
    selectPhoneModel,
    submitMissingPhone,
  } = useStore();

  const prefersReducedMotion = useReducedMotion();
  const [activeBrand, setActiveBrand] = useState(selectedModel?.brand || phoneBrands[0]);
  const [query, setQuery] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'missing-form' | 'missing-confirmed'

  const [phoneNameInput, setPhoneNameInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submittedPhoneName, setSubmittedPhoneName] = useState('');

  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  const panelRef = useRef(null);
  const searchInputRef = useRef(null);
  const phoneNameInputRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const wasOpenRef = useRef(false);

  // Reset transient search/view state only when panel transitions from closed -> open
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setView('list');
      setQuery('');
      setFormErrors({});
      if (selectedModel?.brand) {
        setActiveBrand(selectedModel.brand);
      }
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
    wasOpenRef.current = open;
  }, [open, selectedModel]);

  useEffect(() => {
    if (open && view === 'missing-form') {
      requestAnimationFrame(() => {
        phoneNameInputRef.current?.focus();
      });
    }
  }, [open, view]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    if (!open || isMobileViewport) return;
    const handlePointerDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Ignore clicks on the trigger button itself (handled by Header toggle)
        if (e.target.closest('[data-model-selector-trigger="true"]')) return;
        onClose();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open, isMobileViewport, onClose]);

  const visibleModels = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed) {
      return allPhoneModels.filter(
        (m) =>
          m.name.toLowerCase().includes(trimmed) || m.brand.toLowerCase().includes(trimmed)
      );
    }
    return allPhoneModels.filter((m) => m.brand === activeBrand);
  }, [allPhoneModels, activeBrand, query]);

  const handleMissingSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    const cleanPhone = phoneNameInput.trim();
    const cleanMobile = mobileInput.replace(/\s+/g, '');

    if (cleanPhone.length < 2) {
      errors.phoneName = 'اكتب اسم الموبايل والموديل الأول.';
    }
    if (!EGYPT_MOBILE_REGEX.test(cleanMobile)) {
      errors.mobileNumber = 'اكتب رقم موبايل مصري صحيح من 11 رقم بيبدأ بـ 010 أو 011 أو 012 أو 015.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    submitMissingPhone({ phoneName: cleanPhone, mobileNumber: cleanMobile });
    setSubmittedPhoneName(cleanPhone);
    setPhoneNameInput('');
    setMobileInput('');
    setView('missing-confirmed');
  };

  const panelBody = (
    <div className="flex flex-col text-start" style={{ maxHeight: isMobileViewport ? '82dvh' : '520px' }}>
      {/* Header row inside selector */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        {view === 'missing-form' ? (
          <button
            type="button"
            onClick={() => {
              setView('list');
              setFormErrors({});
            }}
            className="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-medium text-[var(--charcoal)] hover:text-[var(--klein)] cursor-pointer"
          >
            <BackArrowRtlIcon className="w-4 h-4" />
            <span>رجوع للموديلات</span>
          </button>
        ) : (
          <h2 className="text-[18px] font-bold text-[var(--charcoal)]">
            {view === 'missing-confirmed' ? 'تم استلام طلبك' : 'اختار موبايلك'}
          </h2>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق قائمة الموديلات"
          className="flex h-11 w-11 items-center justify-center rounded-[4px] text-[var(--graphite)] hover:text-[var(--charcoal)] cursor-pointer"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {view === 'list' ? (
        <>
          {/* Brand tabs — RTL horizontal strip on mobile, cleanly wrapped on desktop so all 7 brands stay visible */}
          <div
            role="tablist"
            aria-label="ماركات الموبايلات"
            className="no-scrollbar flex items-center gap-2 overflow-x-auto px-5 py-2 md:flex-wrap md:overflow-visible"
          >
            {phoneBrands.map((brand) => {
              const isActive = activeBrand === brand && !query.trim();
              return (
                <button
                  key={brand}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveBrand(brand);
                    setQuery('');
                  }}
                  className={`min-h-[38px] shrink-0 rounded-[4px] px-2.5 text-[14px] font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'is-selected text-[var(--charcoal)]'
                      : 'text-[var(--graphite)] hover:text-[var(--charcoal)]'
                  }`}
                >
                  <bdi dir="ltr">{brand}</bdi>
                </button>
              );
            })}
          </div>

          {/* Search input */}
          <div className="px-5 py-2">
            <label htmlFor="model-search-input" className="sr-only">
              ابحث عن موديل موبايلك
            </label>
            <div className="relative flex items-center">
              <SearchIcon className="pointer-events-none absolute start-3 w-4 h-4 text-[var(--graphite)]" />
              <input
                ref={searchInputRef}
                id="model-search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="دوّر على الموديل..."
                className="min-h-[44px] w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] ps-10 pe-3 text-[15px] text-[var(--charcoal)] placeholder:text-[var(--graphite)]"
              />
            </div>
          </div>

          {/* Model list */}
          <div
            role="listbox"
            aria-label="قائمة الموديلات"
            className="flex-1 overflow-y-auto px-5 py-2"
          >
            {visibleModels.length > 0 ? (
              <ul className="space-y-1.5">
                {visibleModels.map((model) => {
                  const isCurrent = selectedModel?.id === model.id;
                  return (
                    <li key={model.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => selectPhoneModel(model.id)}
                        className={`flex min-h-[44px] w-full items-center justify-between rounded-[4px] px-3 text-start transition-colors cursor-pointer ${
                          isCurrent
                            ? 'is-selected font-semibold text-[var(--charcoal)]'
                            : 'text-[var(--charcoal)] hover:bg-[var(--plaster)]/60'
                        }`}
                      >
                        <bdi dir="ltr" className="text-[15px]">
                          {model.name}
                        </bdi>
                        {query.trim() ? (
                          <span className="type-caption text-[13px]">
                            <bdi dir="ltr">{model.brand}</bdi>
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-6 text-[15px] text-[var(--graphite)]">
                مفيش موديل بالاسم ده في القايمة. ابعتهولنا من تحت وهنأكدهولك.
              </p>
            )}
          </div>

          {/* Persistent "My phone isn't in the list" option */}
          <div className="px-5 pt-2 pb-4">
            <button
              type="button"
              onClick={() => setView('missing-form')}
              className="btn-secondary w-full justify-start text-[15px]"
            >
              موبايلي مش في القايمة
            </button>
          </div>
        </>
      ) : null}

      {view === 'missing-form' ? (
        <form onSubmit={handleMissingSubmit} noValidate className="space-y-4 px-5 pt-2 pb-5">
          <p className="text-[15px] leading-[1.65] text-[var(--graphite)]">
            اكتب نوع موبايلك ورقمك وهنتأكدلك إن مقاسه متاح عندنا قبل ما تطلب.
          </p>

          <div>
            <label
              htmlFor="missing-phone-name"
              className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
            >
              اسم الموبايل والموديل
            </label>
            <input
              ref={phoneNameInputRef}
              id="missing-phone-name"
              type="text"
              value={phoneNameInput}
              onChange={(e) => setPhoneNameInput(e.target.value)}
              placeholder="مثلاً: Nothing Phone 2a"
              aria-invalid={Boolean(formErrors.phoneName)}
              aria-describedby={formErrors.phoneName ? 'missing-phone-name-err' : undefined}
              className="min-h-[46px] w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] px-3 text-[15px] text-[var(--charcoal)] placeholder:text-[var(--graphite)]"
            />
            {formErrors.phoneName ? (
              <p id="missing-phone-name-err" className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">
                {formErrors.phoneName}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="missing-phone-mobile"
              className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
            >
              رقم الموبايل
            </label>
            <input
              id="missing-phone-mobile"
              type="tel"
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value.replace(/[^\d]/g, '').slice(0, 11))}
              placeholder="01012345678"
              aria-invalid={Boolean(formErrors.mobileNumber)}
              aria-describedby={formErrors.mobileNumber ? 'missing-phone-mobile-err' : undefined}
              className="min-h-[46px] w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] px-3 text-start text-[15px] tabular-nums text-[var(--charcoal)] placeholder:text-[var(--graphite)]"
            />
            {formErrors.mobileNumber ? (
              <p id="missing-phone-mobile-err" className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">
                {formErrors.mobileNumber}
              </p>
            ) : null}
          </div>

          <button type="submit" className="btn-primary w-full">
            ابعت
          </button>
        </form>
      ) : null}

      {view === 'missing-confirmed' ? (
        <div className="space-y-4 px-5 pt-2 pb-5">
          <p className="text-[16px] leading-[1.7] font-medium text-[var(--charcoal)]">
            خدمة العملاء هتتواصل معاك لتأكيد الموديل
          </p>
          {submittedPhoneName ? (
            <p className="type-caption">
              الموديل المطلوب: <bdi dir="ltr" className="text-[var(--charcoal)]">{submittedPhoneName}</bdi>
            </p>
          ) : null}
          <p className="text-[14px] leading-[1.6] text-[var(--graphite)]">
            تقدر تتصفح كل التصميمات دلوقتي عادي، وأول ما نأكد الموديل هنجهزلك جرابك.
          </p>
          <button type="button" onClick={onClose} className="btn-primary w-full">
            تصفح الجرابات
          </button>
        </div>
      ) : null}
    </div>
  );

  // Mobile bottom sheet
  if (isMobileViewport) {
    return (
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="اختيار الموبايل">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              onClick={onClose}
              className="fixed inset-0 bg-[#26282B]/35"
            />
            <motion.div
              ref={panelRef}
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: 0.24, ease: EASE }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[4px] bg-[var(--gallery-white)]"
            >
              {panelBody}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    );
  }

  // Desktop anchored dropdown (physical left / inline-end)
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label="اختيار الموبايل"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="absolute end-0 top-[calc(100%+8px)] z-50 w-[408px] rounded-[4px] border border-[rgba(38,40,43,0.16)] bg-[var(--gallery-white)]"
        >
          {panelBody}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

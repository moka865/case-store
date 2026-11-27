import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { CheckIcon, CloseIcon, SearchIcon } from '../icons/Icons';
import { MissingPhoneRequestForm } from './PhoneModelFields';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Site-wide Header Phone-Model Selector:
 * Sets the default phone filter across listings; individual items can override their model
 * on the product page, customizer, quick-add modal, or cart without mutating this default.
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
  const [view, setView] = useState('list');
  const [submittedPhoneName, setSubmittedPhoneName] = useState('');

  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  const panelRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setView('list');
      setQuery('');
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
    if (!open || isMobileViewport) return;
    const handlePointerDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
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

  const panelBody = (
    <div className="flex flex-col text-start text-[var(--ink)]" style={{ maxHeight: isMobileViewport ? '84dvh' : '540px' }}>
      {isMobileViewport ? (
        <div className="flex justify-center pt-2.5" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-[var(--ink)]/20" />
        </div>
      ) : null}

      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 pt-3.5 pb-3">
        <div>
          <h2 className="type-h3 text-[18px] text-[var(--ink)]">
            {view === 'missing-confirmed' ? 'استلمنا طلب موديلك' : 'اختار موديل موبايلك'}
          </h2>
          {view === 'list' ? (
            <p className="text-[12.5px] text-[var(--ink-muted)]">
              فلتر التصميمات لموبايلك، وتقدر تغير الموديل لكل جراب لوحده وقت الطلب
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق قائمة الموديلات"
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-ui)] text-[var(--ink-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--ink)] cursor-pointer"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      {view === 'list' ? (
        <>
          <div
            role="tablist"
            aria-label="ماركات الموبايلات"
            className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-5 pt-3 pb-1.5 md:flex-wrap md:overflow-visible"
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
                  className={`min-h-[36px] shrink-0 rounded-full px-3 text-[13.5px] font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--ink)] text-white'
                      : 'bg-[var(--card-bg)] text-[var(--ink)] hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  <bdi dir="ltr" className="latin-title">{brand}</bdi>
                </button>
              );
            })}
          </div>

          <div className="px-5 py-2">
            <label htmlFor="model-search-input" className="sr-only">
              ابحث عن موديل موبايلك
            </label>
            <div className="relative flex items-center">
              <SearchIcon className="pointer-events-none absolute start-3.5 h-4 w-4 text-[var(--ink-muted)]" />
              <input
                ref={searchInputRef}
                id="model-search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اكتب اسم الموديل... مثلا S24 أو Note 13"
                className="min-h-[44px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] ps-10 pe-3 text-[14.5px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
              />
            </div>
          </div>

          <div
            role="listbox"
            aria-label="قائمة الموديلات"
            className="flex-1 overflow-y-auto px-5 py-1.5"
          >
            {visibleModels.length > 0 ? (
              <ul className="space-y-1">
                {visibleModels.map((model) => {
                  const isCurrent = selectedModel?.id === model.id;
                  return (
                    <li key={model.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => selectPhoneModel(model.id)}
                        className={`flex min-h-[44px] w-full items-center justify-between rounded-[var(--radius-ui)] px-3.5 text-start transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[var(--brand-yellow-tint)] border border-[var(--ink)]/25 font-bold text-[var(--ink)]'
                            : 'text-[var(--ink)] hover:bg-[var(--card-bg)]'
                        }`}
                      >
                        <bdi dir="ltr" className="latin-title text-[15px] font-semibold">
                          {model.name}
                        </bdi>
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[var(--jade)]">
                            <CheckIcon className="h-3.5 w-3.5" />
                            <span>مختار</span>
                          </span>
                        ) : query.trim() ? (
                          <span className="type-caption text-[12.5px]">
                            <bdi dir="ltr">{model.brand}</bdi>
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-6 text-[14.5px] text-[var(--ink-muted)]">
                ملقيناش الموديل ده في القايمة. ابعتهولنا من الزرار اللي تحت وهنأكدهولك فورا.
              </p>
            )}
          </div>

          <div className="border-t border-[var(--border-subtle)] bg-[var(--paper)] px-5 py-3">
            <button
              type="button"
              onClick={() => setView('missing-form')}
              className="btn-secondary w-full justify-start !min-h-[38px] text-[14.5px]"
            >
              موبايلي مش في القايمة
            </button>
          </div>
        </>
      ) : null}

      {view === 'missing-form' ? (
        <div className="px-5 pt-4 pb-5">
          <MissingPhoneRequestForm
            onCancel={() => setView('list')}
            onSubmitRequest={({ phoneName, mobileNumber }) => {
              submitMissingPhone({ phoneName, mobileNumber });
              setSubmittedPhoneName(phoneName);
              setView('missing-confirmed');
            }}
          />
        </div>
      ) : null}

      {view === 'missing-confirmed' ? (
        <div className="space-y-4 px-5 pt-4 pb-5">
          <div className="rounded-[var(--radius-ui)] border border-[var(--jade)]/25 bg-[var(--jade-tint)] p-3.5">
            <p className="text-[15.5px] leading-[1.65] font-bold text-[var(--jade)]">
              خدمة العملاء هتتواصل معاك لتأكيد الموديل
            </p>
            {submittedPhoneName ? (
              <p className="mt-1 text-[13.5px] text-[var(--ink)]">
                الموديل المطلوب: <bdi dir="ltr" className="font-bold">{submittedPhoneName}</bdi>
              </p>
            ) : null}
          </div>
          <p className="text-[14px] leading-[1.6] text-[var(--ink-muted)]">
            تقدر تتصفح كل التصميمات دلوقتي عادي، وأول ما نأكد الموديل هنجهزلك جرابك.
          </p>
          <button type="button" onClick={onClose} className="btn-primary w-full">
            تصفح الجرابات
          </button>
        </div>
      ) : null}
    </div>
  );

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
              className="fixed inset-0 bg-[#111317]/45"
            />
            <motion.div
              ref={panelRef}
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: 0.24, ease: EASE }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[16px] border-t border-[var(--border-strong)] bg-[var(--surface)]"
            >
              {panelBody}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    );
  }

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
          transition={{ duration: 0.2, ease: EASE }}
          style={{ boxShadow: 'var(--shadow-panel)' }}
          className="absolute end-0 top-[calc(100%+10px)] z-50 w-[412px] overflow-hidden rounded-[var(--radius-stage)] border border-[var(--border-strong)] bg-[var(--surface)]"
        >
          {panelBody}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

import { useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, NavLink } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { useOverlayDialog } from '../../hooks/useMobileViewportState';
import { BrandLogo } from '../brand/BrandLogo';
import {
  CashCodIcon,
  CloseIcon,
  ForwardArrowRtlIcon,
  PhoneHardwareIcon,
  SearchIcon,
} from '../icons/Icons';

const EASE = [0.22, 1, 0.36, 1];

const DRAWER_LINKS = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/categories', label: 'كل الجرابات', end: true },
  { to: '/customize', label: 'صمم جرابك', end: true },
  { to: '/how-it-works', label: 'إزاي تطلب والشحن', end: true },
];

/**
 * Brand-native RTL Mobile Navigation Drawer (`start-0` — opens from the right in RTL).
 * Houses secondary navigation (`إزاي تطلب والشحن`), direct category shortcuts with live counts,
 * quick search handoff, and a prominent Phone-Model card.
 */
export function MobileMenuDrawer({ open, onClose, onOpenSearch }) {
  const {
    categories,
    categoryCounts,
    phoneSelection,
    selectedModel,
    setIsModelSelectorOpen,
    setSearchQuery,
  } = useStore();

  const prefersReducedMotion = useReducedMotion();
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);

  useOverlayDialog({
    open,
    onClose,
    containerRef: drawerRef,
    initialFocusRef: closeBtnRef,
  });

  const handleOpenModelSelector = () => {
    onClose();
    window.requestAnimationFrame(() => {
      setIsModelSelectorOpen(true);
    });
  };

  const handleOpenSearchClick = () => {
    onClose();
    window.requestAnimationFrame(() => {
      onOpenSearch?.();
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <div
          id="mobile-navigation-drawer"
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="القائمة الرئيسية"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: EASE }}
            onClick={onClose}
            className="fixed inset-0 bg-[#111317]/55"
          />

          <motion.aside
            ref={drawerRef}
            initial={prefersReducedMotion ? false : { x: '100%' }}
            animate={{ x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: EASE }}
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
              paddingInlineStart: 'env(safe-area-inset-right, 0px)',
            }}
            className="fixed inset-y-0 start-0 z-50 flex h-dvh w-[min(340px,88vw)] flex-col bg-[var(--surface)] text-start"
          >
            {/* Brand-black drawer header */}
            <div className="brand-dark-bar flex items-center justify-between bg-[var(--brand-black)] px-4 py-3 text-white">
              <Link
                to="/"
                onClick={() => {
                  setSearchQuery('');
                  onClose();
                }}
                aria-label={`${STORE_CONFIG.name} — الصفحة الرئيسية`}
                className="inline-flex items-center rounded-[var(--radius-ui)] py-0.5"
              >
                <BrandLogo size="sm" />
              </Link>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="إغلاق القائمة"
                className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-ui)] text-white hover:bg-white/15 cursor-pointer"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Gold & Crimson brand rule */}
            <div className="flex h-1 w-full shrink-0" aria-hidden="true">
              <span className="w-2/3 bg-[var(--brand)]" />
              <span className="w-1/3 bg-[var(--brand-yellow)]" />
            </div>

            {/* Scrollable body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
              {/* Active Phone Model Card */}
              <div className="rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--card-bg)] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[var(--ink-muted)]">
                      الموبايل المختار للتصفح
                    </p>
                    <p className="mt-0.5 truncate text-[14.5px] font-bold text-[var(--ink)]">
                      {phoneSelection.status === 'selected' && selectedModel ? (
                        <bdi dir="ltr" className="latin-title">
                          {selectedModel.name}
                        </bdi>
                      ) : phoneSelection.status === 'pending' ? (
                        <span>
                          قيد التأكيد:{' '}
                          <bdi dir="ltr">{phoneSelection.pendingPhoneName}</bdi>
                        </span>
                      ) : (
                        'كل الموديلات المتاحة'
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenModelSelector}
                    className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full bg-[var(--brand-yellow)] px-3.5 text-[13px] font-bold text-[var(--ink)] hover:bg-[var(--brand-yellow-hover)] cursor-pointer"
                  >
                    <PhoneHardwareIcon className="h-4 w-4" />
                    <span>
                      {phoneSelection.status === 'none' ? 'اختار موبايلك' : 'غير'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick search button */}
              <button
                type="button"
                onClick={handleOpenSearchClick}
                className="flex min-h-[44px] w-full items-center justify-between rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] px-3.5 text-[14px] text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <span>دور باسم التصميم أو القسم...</span>
                <SearchIcon className="h-4 w-4 shrink-0 text-[var(--ink)]" />
              </button>

              {/* Primary store pages */}
              <nav aria-label="صفحات المتجر">
                <ul className="space-y-1">
                  {DRAWER_LINKS.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex min-h-[46px] items-center justify-between rounded-[var(--radius-ui)] px-3.5 text-[15px] transition-colors ${
                            isActive
                              ? 'bg-[var(--ink)] font-bold text-white'
                              : 'font-semibold text-[var(--ink)] hover:bg-[var(--card-bg)]'
                          }`
                        }
                      >
                        <span>{item.label}</span>
                        <ForwardArrowRtlIcon className="h-4 w-4 opacity-60" />
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Direct Category Grid (handles long Arabic category names gracefully) */}
              <div className="border-t border-[var(--border-subtle)] pt-4">
                <div className="mb-2.5 flex items-baseline justify-between">
                  <h2 className="type-h3 !text-[15.5px] text-[var(--ink)]">أقسام الجرابات</h2>
                  <span className="type-caption text-[12px] tabular-nums">
                    {categoryCounts.all ?? 0} تصميم
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.slug}`}
                      onClick={() => {
                        setSearchQuery('');
                        onClose();
                      }}
                      className="flex min-h-[44px] items-center justify-between gap-1.5 rounded-[var(--radius-ui)] border border-[var(--border-subtle)] bg-[var(--paper)] px-3 py-2 text-[13.5px] font-semibold text-[var(--ink)] hover:border-[var(--border-strong)] hover:bg-[var(--card-bg)]"
                    >
                      <span className="min-w-0 truncate">{cat.nameAr}</span>
                      <span className="shrink-0 text-[11.5px] font-bold text-[var(--ink-muted)] tabular-nums">
                        {categoryCounts[cat.id] ?? 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Store COD assurance footer */}
            <div className="border-t border-[var(--border-subtle)] bg-[var(--paper)] px-4 py-3 text-[12.5px] text-[var(--ink-muted)]">
              <div className="flex items-center gap-1.5 font-bold text-[var(--jade)]">
                <CashCodIcon className="h-4 w-4 shrink-0" />
                <span>{STORE_CONFIG.paymentLabelAr} لكل محافظات مصر</span>
              </div>
              <p className="mt-0.5 text-[12px]">{STORE_CONFIG.contact.hoursAr}</p>
              <Link
                to="/terms"
                onClick={onClose}
                className="mt-1 inline-flex min-h-[36px] items-center font-semibold text-[var(--ink)] underline underline-offset-4 hover:text-[var(--brand)]"
              >
                الشروط والأحكام
              </Link>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

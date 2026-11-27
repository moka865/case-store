import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from '../brand/BrandLogo';
import {
  CartBagIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuBarsRtlIcon,
  PhoneHardwareIcon,
  SearchIcon,
} from '../icons/Icons';
import { FirstVisitPopover } from './FirstVisitPopover';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { ModelSelector } from './ModelSelector';

const PRIMARY_NAV_ITEMS = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/categories', label: 'الأقسام', end: false },
  { to: '/customize', label: 'صمم جرابك', end: true },
  { to: '/how-it-works', label: 'إزاي تطلب', end: true },
];

/**
 * Sticky Header driven by the official غلاف logo:
 * - Desktop (`>= 1024px`): Full horizontal bar (`BrandLogo`, inline `PRIMARY_NAV_ITEMS`, Cart, Search,
 *   Phone-Model Pill) + sticky COD & governorate shipping strip underneath.
 * - Phone & small screens (`< 1024px`): Slim single-row top bar (`56px` portrait / `48px` landscape)
 *   pairing `[Menu Drawer button + BrandLogo]` on the right with `[Search + Phone-Model Pill]` on the left,
 *   working in tandem with `MobileBottomNav` and `MobileMenuDrawer`.
 */
export function Header() {
  const {
    categories,
    governorates,
    phoneSelection,
    selectedModel,
    isModelSelectorOpen,
    setIsModelSelectorOpen,
    showFirstVisitPopover,
    dismissFirstVisitPopover,
    searchQuery,
    setSearchQuery,
    cartCount,
    cartPulseKey,
    setIsCartOpen,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const cairoFee = useMemo(() => {
    const cairo = governorates.find((g) => g.id === 'cairo');
    return cairo?.shippingFee ?? 50;
  }, [governorates]);

  useEffect(() => {
    if (isSearchOpen) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [isSearchOpen]);

  // Close mobile drawer on route change; collapse search tray when leaving catalog routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (!pathname.startsWith('/categories')) {
      setIsSearchOpen(false);
    }
  }, [pathname]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim() && !pathname.startsWith('/categories')) {
      navigate('/categories');
    }
  };

  const hasSelectedModel = phoneSelection.status === 'selected' && Boolean(selectedModel);
  const isPendingModel = phoneSelection.status === 'pending';

  return (
    <>
      <header className="sticky top-0 z-30">
        {/* Main `#010000` brand bar matching the official logo background */}
        <div
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          className="brand-dark-bar bg-[var(--brand-black)] text-white"
        >
          <div className="page-container flex min-h-[var(--header-height)] flex-nowrap items-center justify-between gap-2">
            {/* Inline-start (physical right): Mobile Menu Trigger + Official غلاف Logo */}
            <div className="flex min-w-0 items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (showFirstVisitPopover) dismissFirstVisitPopover();
                  setIsSearchOpen(false);
                  setIsMobileMenuOpen(true);
                }}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                aria-label="افتح القائمة والأقسام"
                className="-ms-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-ui)] text-white transition-colors hover:bg-white/12 cursor-pointer lg:hidden"
              >
                <MenuBarsRtlIcon className="h-5 w-5" />
              </button>

              <Link
                to="/"
                onClick={() => setSearchQuery('')}
                aria-label={`${STORE_CONFIG.name} — الصفحة الرئيسية`}
                className="inline-flex min-h-[44px] shrink-0 items-center rounded-[var(--radius-ui)] py-1 pe-1"
              >
                <BrandLogo size="sm" className="lg:!h-11" />
              </Link>
            </div>

            {/* Desktop Primary Navigation (`>= 1024px` — unchanged) */}
            <nav
              aria-label="التنقل الرئيسي"
              className="hidden items-center justify-start gap-7 lg:ms-8 lg:me-auto lg:flex"
            >
              {PRIMARY_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative inline-flex min-h-[46px] shrink-0 items-center px-1 text-[15.5px] transition-colors duration-150 ${
                      isActive
                        ? 'font-bold text-white after:absolute after:inset-x-0 after:bottom-1 after:h-[2.5px] after:rounded-full after:bg-[var(--brand-yellow)]'
                        : 'font-medium text-white/75 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Inline-end action cluster (Desktop Cart -> Search -> Phone-Model Pill at physical top-left) */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {/* Desktop Cart trigger (on `< 1024px`, Cart with live badge lives in thumb-zone MobileBottomNav) */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={`السلة، فيها ${cartCount} منتجات`}
                className="relative hidden min-h-[44px] items-center justify-center gap-1.5 rounded-[var(--radius-ui)] px-2 text-white transition-colors hover:bg-white/10 cursor-pointer lg:inline-flex"
              >
                <CartBagIcon className="h-5 w-5" />
                <motion.span
                  key={cartPulseKey}
                  initial={prefersReducedMotion || cartPulseKey === 0 ? false : { scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className={`min-w-[22px] rounded-[6px] px-1.5 text-center text-[12.5px] font-bold tabular-nums leading-[20px] ${
                    cartCount > 0
                      ? 'bg-[var(--brand)] text-white'
                      : 'bg-white/15 text-white/85'
                  }`}
                >
                  {cartCount}
                </motion.span>
              </button>

              {/* Search toggle */}
              <button
                type="button"
                onClick={() => {
                  if (showFirstVisitPopover) dismissFirstVisitPopover();
                  if (isSearchOpen && searchQuery) {
                    setSearchQuery('');
                  }
                  setIsSearchOpen((prev) => !prev);
                }}
                aria-expanded={isSearchOpen}
                aria-label={isSearchOpen ? 'إغلاق البحث' : 'ابحث في الجرابات'}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-ui)] transition-colors cursor-pointer ${
                  isSearchOpen || searchQuery
                    ? 'bg-white/20 text-white'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {isSearchOpen ? <CloseIcon className="h-5 w-5" /> : <SearchIcon className="h-5 w-5" />}
              </button>

              {/* Phone-Model Selector Pill at physical top-left */}
              <div className="relative">
                <button
                  type="button"
                  data-model-selector-trigger="true"
                  aria-expanded={isModelSelectorOpen}
                  aria-haspopup="dialog"
                  onClick={() => setIsModelSelectorOpen((prev) => !prev)}
                  className={`inline-flex min-h-[38px] sm:min-h-[40px] items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 text-[12.5px] sm:text-[14px] transition-colors duration-150 cursor-pointer ${
                    hasSelectedModel
                      ? 'bg-white text-[var(--ink)] hover:bg-[var(--paper)]'
                      : isPendingModel
                        ? 'bg-[var(--brand-yellow-tint)] text-[var(--ink)]'
                        : 'bg-[var(--brand-yellow)] text-[var(--ink)] hover:bg-[var(--brand-yellow-hover)]'
                  }`}
                >
                  {hasSelectedModel ? (
                    <>
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--jade)]" aria-hidden="true" />
                      <bdi
                        dir="ltr"
                        className="latin-title max-w-[92px] min-[400px]:max-w-[122px] sm:max-w-[164px] truncate font-bold"
                      >
                        {selectedModel.name}
                      </bdi>
                    </>
                  ) : isPendingModel ? (
                    <>
                      <PhoneHardwareIcon className="h-4 w-4 shrink-0 text-[var(--ink)]" />
                      <span className="max-w-[96px] min-[400px]:max-w-[124px] sm:max-w-[166px] truncate font-bold">
                        موديلك قيد التأكيد
                      </span>
                    </>
                  ) : (
                    <>
                      <PhoneHardwareIcon className="h-4 w-4 shrink-0 text-[var(--ink)]" />
                      <span className="whitespace-nowrap font-bold">اختار موبايلك</span>
                    </>
                  )}
                  <ChevronDownIcon
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-[var(--ink)] ${
                      isModelSelectorOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <FirstVisitPopover
                  open={showFirstVisitPopover}
                  onChooseNow={() => setIsModelSelectorOpen(true)}
                  onDismiss={dismissFirstVisitPopover}
                />

                <ModelSelector
                  open={isModelSelectorOpen}
                  onClose={() => setIsModelSelectorOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop sticky COD & shipping bar (on mobile this renders non-sticky in MainLayout to save vertical viewport) */}
        <div className="hidden border-b border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--ink)] lg:block">
          <div className="page-container flex min-h-[32px] items-center justify-between gap-4 py-1 text-[12.5px]">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />
              <span className="font-bold">{STORE_CONFIG.paymentLabelAr}</span>
              <span className="text-[var(--ink-muted)]/60" aria-hidden="true">·</span>
              <span className="truncate text-[var(--ink-muted)]">
                شحن القاهرة والجيزة {cairoFee} {STORE_CONFIG.currencyLabel}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-[var(--ink-muted)]">
              <span>تجهيز وطباعة خلال {STORE_CONFIG.productionDays} أيام عمل</span>
            </div>
          </div>
        </div>

        {/* Expandable inline search bar + mobile quick-category pills */}
        {isSearchOpen ? (
          <div
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                setIsSearchOpen(false);
              }
            }}
            className="surface-light-panel border-b border-[var(--border-subtle)] bg-[var(--surface)]"
          >
            <div className="page-container py-2.5">
              <div className="ms-auto flex max-w-[540px] lg:max-w-[480px] items-center gap-2.5">
                <label htmlFor="global-store-search" className="sr-only">
                  ابحث باسم التصميم أو القسم
                </label>
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-muted)]" />
                  <input
                    ref={searchRef}
                    id="global-store-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="دور باسم التصميم أو القسم... مثلا أنمي، كورة، Zamalek"
                    className="min-h-[44px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] ps-10 pe-3.5 text-[14.5px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
                  />
                </div>
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="btn-secondary shrink-0 !text-[14px]"
                  >
                    مسح
                  </button>
                ) : null}
              </div>

              {/* Mobile quick-tap category chips inside search tray */}
              <div
                aria-label="اختصارات الأقسام"
                className="no-scrollbar mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 lg:hidden"
              >
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.slug}`}
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="inline-flex min-h-[36px] shrink-0 items-center rounded-full border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3 text-[12.5px] font-semibold text-[var(--ink)] hover:border-[var(--border-strong)]"
                  >
                    {cat.nameAr}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* Root-level RTL Mobile Navigation Drawer (outside sticky header stacking context) */}
      <MobileMenuDrawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    </>
  );
}

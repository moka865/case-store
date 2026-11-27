import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { GhilafLogo } from '../brand/GhilafLogo';
import {
  CartBagIcon,
  ChevronDownIcon,
  CloseIcon,
  PhoneHardwareIcon,
  SearchIcon,
} from '../icons/Icons';
import { FirstVisitPopover } from './FirstVisitPopover';
import { ModelSelector } from './ModelSelector';

const PRIMARY_NAV_ITEMS = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/categories', label: 'الأقسام', end: false },
  { to: '/customize', label: 'صمّم جرابك', end: true },
  { to: '/how-it-works', label: 'إزاي تطلب', end: true },
];

/**
 * Print-house sticky header for غلاف:
 * - Top slim utility strip with data-driven COD, Cairo/Giza shipping fee, and production days
 * - Main bar:
 *   - Inline-start (right): Custom SVG GhilafLogo wordmark + emblem
 *   - Primary nav: 4 crisp Arabic links with Vermilion active underline bar
 *   - Inline-end (physical left): Cart trigger, Search toggle, and prominent Phone-Model Selector pill
 */
export function Header() {
  const {
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

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim() && !pathname.startsWith('/categories')) {
      navigate('/categories');
    }
  };

  const hasSelectedModel = phoneSelection.status === 'selected' && Boolean(selectedModel);
  const isPendingModel = phoneSelection.status === 'pending';

  return (
    <header className="sticky top-0 z-30 bg-[var(--paper)] border-b border-[var(--border-subtle)]">
      {/* Slim data-driven Egyptian COD & shipping assurance bar */}
      <div className="bg-[var(--ink)] text-[var(--paper)]">
        <div className="page-container flex min-h-[32px] items-center justify-between gap-4 py-1 text-[12px] sm:text-[12.5px] font-medium">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sun)]" aria-hidden="true" />
            <span className="font-semibold text-white">{STORE_CONFIG.paymentLabelAr}</span>
            <span className="text-white/40" aria-hidden="true">·</span>
            <span className="truncate text-white/85">
              شحن القاهرة والجيزة {cairoFee} {STORE_CONFIG.currencyLabel}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 shrink-0 text-white/80">
            <span>تجهيز وطباعة خلال {STORE_CONFIG.productionDays} أيام عمل</span>
          </div>
        </div>
      </div>

      {/* Main studio navigation bar */}
      <div className="page-container flex flex-wrap items-center justify-between gap-x-3 gap-y-0 pt-2 pb-1.5 lg:min-h-[var(--header-height)] lg:flex-nowrap lg:py-0">
        {/* Inline-start (physical right): Custom SVG Brand Logo */}
        <Link
          to="/"
          onClick={() => setSearchQuery('')}
          aria-label={`${STORE_CONFIG.name} — الصفحة الرئيسية`}
          className="order-1 inline-flex min-h-[44px] items-center rounded-[var(--radius-ui)] py-1 pe-1"
        >
          <GhilafLogo theme="light" size="md" />
        </Link>

        {/* Primary navigation (strict RTL focus order right after logo) */}
        <nav
          aria-label="التنقل الرئيسي"
          className="order-3 flex w-full items-center justify-start gap-4 overflow-x-auto no-scrollbar border-t border-[var(--border-subtle)] pt-1 pb-0.5 mt-1 sm:gap-6 lg:order-2 lg:mt-0 lg:w-auto lg:border-t-0 lg:pt-0 lg:pb-0 lg:ms-7 lg:me-auto"
        >
          {PRIMARY_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative inline-flex min-h-[42px] lg:min-h-[46px] shrink-0 items-center px-1 text-[14.5px] sm:text-[15.5px] transition-colors duration-150 ${
                  isActive
                    ? 'font-bold text-[var(--ink)] after:absolute after:inset-x-0 after:bottom-0.5 lg:after:bottom-1 after:h-[2.5px] after:rounded-full after:bg-[var(--brand)]'
                    : 'font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Inline-end action cluster (Cart -> Search -> Phone-Model Selector at physical top-left) */}
        <div className="order-2 flex items-center gap-1.5 sm:gap-2 lg:order-3">
          {/* Cart trigger */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`السلة، فيها ${cartCount} منتجات`}
            className="relative inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[var(--radius-ui)] border border-transparent px-2 text-[var(--ink)] transition-colors hover:bg-[var(--surface-warm)] cursor-pointer"
          >
            <CartBagIcon className="h-5 w-5" />
            <motion.span
              key={cartPulseKey}
              initial={prefersReducedMotion || cartPulseKey === 0 ? false : { scale: 1.32 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={`min-w-[22px] rounded-[6px] px-1.5 text-center text-[12.5px] font-bold tabular-nums leading-[20px] ${
                cartCount > 0
                  ? 'bg-[var(--brand)] text-white border border-[var(--ink)]'
                  : 'bg-[var(--surface-warm)] text-[var(--ink-muted)]'
              }`}
            >
              {cartCount}
            </motion.span>
          </button>

          {/* Search toggle */}
          <button
            type="button"
            onClick={() => {
              if (isSearchOpen && searchQuery) {
                setSearchQuery('');
              }
              setIsSearchOpen((prev) => !prev);
            }}
            aria-expanded={isSearchOpen}
            aria-label={isSearchOpen ? 'إغلاق البحث' : 'ابحث في الجرابات'}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-ui)] transition-colors cursor-pointer ${
              isSearchOpen || searchQuery
                ? 'bg-[var(--surface)] border border-[var(--ink)] text-[var(--ink)]'
                : 'text-[var(--ink)] hover:bg-[var(--surface-warm)]'
            }`}
          >
            {isSearchOpen ? <CloseIcon className="h-5 w-5" /> : <SearchIcon className="h-5 w-5" />}
          </button>

          {/* Flagship Phone-Model Selector Pill at physical top-left (inline-end) */}
          <div className="relative">
            <button
              type="button"
              data-model-selector-trigger="true"
              aria-expanded={isModelSelectorOpen}
              aria-haspopup="dialog"
              onClick={() => setIsModelSelectorOpen((prev) => !prev)}
              className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-full border-[1.5px] px-3 sm:px-3.5 text-[13.5px] sm:text-[14px] transition-all duration-150 cursor-pointer ${
                hasSelectedModel
                  ? 'border-[var(--cobalt)] bg-[var(--surface)] text-[var(--ink)] shadow-[-2px_2px_0_#1746B8]'
                  : isPendingModel
                    ? 'border-[var(--ink)] bg-[var(--sun-soft)] text-[var(--ink)] shadow-[-2px_2px_0_#14181F]'
                    : 'border-[var(--ink)] bg-[var(--sun)] text-[var(--ink)] shadow-[-2px_2px_0_#14181F] hover:bg-[#f5c02f]'
              }`}
            >
              {hasSelectedModel ? (
                <>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--cobalt)]" aria-hidden="true" />
                  <bdi dir="ltr" className="latin-title max-w-[108px] truncate font-bold sm:max-w-[158px]">
                    {selectedModel.name}
                  </bdi>
                </>
              ) : isPendingModel ? (
                <>
                  <PhoneHardwareIcon className="h-4 w-4 shrink-0 text-[var(--ink)]" />
                  <span className="max-w-[116px] truncate font-bold sm:max-w-[164px]">
                    موديلك قيد التأكيد
                  </span>
                </>
              ) : (
                <>
                  <PhoneHardwareIcon className="h-4 w-4 shrink-0 text-[var(--ink)]" />
                  <span className="font-bold">اختار موبايلك</span>
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

      {/* Expandable inline search bar */}
      {isSearchOpen ? (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-warm)]/65">
          <div className="page-container py-2.5">
            <div className="ms-auto flex max-w-[480px] items-center gap-2.5">
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
                  placeholder="دوّر باسم التصميم أو القسم... مثلاً أنمي، كورة، Zamalek"
                  className="min-h-[44px] w-full rounded-[var(--radius-ui)] border-[1.5px] border-[var(--ink)] bg-[var(--surface)] ps-10 pe-3.5 text-[14.5px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
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
          </div>
        </div>
      ) : null}
    </header>
  );
}

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { CartBagIcon, ChevronDownIcon, CloseIcon, SearchIcon } from '../icons/Icons';
import { FirstVisitPopover } from './FirstVisitPopover';
import { ModelSelector } from './ModelSelector';

const PRIMARY_NAV_ITEMS = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/categories', label: 'الأقسام', end: false },
  { to: '/customize', label: 'صمّم جرابك', end: true },
  { to: '/how-it-works', label: 'إزاي تطلب', end: true },
];

/**
 * Sticky plaster header:
 * - Inline-start (right): placeholder store logo
 * - Primary nav: 4 text links (inline on desktop, clean second row on mobile, 44px touch targets)
 * - Inline-end (physical left): cart with count badge, search, and at the very
 *   physical top-left corner, the phone-model selector.
 */
export function Header() {
  const {
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

  const modelTriggerLabel = (() => {
    if (phoneSelection.status === 'selected' && selectedModel) {
      return (
        <bdi dir="ltr" className="max-w-[118px] truncate font-semibold text-[var(--charcoal)] sm:max-w-[168px]">
          {selectedModel.name}
        </bdi>
      );
    }
    if (phoneSelection.status === 'pending') {
      return (
        <span className="max-w-[124px] truncate font-semibold text-[var(--charcoal)] sm:max-w-[176px]">
          موديلك قيد التأكيد
        </span>
      );
    }
    return <span className="font-semibold text-[var(--klein)]">اختار موبايلك</span>;
  })();

  return (
    <header className="sticky top-0 z-30 bg-[var(--plaster)]">
      <div className="page-container flex flex-wrap items-center justify-between gap-x-4 gap-y-0 pt-1.5 pb-1 lg:min-h-[var(--header-height)] lg:flex-nowrap lg:py-0">
        {/* Inline-start (physical right): Brand logo */}
        <Link
          to="/"
          onClick={() => setSearchQuery('')}
          className="order-1 inline-flex min-h-[44px] items-center text-[26px] font-bold leading-none text-[var(--charcoal)]"
        >
          {STORE_CONFIG.name}
        </Link>

        {/* Primary navigation: DOM order sits right after logo for strict RTL Tab order */}
        <nav
          aria-label="التنقل الرئيسي"
          className="order-3 flex w-full items-center justify-start gap-4 overflow-x-auto no-scrollbar pb-1 sm:gap-7 lg:order-2 lg:w-auto lg:overflow-visible lg:pb-0 lg:ms-8 lg:me-auto"
        >
          {PRIMARY_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `inline-flex min-h-[44px] shrink-0 items-center rounded-[4px] px-1 text-[15px] transition-colors duration-150 sm:text-[16px] ${isActive
                  ? 'font-semibold text-[var(--charcoal)] underline decoration-[var(--klein)] decoration-2 underline-offset-[8px]'
                  : 'font-medium text-[var(--graphite)] hover:text-[var(--charcoal)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Inline-end group (flows toward physical left: Cart -> Search -> Model Selector at far left) */}
        <div className="order-2 flex items-center gap-0.5 sm:gap-2 lg:order-3">
          {/* Cart trigger */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`السلة، فيها ${cartCount} منتجات`}
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-[4px] px-2 text-[var(--charcoal)] hover:text-[var(--klein)] cursor-pointer"
          >
            <CartBagIcon className="w-5 h-5" />
            <motion.span
              key={cartPulseKey}
              initial={prefersReducedMotion || cartPulseKey === 0 ? false : { scale: 1.35 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`min-w-[20px] rounded-[4px] px-1 text-center text-[13px] font-semibold tabular-nums leading-[20px] ${cartCount > 0
                ? 'bg-[var(--klein)] text-[var(--gallery-white)]'
                : 'text-[var(--graphite)]'
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
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[4px] text-[var(--charcoal)] hover:text-[var(--klein)] cursor-pointer ${isSearchOpen || searchQuery ? 'is-selected' : ''
              }`}
          >
            {isSearchOpen ? <CloseIcon className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
          </button>

          {/* Phone-model selector at the very top-left (physical left / inline-end) */}
          <div className="relative">
            <button
              type="button"
              data-model-selector-trigger="true"
              aria-expanded={isModelSelectorOpen}
              aria-haspopup="dialog"
              onClick={() => setIsModelSelectorOpen((prev) => !prev)}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-[4px] px-2 text-[14px] cursor-pointer sm:px-3 sm:text-[15px] ${isModelSelectorOpen ? 'is-selected bg-[var(--gallery-white)]' : ''
                }`}
            >
              {modelTriggerLabel}
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${phoneSelection.status === 'none' ? 'text-[var(--klein)]' : 'text-[var(--charcoal)]'
                  } ${isModelSelectorOpen ? 'rotate-180' : ''}`}
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

      {/* Expandable clean gallery-white search bar directly under header */}
      {isSearchOpen ? (
        <div className="page-container pb-3 pt-1">
          <div className="ms-auto flex max-w-[460px] items-center gap-2">
            <label htmlFor="global-store-search" className="sr-only">
              ابحث باسم التصميم أو القسم
            </label>
            <input
              ref={searchRef}
              id="global-store-search"
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ابحث باسم التصميم أو القسم... مثلاً أنمي، كورة، Cairo"
              className="min-h-[44px] w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] px-3.5 text-[15px] text-[var(--charcoal)] placeholder:text-[var(--graphite)]"
            />
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
      ) : null}
    </header>
  );
}

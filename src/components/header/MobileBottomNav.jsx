import { motion, useReducedMotion } from 'motion/react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  CartBagIcon,
  CategoriesGridIcon,
  CustomizeSparkIcon,
  HomeNavIcon,
  PhoneHardwareIcon,
} from '../icons/Icons';

/**
 * Thumb-Zone Mobile Bottom Navigation Dock (`< 1024px`).
 * - Ordered RTL Right -> Left for natural right-handed Egyptian mobile ergonomics:
 *   1. الرئيسية (Home)
 *   2. الأقسام (Categories)
 *   3. صمم جرابك (Customize — signature Logo Gold accented studio action)
 *   4. موبايلك (Opens Phone-Model Selector bottom sheet directly from thumb zone)
 *   5. السلة (Opens Cart Drawer with live crimson item count badge)
 * - Compacts into a single-row inline bar in phone landscape (`max-height: 500px`).
 * - Steps out of the way cleanly when the virtual on-screen keyboard opens.
 */
export function MobileBottomNav({ isKeyboardOpen = false }) {
  const {
    phoneSelection,
    selectedModel,
    isModelSelectorOpen,
    setIsModelSelectorOpen,
    isCartOpen,
    setIsCartOpen,
    cartCount,
    cartPulseKey,
    setSearchQuery,
  } = useStore();

  const prefersReducedMotion = useReducedMotion();
  const { pathname } = useLocation();

  const isCategoriesActive =
    pathname === '/categories' ||
    pathname.startsWith('/categories/') ||
    pathname.startsWith('/products/');

  const hasSelectedModel = phoneSelection.status === 'selected' && Boolean(selectedModel);
  const isPendingModel = phoneSelection.status === 'pending';

  const displayCount = cartCount > 99 ? '99+' : String(cartCount);

  return (
    <nav
      aria-label="التنقل السريع للموبايل"
      aria-hidden={isKeyboardOpen || undefined}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingInlineStart: 'env(safe-area-inset-right, 0px)',
        paddingInlineEnd: 'env(safe-area-inset-left, 0px)',
      }}
      className={`brand-dark-bar fixed inset-x-0 bottom-0 z-30 border-t border-white/14 bg-[var(--brand-black)] text-white transition-transform duration-150 motion-reduce:transition-none lg:hidden ${
        isKeyboardOpen ? 'pointer-events-none invisible translate-y-full' : 'visible translate-y-0'
      }`}
    >
      <div className="mx-auto grid max-w-[680px] grid-cols-5 items-stretch px-1">
        {/* 1. الرئيسية (Far Right — primary right-thumb rest) */}
        <NavLink
          to="/"
          end
          tabIndex={isKeyboardOpen ? -1 : 0}
          onClick={() => setSearchQuery('')}
          className={({ isActive }) =>
            `relative flex min-h-[58px] max-[1023px]:[@media(max-height:500px)]:min-h-[46px] max-[1023px]:[@media(max-height:500px)]:flex-row max-[1023px]:[@media(max-height:500px)]:gap-1.5 flex-col items-center justify-center gap-1 px-1 text-center transition-colors focus-visible:!-outline-offset-2 ${
              isActive ? 'text-[var(--brand-yellow)] font-bold' : 'text-white/75 hover:text-white font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 top-0 h-[2.5px] rounded-b-full bg-[var(--brand-yellow)]"
                />
              ) : null}
              <HomeNavIcon className="h-5 w-5 shrink-0" />
              <span className="max-w-full truncate text-[11px] leading-tight sm:text-[12px]">
                الرئيسية
              </span>
            </>
          )}
        </NavLink>

        {/* 2. الأقسام */}
        <NavLink
          to="/categories"
          tabIndex={isKeyboardOpen ? -1 : 0}
          className={() =>
            `relative flex min-h-[58px] max-[1023px]:[@media(max-height:500px)]:min-h-[46px] max-[1023px]:[@media(max-height:500px)]:flex-row max-[1023px]:[@media(max-height:500px)]:gap-1.5 flex-col items-center justify-center gap-1 px-1 text-center transition-colors focus-visible:!-outline-offset-2 ${
              isCategoriesActive
                ? 'text-[var(--brand-yellow)] font-bold'
                : 'text-white/75 hover:text-white font-medium'
            }`
          }
        >
          {isCategoriesActive ? (
            <span
              aria-hidden="true"
              className="absolute inset-x-3 top-0 h-[2.5px] rounded-b-full bg-[var(--brand-yellow)]"
            />
          ) : null}
          <CategoriesGridIcon className="h-5 w-5 shrink-0" />
          <span className="max-w-full truncate text-[11px] leading-tight sm:text-[12px]">
            الأقسام
          </span>
        </NavLink>

        {/* 3. صمم جرابك (Center Studio Action) */}
        <NavLink
          to="/customize"
          end
          tabIndex={isKeyboardOpen ? -1 : 0}
          className={({ isActive }) =>
            `relative flex min-h-[58px] max-[1023px]:[@media(max-height:500px)]:min-h-[46px] max-[1023px]:[@media(max-height:500px)]:flex-row max-[1023px]:[@media(max-height:500px)]:gap-1.5 flex-col items-center justify-center gap-1 px-1 text-center transition-colors focus-visible:!-outline-offset-2 ${
              isActive ? 'text-[var(--brand-yellow)] font-bold' : 'text-white hover:text-[var(--brand-yellow)] font-semibold'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`inline-flex h-7 w-9 max-[1023px]:[@media(max-height:500px)]:h-6 max-[1023px]:[@media(max-height:500px)]:w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-[var(--brand-yellow)] text-[var(--ink)]'
                    : 'bg-white/12 text-[var(--brand-yellow)] border border-[var(--brand-yellow)]/40'
                }`}
              >
                <CustomizeSparkIcon className="h-4 w-4" />
              </span>
              <span className="max-w-full truncate text-[11px] leading-tight sm:text-[12px]">
                صمم جرابك
              </span>
            </>
          )}
        </NavLink>

        {/* 4. موبايلك (Thumb-reachable Phone-Model Selector sheet trigger) */}
        <button
          type="button"
          data-model-selector-trigger="true"
          tabIndex={isKeyboardOpen ? -1 : 0}
          aria-expanded={isModelSelectorOpen}
          aria-haspopup="dialog"
          aria-label={
            hasSelectedModel
              ? `موبايلك الحالي ${selectedModel.name}، اضغط لتغييره`
              : isPendingModel
                ? 'موديلك قيد التأكيد، اضغط لتغييره'
                : 'اختار موديل موبايلك'
          }
          onClick={() => setIsModelSelectorOpen((prev) => !prev)}
          className={`relative flex min-h-[58px] max-[1023px]:[@media(max-height:500px)]:min-h-[46px] max-[1023px]:[@media(max-height:500px)]:flex-row max-[1023px]:[@media(max-height:500px)]:gap-1.5 flex-col items-center justify-center gap-1 px-1 text-center transition-colors cursor-pointer focus-visible:!-outline-offset-2 ${
            isModelSelectorOpen
              ? 'text-[var(--brand-yellow)] font-bold'
              : hasSelectedModel || isPendingModel
                ? 'text-white font-semibold'
                : 'text-white/80 hover:text-white font-medium'
          }`}
        >
          <span className="relative inline-flex">
            <PhoneHardwareIcon className="h-5 w-5 shrink-0" />
            <span
              aria-hidden="true"
              className={`absolute -top-0.5 -end-1 h-2 w-2 rounded-full ring-2 ring-[var(--brand-black)] ${
                hasSelectedModel
                  ? 'bg-[#22C55E]'
                  : 'bg-[var(--brand-yellow)]'
              }`}
            />
          </span>
          <span className="max-w-full truncate text-[11px] leading-tight sm:text-[12px]">
            {hasSelectedModel ? (
              <bdi dir="ltr" className="latin-title">
                {selectedModel.brand}
              </bdi>
            ) : isPendingModel ? (
              'قيد التأكيد'
            ) : (
              'موبايلك'
            )}
          </span>
        </button>

        {/* 5. السلة (Cart Drawer trigger with live crimson count badge) */}
        <button
          type="button"
          tabIndex={isKeyboardOpen ? -1 : 0}
          aria-expanded={isCartOpen}
          aria-haspopup="dialog"
          aria-label={`السلة، فيها ${cartCount} منتجات`}
          onClick={() => setIsCartOpen(true)}
          className={`relative flex min-h-[58px] max-[1023px]:[@media(max-height:500px)]:min-h-[46px] max-[1023px]:[@media(max-height:500px)]:flex-row max-[1023px]:[@media(max-height:500px)]:gap-1.5 flex-col items-center justify-center gap-1 px-1 text-center transition-colors cursor-pointer focus-visible:!-outline-offset-2 ${
            isCartOpen
              ? 'text-[var(--brand-yellow)] font-bold'
              : 'text-white/80 hover:text-white font-medium'
          }`}
        >
          <span className="relative inline-flex">
            <CartBagIcon className="h-5 w-5 shrink-0" />
            <motion.span
              key={cartPulseKey}
              initial={prefersReducedMotion || cartPulseKey === 0 ? false : { scale: 1.35 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={`-top-1.5 -start-2.5 absolute inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] font-extrabold leading-[16px] tabular-nums ${
                cartCount > 0
                  ? 'bg-[var(--brand)] text-white ring-2 ring-[var(--brand-black)]'
                  : 'bg-white/20 text-white/85'
              }`}
            >
              {displayCount}
            </motion.span>
          </span>
          <span className="max-w-full truncate text-[11px] leading-tight sm:text-[12px]">
            السلة
          </span>
        </button>
      </div>
    </nav>
  );
}

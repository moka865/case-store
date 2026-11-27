import { useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';
import { CartDrawer } from '../components/cart/CartDrawer';
import { Header } from '../components/header/Header';
import { MobileBottomNav } from '../components/header/MobileBottomNav';
import { Footer } from '../components/home/Footer';
import { QuickAddPhoneModal } from '../components/product/QuickAddPhoneModal';
import { STORE_CONFIG } from '../config/store';
import { useStore } from '../context/StoreContext';
import { useMobileViewportState } from '../hooks/useMobileViewportState';
import { storeService } from '../services/storeService';

const EASE = [0.22, 1, 0.36, 1];

function getRouteGroup(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/categories' || pathname.startsWith('/categories/')) return 'categories';
  if (pathname.startsWith('/products/')) return `product:${pathname}`;
  if (pathname === '/customize') return 'customize';
  if (pathname === '/how-it-works') return 'how-it-works';
  if (pathname === '/checkout') return 'checkout';
  if (pathname === '/terms') return 'terms';
  return 'not-found';
}

function getDocumentTitle(pathname) {
  const brand = STORE_CONFIG.name;
  if (pathname === '/') return brand;
  if (pathname === '/categories') return `الأقسام — ${brand}`;
  if (pathname.startsWith('/categories/')) {
    const slug = pathname.slice('/categories/'.length);
    const category = storeService.getCategories().find((c) => c.slug === slug);
    return category ? `جرابات ${category.nameAr} — ${brand}` : `الأقسام — ${brand}`;
  }
  if (pathname.startsWith('/products/')) {
    const slug = pathname.slice('/products/'.length);
    const product = storeService.getProductBySlug(slug);
    return product ? `جراب ${product.name} — ${brand}` : `تفاصيل الجراب — ${brand}`;
  }
  if (pathname === '/customize') return `صمم جرابك بنفسك — ${brand}`;
  if (pathname === '/how-it-works') return `إزاي تطلب والشحن — ${brand}`;
  if (pathname === '/checkout') return `تأكيد الطلب — ${brand}`;
  if (pathname === '/terms') return `الشروط والأحكام — ${brand}`;
  return `الصفحة مش موجودة — ${brand}`;
}

/**
 * Shared application shell holding Header, mobile COD strip, routed page content,
 * Footer, MobileBottomNav, CartDrawer, and QuickAddPhoneModal.
 */
export function MainLayout() {
  const { pathname } = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { governorates, setIsModelSelectorOpen } = useStore();
  const { isKeyboardOpen } = useMobileViewportState();

  const prevGroupRef = useRef(getRouteGroup(pathname));
  const isFirstMountRef = useRef(true);

  const routeGroup = getRouteGroup(pathname);

  const cairoFee = useMemo(() => {
    const cairo = governorates.find((g) => g.id === 'cairo');
    return cairo?.shippingFee ?? 50;
  }, [governorates]);

  useEffect(() => {
    document.title = getDocumentTitle(pathname);
    setIsModelSelectorOpen(false);

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevGroupRef.current = routeGroup;
      return;
    }

    const groupChanged = prevGroupRef.current !== routeGroup;
    prevGroupRef.current = routeGroup;

    if (groupChanged) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      requestAnimationFrame(() => {
        const heading = document.querySelector('main h1');
        if (heading instanceof HTMLElement) {
          heading.focus({ preventScroll: true });
        }
      });
    }
  }, [pathname, routeGroup, setIsModelSelectorOpen]);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--paper)] pb-[var(--mobile-bottom-nav-h)] text-[var(--ink)]">
      <Header />

      {/* Non-sticky mobile COD & shipping strip — visible at page top without eating scroll height */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--ink)] lg:hidden">
        <div className="page-container flex min-h-[30px] items-center justify-between gap-3 py-1 text-[11.5px] sm:text-[12.5px]">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            <span className="shrink-0 font-bold">{STORE_CONFIG.paymentLabelAr}</span>
            <span className="text-[var(--ink-muted)]/60" aria-hidden="true">·</span>
            <span className="truncate text-[var(--ink-muted)]">
              شحن القاهرة والجيزة {cairoFee} {STORE_CONFIG.currencyLabel}
            </span>
          </div>
          <span className="hidden shrink-0 text-[var(--ink-muted)] sm:inline">
            طباعة خلال {STORE_CONFIG.productionDays} أيام عمل
          </span>
        </div>
      </div>

      <motion.main
        key={routeGroup}
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: EASE }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>

      <Footer />
      <MobileBottomNav isKeyboardOpen={isKeyboardOpen} />
      <CartDrawer />
      <QuickAddPhoneModal />
    </div>
  );
}

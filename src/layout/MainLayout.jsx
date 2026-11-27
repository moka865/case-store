import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';
import { CartDrawer } from '../components/cart/CartDrawer';
import { Header } from '../components/header/Header';
import { Footer } from '../components/home/Footer';
import { QuickAddPhoneModal } from '../components/product/QuickAddPhoneModal';
import { STORE_CONFIG } from '../config/store';
import { storeService } from '../services/storeService';

const EASE = [0.22, 1, 0.36, 1];

function getRouteGroup(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/categories' || pathname.startsWith('/categories/')) return 'categories';
  if (pathname.startsWith('/products/')) return `product:${pathname}`;
  if (pathname === '/customize') return 'customize';
  if (pathname === '/how-it-works') return 'how-it-works';
  if (pathname === '/checkout') return 'checkout';
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
  return `الصفحة مش موجودة — ${brand}`;
}

/**
 * Shared application shell holding Header, routed page content, Footer, and CartDrawer.
 */
export function MainLayout() {
  const { pathname } = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const prevGroupRef = useRef(getRouteGroup(pathname));
  const isFirstMountRef = useRef(true);

  const routeGroup = getRouteGroup(pathname);

  useEffect(() => {
    document.title = getDocumentTitle(pathname);

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
  }, [pathname, routeGroup]);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--paper)] text-[var(--ink)]">
      <Header />
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
      <CartDrawer />
      <QuickAddPhoneModal />
    </div>
  );
}

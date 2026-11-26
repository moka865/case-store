import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';
import { CartDrawer } from '../components/cart/CartDrawer';
import { Header } from '../components/header/Header';
import { Footer } from '../components/home/Footer';
import { STORE_CONFIG } from '../config/store';
import { storeService } from '../services/storeService';

const EASE = [0.22, 1, 0.36, 1];

function getRouteGroup(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/categories' || pathname.startsWith('/categories/')) return 'categories';
  if (pathname === '/customize') return 'customize';
  if (pathname === '/how-it-works') return 'how-it-works';
  if (pathname === '/checkout') return 'checkout';
  return 'not-found';
}

function getDocumentTitle(pathname) {
  const brand = STORE_CONFIG.name;
  if (pathname === '/') return `${brand} — جرابات مطبوعة على مزاجك`;
  if (pathname === '/categories') return `الأقسام — ${brand}`;
  if (pathname.startsWith('/categories/')) {
    const slug = pathname.slice('/categories/'.length);
    const category = storeService.getCategories().find((c) => c.slug === slug);
    return category ? `${category.nameAr} — ${brand}` : `الأقسام — ${brand}`;
  }
  if (pathname === '/customize') return `صمّم جرابك بنفسك — ${brand}`;
  if (pathname === '/how-it-works') return `إزاي تطلب — ${brand}`;
  if (pathname === '/checkout') return `تأكيد الطلب — ${brand}`;
  return `الصفحة مش موجودة — ${brand}`;
}

/**
 * Shared application shell holding Header, routed page content, Footer, and CartDrawer.
 * Handles per-page document.title, scroll-to-top, and accessible H1 focus on navigation.
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

    // On switching between top-level pages, jump to top and move focus to the new page <h1>.
    // Within /categories <-> /categories/:slug, keep smooth in-place layout reflow.
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
    <div className="flex flex-col bg-[var(--plaster)] text-[var(--charcoal)]">
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
    </div>
  );
}

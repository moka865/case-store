import { Suspense, lazy } from 'react';
import { MotionConfig } from 'motion/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { BrandLogo } from './components/brand/BrandLogo';
import { StoreProvider } from './context/StoreContext';
import { MainLayout } from './layout/MainLayout';
import { HomePage } from './pages/HomePage';

const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const CustomizePage = lazy(() =>
  import('./pages/CustomizePage').then((m) => ({ default: m.CustomizePage }))
);
const HowItWorksPage = lazy(() =>
  import('./pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const TermsPage = lazy(() =>
  import('./pages/TermsPage').then((m) => ({ default: m.TermsPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <BrandLogo size="sm" onLightSurface />
      <span className="type-caption">جاري التحميل...</span>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/categories"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <CategoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="/categories/:slug"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <CategoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="/products/:slug"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <ProductDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/customize"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <CustomizePage />
                  </Suspense>
                }
              />
              <Route
                path="/how-it-works"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <HowItWorksPage />
                  </Suspense>
                }
              />
              <Route
                path="/checkout"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <CheckoutPage />
                  </Suspense>
                }
              />
              <Route
                path="/terms"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <TermsPage />
                  </Suspense>
                }
              />
              <Route
                path="*"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <NotFoundPage />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </MotionConfig>
  );
}

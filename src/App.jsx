import { Suspense, lazy } from 'react';
import { MotionConfig } from 'motion/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

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
                  <Suspense fallback={<div className="min-h-[60vh]" />}>
                    <CategoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="/categories/:slug"
                element={
                  <Suspense fallback={<div className="min-h-[60vh]" />}>
                    <CategoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="/products/:slug"
                element={
                  <Suspense fallback={<div className="min-h-[60vh]" />}>
                    <ProductDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/customize"
                element={
                  <Suspense fallback={<div className="min-h-[60vh]" />}>
                    <CustomizePage />
                  </Suspense>
                }
              />
              <Route
                path="/how-it-works"
                element={
                  <Suspense fallback={<div className="min-h-[60vh]" />}>
                    <HowItWorksPage />
                  </Suspense>
                }
              />
              <Route
                path="/checkout"
                element={
                  <Suspense fallback={<div className="min-h-[60vh]" />}>
                    <CheckoutPage />
                  </Suspense>
                }
              />
              <Route
                path="*"
                element={
                  <Suspense fallback={<div className="min-h-[40vh]" />}>
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

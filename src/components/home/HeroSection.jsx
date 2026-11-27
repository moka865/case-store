import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../../config/store';
import { useStore } from '../../context/StoreContext';
import { CashCodIcon, ForwardArrowRtlIcon, PhoneHardwareIcon } from '../icons/Icons';
import { CaseArtwork } from '../mockup/CaseArtworks';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';
import { getProductStageTheme } from '../mockup/productPresentation';

const EASE = [0.22, 1, 0.36, 1];
const CROSSFADE_INTERVAL_MS = 4200;

/**
 * Signature Cairo Print-Press Hero:
 * - Asymmetric 12-col composition sized so the catalog heading & filter ribbon sit above the 1440x900 fold
 * - Uses real `heroProducts` rendered inside `PhoneCaseMockup` so hardware & camera cutouts adapt live
 *   to the shopper's selected phone model with zero megabytes of raster bloat
 * - One signature motion moment: 3D entrance settle + pointer tilt (±5°) + smooth print cross-fade
 */
export function HeroSection() {
  const {
    heroProducts,
    allPhoneModels,
    selectedModel,
    visualPreviewModel,
    phoneSelection,
    setIsModelSelectorOpen,
  } = useStore();
  const prefersReducedMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(
    () => (typeof document === 'undefined' ? true : document.visibilityState === 'visible')
  );
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const stageRef = useRef(null);

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 150, damping: 22, mass: 0.6 });
  const rotateY = useSpring(rawRotateY, { stiffness: 150, damping: 22, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const sync = () => setIsTouchDevice(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (!isTabVisible || heroProducts.length <= 1 || prefersReducedMotion) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % heroProducts.length);
    }, CROSSFADE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [isTabVisible, heroProducts.length, activeIndex, prefersReducedMotion]);

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || isTouchDevice || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawRotateY.set(nx * 10); // max ±5 deg
    rawRotateX.set(-ny * 10); // max ±5 deg
  };

  const handlePointerLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  const currentProduct = heroProducts[activeIndex] || heroProducts[0];
  const stageTheme = getProductStageTheme(currentProduct?.artworkId);

  return (
    <section className="pt-4 pb-[var(--section-pad-y)] sm:pt-6 lg:pt-7">
      <div className="page-container">
        <div className="grid grid-cols-1 items-center gap-y-7 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
          {/* START COLUMN (Cols 1-6): Editorial Cairo Display Headline + Conversion Actions */}
          <div className="text-start lg:col-span-6 xl:col-span-6">
            {/* Live phone-fit interactive stamp */}
            <div className="mb-4">
              {selectedModel ? (
                <button
                  type="button"
                  onClick={() => setIsModelSelectorOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--cobalt)]/35 bg-[var(--cobalt-tint)] px-3.5 py-1.5 text-[13px] font-bold text-[var(--cobalt)] hover:border-[var(--cobalt)] cursor-pointer"
                >
                  <span className="h-2 w-2 rounded-full bg-[var(--cobalt)]" aria-hidden="true" />
                  <span>
                    جاهز لمقاس{' '}
                    <bdi dir="ltr" className="latin-title">
                      {selectedModel.name}
                    </bdi>
                  </span>
                  <span className="text-[var(--ink)] underline underline-offset-4">غيّر</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModelSelectorOpen(true)}
                  className="stamp-sun hover:bg-[#f5c02f] transition-colors cursor-pointer"
                >
                  <PhoneHardwareIcon className="h-3.5 w-3.5" />
                  <span>متاح لـ {allPhoneModels.length} موديل موبايل — اختار موبايلك</span>
                </button>
              )}
            </div>

            <h1 tabIndex={-1} className="type-display text-[var(--ink)] outline-none">
              <span className="block">جراب يليق بمزاجك،</span>
              <span className="mt-1 sm:mt-1.5 block text-[var(--brand)]">مطبوع لموبايلك بالملّي.</span>
            </h1>

            <p className="type-body mt-4 max-w-[46ch] text-[var(--ink-muted)]">
              نقّي من طبعات غلاف الجاهزة أو ارفع صورتك واكتب اسمك. طباعة مطفية تقيلة ما بتبصمش، وتدفع كاش لما تستلم.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <Link to="/categories" className="btn-primary">
                <span>شوف التصميمات</span>
                <ForwardArrowRtlIcon className="h-4 w-4" />
              </Link>
              <Link to="/customize" className="btn-outline">
                ارفع صورتك أو اسمك
              </Link>
            </div>

            {/* Honest Price & COD Fact Strip */}
            <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-[var(--border-subtle)] pt-4 max-w-[520px]">
              <div>
                <dt className="type-caption text-[12px]">التصميمات الجاهزة</dt>
                <dd className="mt-0.5 text-[15px] sm:text-[16px] font-bold tabular-nums text-[var(--ink)]">
                  من 260 {STORE_CONFIG.currencyLabel}
                </dd>
              </div>
              <div className="border-s border-[var(--border-subtle)] ps-3">
                <dt className="type-caption text-[12px]">مخصوص بصورتك</dt>
                <dd className="mt-0.5 text-[15px] sm:text-[16px] font-bold tabular-nums text-[var(--ink)]">
                  {STORE_CONFIG.customCasePrice} {STORE_CONFIG.currencyLabel}
                </dd>
              </div>
              <div className="border-s border-[var(--border-subtle)] ps-3">
                <dt className="type-caption text-[12px]">طريقة الدفع</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1 text-[14px] sm:text-[15px] font-bold text-[var(--jade)]">
                  <CashCodIcon className="hidden sm:inline h-4 w-4 shrink-0" />
                  <span>عند الاستلام</span>
                </dd>
              </div>
            </dl>
          </div>

          {/* END COLUMN (Cols 7-12): Signature Print-Bed Showcase */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div
              ref={stageRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              style={{ backgroundColor: stageTheme.bg }}
              className="relative overflow-hidden rounded-[18px] border-[1.5px] border-[var(--ink)] p-4 sm:p-5 lg:p-6 transition-colors duration-500 shadow-[-5px_5px_0_#14181F]"
            >
              {/* Print-press corner registration marks (+) */}
              <span aria-hidden="true" className="pointer-events-none absolute top-2.5 start-3 text-[12px] font-mono text-[var(--ink)]/35 select-none">+</span>
              <span aria-hidden="true" className="pointer-events-none absolute top-2.5 end-3 text-[12px] font-mono text-[var(--ink)]/35 select-none">+</span>

              {/* Top stage header: live hardware fit + model switcher */}
              <div className="relative z-20 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/85 border border-[var(--ink)]/12 px-3 py-1 text-[12.5px] font-semibold text-[var(--ink)]">
                  <span className="text-[var(--ink-muted)]">القالب:</span>
                  <bdi dir="ltr" className="latin-title font-bold">
                    {phoneSelection.status === 'pending' && phoneSelection.pendingPhoneName
                      ? phoneSelection.pendingPhoneName
                      : visualPreviewModel.name}
                  </bdi>
                  <button
                    type="button"
                    onClick={() => setIsModelSelectorOpen(true)}
                    className="ms-1 font-bold text-[var(--cobalt)] underline underline-offset-2 cursor-pointer"
                  >
                    غيّر
                  </button>
                </div>

                <span
                  dir="ltr"
                  className="latin-title rounded-[6px] bg-[var(--ink)] px-2 py-0.5 text-[11.5px] font-bold text-[var(--paper)] tabular-nums"
                >
                  0{activeIndex + 1} / 0{heroProducts.length}
                </span>
              </div>

              {/* Center Stage: 3D Tilting Case + Edition Switcher Rail */}
              <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
                {/* Case showcase (cols 1-7 on sm+) */}
                <div
                  className="flex flex-col items-center justify-center py-1 sm:col-span-7"
                  style={{ perspective: '1100px' }}
                >
                  <motion.div
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, rotateY: -10, rotateX: 5, rotateZ: -2, y: 14 }
                    }
                    animate={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 1, rotateY: 0, rotateX: 0, rotateZ: 0, y: 0 }
                    }
                    transition={{ duration: 0.65, ease: EASE }}
                    className="w-[164px] sm:w-[184px] lg:w-[196px] xl:w-[216px]"
                  >
                    {/* Non-rotating shadow wrapper keeps studio overhead light constant */}
                    <div className="case-wall-shadow-hero" style={{ perspective: '1100px' }}>
                      <motion.div
                        style={
                          prefersReducedMotion || isTouchDevice
                            ? undefined
                            : {
                                rotateX,
                                rotateY,
                                transformStyle: 'preserve-3d',
                                willChange: 'transform',
                              }
                        }
                        animate={
                          !prefersReducedMotion && isTouchDevice && isTabVisible
                            ? { y: [0, -6, 0] }
                            : { y: 0 }
                        }
                        transition={
                          !prefersReducedMotion && isTouchDevice && isTabVisible
                            ? { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.3 }
                        }
                      >
                        <Link
                          to={`/products/${currentProduct?.id || ''}`}
                          aria-label={`اعرض تفاصيل جراب ${currentProduct?.name || ''}`}
                          className="block rounded-[28px]"
                        >
                          <PhoneCaseMockup
                            model={visualPreviewModel}
                            interactive={false}
                            shadow={false}
                            artworkNode={
                              <g>
                                {heroProducts.map((prod, idx) => {
                                  const isActive = idx === activeIndex;
                                  return (
                                    <motion.g
                                      key={prod.id}
                                      initial={false}
                                      animate={{ opacity: isActive ? 1 : 0 }}
                                      transition={{
                                        duration: prefersReducedMotion ? 0.15 : 0.55,
                                        ease: EASE,
                                      }}
                                    >
                                      <CaseArtwork artworkId={prod.artworkId} />
                                    </motion.g>
                                  );
                                })}
                              </g>
                            }
                            className="w-full"
                          />
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Edition selector rail (cols 8-12 on sm+) */}
                <div className="flex flex-col justify-between gap-2 sm:col-span-5 text-start">
                  <p className="hidden sm:block text-[12px] font-bold text-[var(--ink-muted)]">
                    طبعات مختارة من المطبعة:
                  </p>

                  <div
                    role="group"
                    aria-label="اختار طبعة العرض"
                    className="grid grid-cols-2 gap-1.5 sm:grid-cols-1"
                  >
                    {heroProducts.map((item, idx) => {
                      const isCurrent = idx === activeIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveIndex(idx)}
                          aria-pressed={isCurrent}
                          className={`flex min-h-[44px] w-full flex-col items-start justify-center gap-0.5 rounded-[var(--radius-ui)] border px-2.5 py-1.5 text-start transition-all duration-150 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-3 cursor-pointer ${
                            isCurrent
                              ? 'border-[var(--ink)] bg-[var(--surface)] text-[var(--ink)] shadow-[-2px_2px_0_#14181F]'
                              : 'border-transparent bg-white/50 text-[var(--ink-muted)] hover:bg-white/80 hover:text-[var(--ink)]'
                          }`}
                        >
                          <span className="latin-title w-full truncate text-[12.5px] sm:w-auto sm:text-[13.5px] font-bold">
                            <bdi dir="ltr">{item.name}</bdi>
                          </span>
                          <span className="shrink-0 text-[11.5px] sm:text-[12px] font-bold tabular-nums text-[var(--ink)]">
                            {item.price} {STORE_CONFIG.currencyLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {currentProduct ? (
                    <Link
                      to={`/products/${currentProduct.id}`}
                      className="mt-1 inline-flex min-h-[40px] items-center justify-between rounded-[var(--radius-ui)] bg-[var(--ink)] px-3.5 text-[13px] font-bold text-[var(--paper)] hover:bg-[var(--brand)] transition-colors"
                    >
                      <span>اطلب الطبعة دي</span>
                      <ForwardArrowRtlIcon className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

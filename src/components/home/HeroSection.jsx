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

const EASE = [0.22, 1, 0.36, 1];
const CROSSFADE_INTERVAL_MS = 4000;

/**
 * Hero section — restores the original `heroCases` PNG cutouts (`Persian Stallions`,
 * `Morning Shift Edition`, `Starry Night`) on the unified fixed `--card-bg` stage,
 * paired with clean, modern `Cairo` display headlines and clear brand CTAs.
 */
export function HeroSection() {
  const {
    heroCases,
    allPhoneModels,
    selectedModel,
    setIsModelSelectorOpen,
  } = useStore();
  const prefersReducedMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(
    () => (typeof document === 'undefined' ? true : document.visibilityState === 'visible')
  );
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const stageRef = useRef(null);

  // Cursor-follow tilt motion values (±6 deg max)
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 140, damping: 20, mass: 0.6 });
  const rotateY = useSpring(rawRotateY, { stiffness: 140, damping: 20, mass: 0.6 });

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
    if (!isTabVisible || heroCases.length <= 1 || prefersReducedMotion) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % heroCases.length);
    }, CROSSFADE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [isTabVisible, heroCases.length, activeIndex, prefersReducedMotion]);

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || isTouchDevice || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawRotateY.set(nx * 12);
    rawRotateX.set(-ny * 12);
  };

  const handlePointerLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  const currentHeroCase = heroCases[activeIndex] || heroCases[0];

  return (
    <section className="pt-4 pb-[var(--section-pad-y)] sm:pt-6 lg:pt-7">
      <div className="page-container">
        <div className="grid grid-cols-1 items-center gap-y-7 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)]">
          {/* START COLUMN (Cols 1-6): Clean Modern Cairo Headline + Primary/Secondary CTAs */}
          <div className="text-start lg:col-span-6">
            <div className="mb-4">
              {selectedModel ? (
                <button
                  type="button"
                  onClick={() => setIsModelSelectorOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] font-bold text-[var(--ink)] hover:border-[var(--ink)] cursor-pointer"
                >
                  <span className="h-2 w-2 rounded-full bg-[var(--jade)]" aria-hidden="true" />
                  <span>
                    جاهز لمقاس{' '}
                    <bdi dir="ltr" className="latin-title">
                      {selectedModel.name}
                    </bdi>
                  </span>
                  <span className="text-[var(--brand)] underline underline-offset-4">غيّر</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModelSelectorOpen(true)}
                  className="badge-brand-yellow hover:bg-[var(--brand-yellow-hover)] transition-colors cursor-pointer"
                >
                  <PhoneHardwareIcon className="h-3.5 w-3.5" />
                  <span>متاح لـ {allPhoneModels.length} موديل موبايل — اختار موبايلك</span>
                </button>
              )}
            </div>

            <h1 tabIndex={-1} className="type-display text-[var(--ink)] outline-none">
              <span className="block">جراب على مزاجك،</span>
              <span className="mt-1 block text-[var(--brand)]">مطبوع لموبايلك بالظبط.</span>
            </h1>

            <p className="type-body mt-4 max-w-[46ch] text-[var(--ink-muted)]">
              اختار من تصميمات غلاف الجاهزة أو ارفع صورتك واكتب اسمك. طباعة مطفية تقيلة ما بتبصمش، وتدفع كاش لما تستلم.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <Link to="/categories" className="btn-primary">
                <span>شوف الجرابات</span>
                <ForwardArrowRtlIcon className="h-4 w-4" />
              </Link>
              <Link to="/customize" className="btn-outline">
                صمّم جرابك
              </Link>
            </div>

            <dl className="mt-7 grid max-w-[520px] grid-cols-3 gap-3 border-t border-[var(--border-subtle)] pt-4">
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

          {/* END COLUMN (Cols 7-12): Unified Fixed `--card-bg` Stage with Original `heroCases` PNGs */}
          <div className="lg:col-span-6">
            <div
              ref={stageRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="product-stage relative overflow-hidden p-5 sm:p-6 lg:p-7"
            >
              <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-12">
                {/* Original transparent PNG phone case showcase */}
                <div
                  className="flex flex-col items-center justify-center sm:col-span-7"
                  style={{ perspective: '1100px' }}
                >
                  <motion.div
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, rotateY: -12, rotateX: 6, rotateZ: -3, y: 16 }
                    }
                    animate={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 1, rotateY: 0, rotateX: 0, rotateZ: 0, y: 0 }
                    }
                    transition={{ duration: 0.7, ease: EASE }}
                    className="w-[184px] sm:w-[208px] lg:w-[216px] xl:w-[234px]"
                  >
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
                            ? { y: [0, -8, 0] }
                            : { y: 0 }
                        }
                        transition={
                          !prefersReducedMotion && isTouchDevice && isTabVisible
                            ? { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.3 }
                        }
                      >
                        <div
                          dir="ltr"
                          role="img"
                          aria-label={currentHeroCase?.altAr || currentHeroCase?.name || ''}
                          className="relative aspect-[720/1426] w-full select-none"
                        >
                          {heroCases.map((item, idx) => {
                            const isActive = idx === activeIndex;
                            return (
                              <motion.img
                                key={item.id}
                                src={item.imageUrl}
                                alt=""
                                aria-hidden="true"
                                draggable={false}
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                fetchPriority={idx === 0 ? 'high' : 'auto'}
                                decoding="async"
                                initial={false}
                                animate={{ opacity: isActive ? 1 : 0 }}
                                transition={
                                  prefersReducedMotion
                                    ? { duration: 0.25, ease: EASE }
                                    : isActive
                                      ? { duration: 0.6, ease: EASE }
                                      : { duration: 0.15, delay: 0.45, ease: EASE }
                                }
                                className={`pointer-events-none absolute inset-0 h-full w-full object-contain select-none ${
                                  isActive ? 'z-20' : 'z-10'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Placard & edition selector on the unified stage */}
                <div className="flex flex-col justify-center gap-3 text-start sm:col-span-5">
                  <p className="type-caption text-[13px]">
                    طباعة مطفية عالية الدقة بمقاس موبايلك وفتحة كاميرته بالظبط.
                  </p>

                  <div
                    role="group"
                    aria-label="معاينة تصميمات العرض"
                    className="flex flex-col gap-1.5"
                  >
                    {heroCases.map((item, idx) => {
                      const isCurrent = idx === activeIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveIndex(idx)}
                          aria-pressed={isCurrent}
                          className={`flex min-h-[42px] w-full items-center gap-2.5 rounded-[var(--radius-ui)] border px-3 py-1.5 text-start transition-colors duration-150 cursor-pointer ${
                            isCurrent
                              ? 'border-[var(--border-strong)] bg-[var(--surface)] font-bold text-[var(--ink)]'
                              : 'border-transparent bg-white/55 font-medium text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`block h-[3px] shrink-0 rounded-full transition-all duration-200 ${
                              isCurrent ? 'w-5 bg-[var(--brand)]' : 'w-3 bg-[var(--ink)]/25'
                            }`}
                          />
                          <span className="latin-title truncate text-[13.5px] sm:text-[14px]">
                            <bdi dir="ltr">{item.name}</bdi>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

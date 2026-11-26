import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

const EASE = [0.22, 1, 0.36, 1];
const CROSSFADE_INTERVAL_MS = 4000;

/**
 * Hero section — the single signature bold moment on the page.
 * - Massive Arabic display headline interacting with / tucking behind the case showcase
 * - Entrance tilt settling to rest (700ms)
 * - Transparent PNG phone cases cross-fading automatically every 4s (600ms), paused when tab is hidden
 * - Cursor-follow tilt max ±6° on pointer devices; slow float on touch devices
 * - Respects prefers-reduced-motion
 */
export function HeroSection() {
  const { heroCases } = useStore();
  const prefersReducedMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(
    () => (typeof document === 'undefined' ? true : document.visibilityState === 'visible')
  );
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const sectionRef = useRef(null);

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

  // Cross-fade through featured hero case PNGs every 4s; pause when tab hidden; reset dwell on manual switch
  useEffect(() => {
    if (!isTabVisible || heroCases.length <= 1) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % heroCases.length);
    }, CROSSFADE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [isTabVisible, heroCases.length, activeIndex]);

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || isTouchDevice || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    rawRotateY.set(nx * 12); // max ±6 deg
    rawRotateX.set(-ny * 12); // max ±6 deg
  };

  const handlePointerLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  const currentHeroCase = heroCases[activeIndex] || heroCases[0];

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative pt-[var(--page-top-pad)] pb-[var(--section-pad-y)] lg:flex lg:min-h-[min(64vh,560px)] lg:max-h-[min(72vh,680px)] lg:items-center"
    >
      <div className="page-container">
        {/*
          Gallery wall hero composition (RTL, 12 cols):
          - Start (cols 1-6): bold Arabic display headline (capped at 72px), 60ch paragraph, primary/secondary actions
          - Center-end (cols 7-9): large transparent PNG phone case cross-fading every 4s
          - Far end (cols 10-12): quiet museum wall placard beside the case on desktop (stacks cleanly below on mobile)
          Fills the full container width cleanly and keeps the next section heading visible above the 1440x900 fold.
        */}
        <div className="grid grid-cols-1 items-center gap-y-8 lg:grid-cols-12 lg:gap-x-[var(--grid-col-gap)] lg:gap-y-0">
          {/* Start side (cols 1-6): display headline, body paragraph (60ch on <p> only), and CTAs */}
          <div className="relative z-10 text-start lg:col-span-6">
            <h1 tabIndex={-1} className="type-display text-[var(--charcoal)] outline-none">
              <span className="block">شكّل موبايلك</span>
              <span className="block">على مزاجك</span>
            </h1>

            <p className="type-body mt-5 max-w-[48ch] text-[var(--graphite)]">
              تصميمات مطبوعة مخصوص لموبايلك، أو ارفع صورتك واكتب اسمك واحنا نطبعها لحد باب البيت.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6">
              <Link to="/categories" className="btn-primary">
                شوف الجرابات
              </Link>
              <Link to="/customize" className="btn-secondary">
                صمم جرابك
              </Link>
            </div>
          </div>

          {/* Center-end (cols 7-9): Hero transparent PNG phone case showcase (nudged +24px on desktop only) */}
          <div
            className="relative z-20 flex flex-col items-center lg:col-span-3 lg:translate-y-6"
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
              className="w-[216px] sm:w-[238px] lg:w-[244px] xl:w-[264px]"
            >
              {/* Non-rotating wall-shadow wrapper so overhead light stays fixed straight down while inner case tilts */}
              <div className="case-wall-shadow-hero" style={{ perspective: '1100px' }}>
                {/* Inner tilt (desktop pointer) or slow float (touch devices) */}
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
                  {/* Transparent PNG phone case showcase — never mirrored in RTL */}
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
                          loading="eager"
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
                          className={`pointer-events-none absolute inset-0 h-full w-full object-contain select-none ${isActive ? 'z-20' : 'z-10'
                            }`}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Mobile-only compact placard directly beneath the case */}
              <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
                <p className="min-w-0 truncate text-[15px] font-medium text-[var(--charcoal)]">
                  <bdi dir="ltr">{currentHeroCase?.name}</bdi>
                </p>
                <div className="flex shrink-0 items-center -me-2" role="group" aria-label="معاينة تصميمات العرض">
                  {heroCases.map((item, idx) => {
                    const isCurrent = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`اعرض تصميم ${item.name}`}
                        aria-pressed={isCurrent}
                        className="flex h-11 w-9 items-center justify-center cursor-pointer"
                      >
                        <span
                          className={`block h-[3px] w-5 rounded-[4px] transition-colors duration-200 ${isCurrent ? 'bg-[var(--klein)]' : 'bg-[var(--charcoal)]/25'
                            }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Far end (cols 10-12, desktop): Quiet museum wall placard directly beside the hero piece */}
          <div className="hidden text-start lg:col-span-3 lg:flex lg:flex-col lg:items-start lg:justify-center lg:gap-4">
            <p className="type-caption max-w-[26ch]">
              طباعة مطفية عالية الدقة بمقاس موبايلك وفتحة كاميرته بالظبط.
            </p>

            <div
              className="flex w-full flex-col gap-1"
              role="group"
              aria-label="معاينة تصميمات العرض"
            >
              {heroCases.map((item, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-pressed={isCurrent}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-[4px] px-1 text-start transition-colors duration-150 cursor-pointer ${isCurrent
                      ? 'text-[var(--charcoal)]'
                      : 'text-[var(--graphite)] hover:text-[var(--charcoal)]'
                      }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`block h-[3px] shrink-0 rounded-[4px] transition-all duration-200 ${isCurrent
                        ? 'w-7 bg-[var(--klein)]'
                        : 'w-4 bg-[var(--charcoal)]/25'
                        }`}
                    />
                    <span
                      className={`truncate text-[16px] leading-[1.35] ${isCurrent ? 'font-semibold' : 'font-medium'
                        }`}
                    >
                      <bdi dir="ltr">{item.name}</bdi>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

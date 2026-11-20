import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { CaseArtwork } from '../mockup/CaseArtworks';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

const EASE = [0.22, 1, 0.36, 1];
const CROSSFADE_INTERVAL_MS = 4000;

/**
 * Hero section — the single signature bold moment on the page.
 * - Massive Arabic display headline interacting with / tucking behind the case mockup
 * - Entrance tilt settling to rest (700ms)
 * - Print cross-fading across 4 featured designs every 4s (600ms), paused when tab is hidden
 * - Cursor-follow tilt max ±6° on pointer devices; slow float on touch devices
 * - Respects prefers-reduced-motion
 */
export function HeroSection() {
  const { heroProducts, visualPreviewModel } = useStore();
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

  // Cross-fade through featured designs every 4s; pause when tab hidden
  useEffect(() => {
    if (!isTabVisible || heroProducts.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroProducts.length);
    }, CROSSFADE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isTabVisible, heroProducts.length]);

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

  const currentHeroProduct = heroProducts[activeIndex] || heroProducts[0];

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative pt-8 pb-16 md:pt-14 md:pb-28"
    >
      <div className="page-container">
        {/*
          Gallery wall hero composition:
          Oversized Arabic display typography acts as a sculptural poster on the wall,
          interacting directly with the large phone case pulled inward into the center-end
          plane (eliminating the generic 50/50 split gap and leaving clean plaster space
          under the top-left model selector popover).
        */}
        <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-0">
          {/* Sculptural display headline on start side */}
          <div className="relative z-10 text-start lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <h1 tabIndex={-1} className="type-display text-[var(--charcoal)] outline-none">
              <span className="block">شكّل موبايلك</span>
              <span className="block lg:ps-24">على مزاجك</span>
            </h1>

            <p className="type-body mt-6 max-w-[34ch] text-[var(--graphite)] lg:mt-8">
              تصميمات مطبوعة مخصوص لموبايلك، أو ارفع صورتك واكتب اسمك واحنا نطبعها لحد باب البيت.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link to="/categories" className="btn-primary">
                شوف الجرابات
              </Link>
              <Link to="/customize" className="btn-secondary">
                صمم جرابك
              </Link>
            </div>
          </div>

          {/* Large Hero Case pulled into center-end (cols 6-10) so headline & case compose tightly and top-left popover stays clear */}
          <div
            className="relative z-20 flex flex-col items-center lg:col-span-4 lg:col-start-7 lg:row-start-1 lg:items-start lg:-ms-10"
            style={{ perspective: '1100px' }}
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotateY: -12, rotateX: 6, rotateZ: -3, y: 18 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, rotateY: 0, rotateX: 0, rotateZ: 0, y: 0 }
              }
              transition={{ duration: 0.7, ease: EASE }}
              className="w-[238px] sm:w-[272px] lg:w-[304px]"
            >
              {/* Inner tilt (desktop pointer) or slow float (touch devices) */}
              <motion.div
                style={
                  prefersReducedMotion || isTouchDevice
                    ? undefined
                    : {
                        rotateX,
                        rotateY,
                        transformStyle: 'preserve-3d',
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
                <PhoneCaseMockup
                  model={visualPreviewModel}
                  className="w-full"
                  ariaLabel={`تصميم ${currentHeroProduct?.name || ''} على جراب ${visualPreviewModel?.name || ''}`}
                  artworkNode={
                    <AnimatePresence mode="sync" initial={false}>
                      <motion.g
                        key={currentHeroProduct.artworkId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                      >
                        <CaseArtwork artworkId={currentHeroProduct.artworkId} />
                      </motion.g>
                    </AnimatePresence>
                  }
                />
              </motion.div>

              {/* Quiet museum wall placard beneath the hero piece */}
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="min-w-0 text-start">
                  <p className="truncate text-[16px] font-medium text-[var(--charcoal)]">
                    <bdi dir="ltr">{currentHeroProduct.name}</bdi>
                  </p>
                  <p className="type-caption">
                    <bdi dir="ltr">{visualPreviewModel.name}</bdi>
                  </p>
                </div>

                {/* Minimal gallery print switcher bars */}
                <div className="flex items-center gap-1.5" role="group" aria-label="معاينة تصميمات العرض">
                  {heroProducts.map((item, idx) => {
                    const isCurrent = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`اعرض تصميم ${item.name}`}
                        aria-pressed={isCurrent}
                        className="flex h-11 w-5 items-center justify-center cursor-pointer"
                      >
                        <span
                          className={`block h-[3px] w-full rounded-[4px] transition-colors duration-200 ${
                            isCurrent ? 'bg-[var(--klein)]' : 'bg-[var(--charcoal)]/25'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isTextEntryElement(el) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    return !['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'].includes(type);
  }
  return el.isContentEditable;
}

/**
 * Tracks mobile virtual keyboard visibility via `visualViewport` + focus state,
 * syncing `data-keyboard-open="true"` on `<html>` so fixed bottom bars step out of
 * the way instantaneously without covering inputs or submit buttons.
 */
export function useMobileViewportState() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let baselineHeight = window.innerHeight;

    const evaluate = () => {
      const isMobileWidth = window.innerWidth < 1024;
      if (!isMobileWidth) {
        setIsKeyboardOpen(false);
        delete document.documentElement.dataset.keyboardOpen;
        return;
      }

      const activeEl = document.activeElement;
      const focusedInput = isTextEntryElement(activeEl);
      const vv = window.visualViewport;
      const currentHeight = vv ? vv.height : window.innerHeight;

      if (!focusedInput && currentHeight > baselineHeight) {
        baselineHeight = currentHeight;
      }

      const heightShrunk = baselineHeight - currentHeight > 130;
      const nextOpen = Boolean(focusedInput && (heightShrunk || window.matchMedia('(pointer: coarse)').matches));

      setIsKeyboardOpen(nextOpen);
      if (nextOpen) {
        document.documentElement.dataset.keyboardOpen = 'true';
      } else {
        delete document.documentElement.dataset.keyboardOpen;
      }
    };

    const onFocusIn = () => {
      window.setTimeout(evaluate, 60);
    };
    const onFocusOut = () => {
      window.setTimeout(evaluate, 80);
    };

    window.addEventListener('focusin', onFocusIn, { passive: true });
    window.addEventListener('focusout', onFocusOut, { passive: true });
    window.addEventListener('resize', evaluate, { passive: true });
    window.visualViewport?.addEventListener('resize', evaluate, { passive: true });

    return () => {
      window.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('resize', evaluate);
      window.visualViewport?.removeEventListener('resize', evaluate);
      delete document.documentElement.dataset.keyboardOpen;
    };
  }, []);

  return { isKeyboardOpen };
}

/**
 * Accessible modal sheet/drawer behavior:
 * - Locks body scroll without layout jump
 * - Focuses `initialFocusRef` (or first focusable element) on open
 * - Traps Tab / Shift+Tab inside `containerRef`
 * - Closes on Escape and restores focus to the trigger element on close
 */
export function useOverlayDialog({ open, onClose, containerRef, initialFocusRef = null }) {
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const rafId = window.requestAnimationFrame(() => {
      if (initialFocusRef?.current instanceof HTMLElement) {
        initialFocusRef.current.focus({ preventScroll: true });
        return;
      }
      const firstFocusable = containerRef?.current?.querySelector(FOCUSABLE_SELECTOR);
      if (firstFocusable instanceof HTMLElement) {
        firstFocusable.focus({ preventScroll: true });
      }
    });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !containerRef?.current) return;

      const nodes = Array.from(
        containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter((el) => el instanceof HTMLElement && el.offsetParent !== null);

      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;

      const prevEl = returnFocusRef.current;
      if (prevEl && document.contains(prevEl)) {
        window.requestAnimationFrame(() => {
          prevEl.focus({ preventScroll: true });
        });
      }
    };
  }, [open, onClose, containerRef, initialFocusRef]);
}

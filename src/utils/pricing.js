import { STORE_CONFIG } from '../config/store';

export const MAX_PRINTED_NAME_LENGTH = 22;

/**
 * True whenever a printedName spec is enabled and has non-empty trimmed text.
 */
export function hasActivePrintedName(printedName) {
  return Boolean(printedName?.enabled && String(printedName?.text || '').trim().length > 0);
}

/**
 * Normalizes a printedName spec into the exact shape expected by PhoneCaseMockup and the order/print pipeline.
 */
export function normalizePrintedNameSpec(printedName) {
  const trimmed = String(printedName?.text || '').trim();
  const active = Boolean(printedName?.enabled && trimmed.length > 0);

  if (!active) {
    return {
      enabled: false,
      text: '',
      script: null,
      fontId: null,
      fontFamily: null,
      fontWeight: null,
      letterSpacing: '0px',
      placement: printedName?.placement || 'bottom',
      ink: printedName?.ink || 'light',
    };
  }

  return {
    enabled: true,
    text: trimmed,
    script: printedName.script || 'arabic',
    fontId: printedName.fontId || null,
    fontFamily: printedName.fontFamily || null,
    fontWeight: printedName.fontWeight || 700,
    letterSpacing: printedName.script === 'arabic' ? '0px' : printedName.letterSpacing || '0px',
    placement: printedName.placement || 'bottom',
    ink: printedName.ink || 'light',
  };
}

/**
 * Computes separated design price, name-printing fee, and totals for a single cart or order item.
 */
export function computeItemPricing(item) {
  const designUnitPrice = Number(item?.price ?? item?.unitPrice ?? 0);
  const hasName = hasActivePrintedName(item?.printSpec?.printedName);
  const rawStoredFee = item?.namePrintFee;
  const unitNameFee = hasName
    ? Number.isFinite(Number(rawStoredFee)) && Number(rawStoredFee) > 0
      ? Number(rawStoredFee)
      : STORE_CONFIG.namePrintFee
    : 0;
  const effectiveUnitPrice = designUnitPrice + unitNameFee;
  const quantity = Math.max(1, Number(item?.quantity) || 1);

  return {
    hasName,
    designUnitPrice,
    unitNameFee,
    effectiveUnitPrice,
    quantity,
    lineDesignTotal: designUnitPrice * quantity,
    lineNameFeeTotal: unitNameFee * quantity,
    lineTotal: effectiveUnitPrice * quantity,
  };
}

/**
 * Aggregates cart design subtotal, name-print fees subtotal, combined subtotal, and item count.
 */
export function computeCartTotals(items = []) {
  let designSubtotal = 0;
  let nameFeesSubtotal = 0;
  let count = 0;

  for (const item of items) {
    const p = computeItemPricing(item);
    designSubtotal += p.lineDesignTotal;
    nameFeesSubtotal += p.lineNameFeeTotal;
    count += p.quantity;
  }

  return {
    count,
    designSubtotal,
    nameFeesSubtotal,
    subtotal: designSubtotal + nameFeesSubtotal,
  };
}

/**
 * Determines whether two printSpec objects represent the exact same line item
 * (same design, same phone model, and same printed name configuration).
 */
export function arePrintSpecsMergeable(specA, specB) {
  if (!specA || !specB) return false;

  const srcA = specA.designSource || {};
  const srcB = specB.designSource || {};

  // Custom uploads/text-only designs stay distinct lines unless identical catalog source
  if (srcA.type !== 'catalog' || srcB.type !== 'catalog') {
    return false;
  }
  if (srcA.productId !== srcB.productId) {
    return false;
  }

  // Phone model identity must match
  if (specA.phoneModelStatus !== specB.phoneModelStatus) {
    return false;
  }
  if (specA.phoneModelStatus === 'pending') {
    const pA = String(specA.phoneModelName || '').trim().toLowerCase();
    const pB = String(specB.phoneModelName || '').trim().toLowerCase();
    if (pA !== pB) return false;
  } else if (specA.phoneModelId !== specB.phoneModelId) {
    return false;
  }

  // Printed name identity must match
  const nameA = normalizePrintedNameSpec(specA.printedName);
  const nameB = normalizePrintedNameSpec(specB.printedName);
  if (nameA.enabled !== nameB.enabled) return false;
  if (nameA.enabled) {
    return (
      nameA.text === nameB.text &&
      nameA.fontId === nameB.fontId &&
      nameA.placement === nameB.placement &&
      nameA.ink === nameB.ink
    );
  }

  return true;
}

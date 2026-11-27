import { STORE_CONFIG } from '../config/store';
import {
  computeTotalDeliveryDays,
  createHandoffEnvelope,
  deriveOrderType,
  generateMissingModelRequestId,
  generateOrderId,
} from '../contracts/handoffSchema';
import { CATEGORIES } from '../data/categories';
import { GOVERNORATES } from '../data/governorates';
import { HERO_CASES } from '../data/heroCases';
import { MATERIALS } from '../data/materials';
import { PHONE_BRANDS, PHONE_MODELS } from '../data/phoneModels';
import { PRODUCTS } from '../data/products';
import {
  MAX_EXPORT_WARNING_BYTES,
  deflateOrderImages,
  hydrateOrderImages,
} from './imageBlobStore';

const STORAGE_KEYS = {
  PHONE_SELECTION: 'ghilaf_phone_selection_v1',
  POPOVER_DISMISSED: 'ghilaf_popover_dismissed_v1',
  MISSING_PHONE_REQUESTS: 'ghilaf_missing_phone_requests_v1',
  CART: 'ghilaf_cart_v1',
  ORDERS: 'ghilaf_orders_v1',
};

function safeReadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.code === 22 ||
      err?.code === 1014;
    return {
      ok: false,
      quotaExceeded: isQuota,
      error: isQuota
        ? 'مساحة التخزين في المتصفح اتملت. امسح صور أو طلبات قديمة وجرّب تاني.'
        : 'حصل مشكلة أثناء الحفظ في المتصفح. جرّب تاني.',
    };
  }
}

/**
 * Mock data service layer.
 * Every UI component talks to this service so an admin-backed REST/GraphQL API
 * can replace these functions cleanly later without touching components.
 */
export const storeService = {
  getCategories() {
    return [...CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getPhoneBrands() {
    return [...PHONE_BRANDS];
  },

  getPhoneModels(brand) {
    if (!brand) return [...PHONE_MODELS];
    return PHONE_MODELS.filter((m) => m.brand === brand);
  },

  getPhoneModelById(modelId) {
    if (!modelId) return null;
    return PHONE_MODELS.find((m) => m.id === modelId) || null;
  },

  getMaterials() {
    return MATERIALS.filter((m) => m.active);
  },

  getMaterialById(materialId) {
    return MATERIALS.find((m) => m.id === materialId) || MATERIALS[0];
  },

  getGovernorates() {
    return [...GOVERNORATES];
  },

  getGovernorateById(govId) {
    return GOVERNORATES.find((g) => g.id === govId) || null;
  },

  getHeroProducts() {
    return PRODUCTS.filter((p) => p.featuredInHero);
  },

  getHeroCases() {
    return [...HERO_CASES];
  },

  getProductBySlug(slug) {
    if (!slug) return null;
    const clean = String(slug).trim().toLowerCase();
    return PRODUCTS.find((p) => (p.slug || p.id).toLowerCase() === clean) || null;
  },

  getProducts({ modelId = null, modelStatus = 'none', categoryId = null, searchQuery = '' } = {}) {
    let list = [...PRODUCTS];

    // Filter by chosen phone model unless none selected or pending customer service confirmation
    if (modelStatus === 'selected' && modelId) {
      list = list.filter((p) => p.compatibleModelIds.includes(modelId));
    }

    if (categoryId) {
      list = list.filter((p) => p.categoryId === categoryId);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const categoriesMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.nameAr.toLowerCase()]));
      list = list.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const catMatch = (categoriesMap[p.categoryId] || '').includes(q);
        const tagMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        return nameMatch || catMatch || tagMatch;
      });
    }

    return list;
  },

  getCategoryCounts({ modelId = null, modelStatus = 'none' } = {}) {
    const baseProducts = this.getProducts({ modelId, modelStatus });
    const counts = { all: baseProducts.length };
    for (const cat of CATEGORIES) {
      counts[cat.id] = baseProducts.filter((p) => p.categoryId === cat.id).length;
    }
    return counts;
  },

  // Persisted user phone selection
  loadPhoneSelection() {
    return safeReadJson(STORAGE_KEYS.PHONE_SELECTION, {
      status: 'none', // 'none' | 'selected' | 'pending'
      modelId: null,
      pendingPhoneName: null,
      pendingRequestId: null,
    });
  },

  savePhoneSelection(selection) {
    safeWriteJson(STORAGE_KEYS.PHONE_SELECTION, selection);
    return selection;
  },

  loadPopoverDismissed() {
    return safeReadJson(STORAGE_KEYS.POPOVER_DISMISSED, false);
  },

  savePopoverDismissed(dismissed) {
    safeWriteJson(STORAGE_KEYS.POPOVER_DISMISSED, Boolean(dismissed));
  },

  // Persisted missing-phone requests matching shared MissingModelRequest schema
  submitMissingPhoneRequest({ phoneName, mobileNumber }) {
    const existing = safeReadJson(STORAGE_KEYS.MISSING_PHONE_REQUESTS, []);
    const now = new Date().toISOString();
    const record = {
      id: generateMissingModelRequestId(),
      phoneName: phoneName.trim(),
      mobileNumber: mobileNumber.trim(),
      status: 'pending_confirmation',
      statusHistory: [{ status: 'pending_confirmation', at: now }],
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [record, ...existing];
    safeWriteJson(STORAGE_KEYS.MISSING_PHONE_REQUESTS, updated);
    return record;
  },

  getMissingPhoneRequests() {
    return safeReadJson(STORAGE_KEYS.MISSING_PHONE_REQUESTS, []);
  },

  // Persisted cart items (storing full printSpec on each item)
  loadCart() {
    return safeReadJson(STORAGE_KEYS.CART, []);
  },

  saveCart(items) {
    safeWriteJson(STORAGE_KEYS.CART, items);
    return items;
  },

  // ---------- Orders (Shared Snapshot Contract) ----------
  getOrders() {
    return safeReadJson(STORAGE_KEYS.ORDERS, []);
  },

  async createOrder({ customer, cartItems, phoneSelection }) {
    const gov = this.getGovernorateById(customer.governorateId);
    if (!gov || !gov.codAvailable) {
      return {
        ok: false,
        error: 'المحافظة دي مش متاح فيها الدفع عند الاستلام حالياً. اختار محافظة تانية.',
      };
    }

    const now = new Date().toISOString();
    const orderId = generateOrderId();

    const snapshotItems = cartItems.map((item, idx) => {
      const material = this.getMaterialById(
        item.printSpec?.materialId || STORE_CONFIG.defaultMaterialId
      );
      return {
        id: `${orderId}-item-${idx + 1}`,
        title: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        phoneModelName: item.printSpec?.phoneModelName || STORE_CONFIG.defaultPreviewModelId,
        materialNameAr: material?.nameAr || 'بولي كربونات مطفي',
        printSpec: item.printSpec,
      };
    });

    const subtotal = snapshotItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const shippingFee = gov.shippingFee;
    const total = subtotal + shippingFee;
    const hasPendingModel = snapshotItems.some(
      (it) => it.printSpec?.phoneModelStatus === 'pending'
    );

    const fullOrder = {
      id: orderId,
      type: deriveOrderType(snapshotItems),
      status: 'pending_confirmation',
      statusHistory: [{ status: 'pending_confirmation', at: now }],
      pendingModel: hasPendingModel,
      missingModelRequestId: hasPendingModel ? phoneSelection?.pendingRequestId || null : null,
      customer: {
        fullName: customer.fullName.trim(),
        mobileNumber: customer.mobileNumber.trim(),
        governorateId: gov.id,
        governorateNameAr: gov.nameAr,
        estimatedShippingDays: gov.estimatedDays,
        estimatedTotalDays: computeTotalDeliveryDays(STORE_CONFIG.productionDays, gov.estimatedDays),
        address: customer.address.trim(),
        notes: (customer.notes || '').trim(),
      },
      items: snapshotItems,
      pricing: {
        subtotal,
        shippingFee,
        total,
        currency: STORE_CONFIG.currencyCode,
        paymentMethod: STORE_CONFIG.paymentMethod,
      },
      internalNotes: '',
      createdAt: now,
      updatedAt: now,
    };

    // Offload large uploaded images to IndexedDB before writing order to localStorage
    const deflatedOrder = await deflateOrderImages(fullOrder);
    const existing = this.getOrders();
    const writeRes = safeWriteJson(STORAGE_KEYS.ORDERS, [deflatedOrder, ...existing]);

    if (!writeRes.ok) {
      return { ok: false, error: writeRes.error };
    }

    return { ok: true, order: fullOrder };
  },

  /**
   * Demo-only handoff helper (gated behind STORE_CONFIG.DEMO_HANDOFF).
   * Exports a versioned envelope containing the order (hydrated with renderable images)
   * plus any linked missing-model request so `case-store-admin` can import it directly.
   */
  async buildDemoHandoffEnvelope(order) {
    if (!STORE_CONFIG.DEMO_HANDOFF) return null;
    // Resolve every per-origin idb:// ref into an inline data URL inside the envelope
    const hydratedOrder = await hydrateOrderImages(order);
    const linkedRequests = order.missingModelRequestId
      ? this.getMissingPhoneRequests().filter((r) => r.id === order.missingModelRequestId)
      : [];
    const envelope = createHandoffEnvelope({
      orders: [hydratedOrder],
      missingModelRequests: linkedRequests,
    });
    const serialized = JSON.stringify(envelope, null, 2);
    const sizeBytes = new Blob([serialized]).size;
    const sizeWarning =
      sizeBytes > MAX_EXPORT_WARNING_BYTES
        ? 'حجم الملف كبير (أكتر من 8 ميجا) — استيراده في لوحة التحكم ممكن ياخد ثواني.'
        : '';
    return { envelope, serialized, sizeBytes, sizeWarning };
  },
};

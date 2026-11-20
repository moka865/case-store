import { CATEGORIES } from '../data/categories';
import { GOVERNORATES } from '../data/governorates';
import { MATERIALS } from '../data/materials';
import { PHONE_BRANDS, PHONE_MODELS } from '../data/phoneModels';
import { PRODUCTS } from '../data/products';

const STORAGE_KEYS = {
  PHONE_SELECTION: 'ghilaf_phone_selection_v1',
  POPOVER_DISMISSED: 'ghilaf_popover_dismissed_v1',
  MISSING_PHONE_REQUESTS: 'ghilaf_missing_phone_requests_v1',
  CART: 'ghilaf_cart_v1',
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
  } catch {
    // Ignore storage quota or private-mode errors
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

  getGovernorates() {
    return [...GOVERNORATES];
  },

  getHeroProducts() {
    return PRODUCTS.filter((p) => p.featuredInHero);
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

  // Persisted missing-phone requests (mock layer only)
  submitMissingPhoneRequest({ phoneName, mobileNumber }) {
    const existing = safeReadJson(STORAGE_KEYS.MISSING_PHONE_REQUESTS, []);
    const record = {
      id: `req-${Date.now()}`,
      phoneName: phoneName.trim(),
      mobileNumber: mobileNumber.trim(),
      status: 'pending_confirmation',
      createdAt: new Date().toISOString(),
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
};

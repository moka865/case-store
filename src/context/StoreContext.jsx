import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORE_CONFIG } from '../config/store';
import { storeService } from '../services/storeService';
import {
  arePrintSpecsMergeable,
  computeCartTotals,
  hasActivePrintedName,
  normalizePrintedNameSpec,
} from '../utils/pricing';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [phoneSelection, setPhoneSelection] = useState(() => storeService.loadPhoneSelection());
  const [popoverDismissed, setPopoverDismissed] = useState(() => storeService.loadPopoverDismissed());
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [cartItems, setCartItems] = useState(() => storeService.loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartPulseKey, setCartPulseKey] = useState(0);

  // Product passed to the quick-add phone picker modal when no site-wide phone is set
  const [quickAddProduct, setQuickAddProduct] = useState(null);

  const categories = useMemo(() => storeService.getCategories(), []);
  const phoneBrands = useMemo(() => storeService.getPhoneBrands(), []);
  const allPhoneModels = useMemo(() => storeService.getPhoneModels(), []);
  const materials = useMemo(() => storeService.getMaterials(), []);
  const governorates = useMemo(() => storeService.getGovernorates(), []);
  const heroProducts = useMemo(() => storeService.getHeroProducts(), []);
  const heroCases = useMemo(() => storeService.getHeroCases(), []);

  const selectedModel = useMemo(() => {
    if (phoneSelection.status === 'selected' && phoneSelection.modelId) {
      return storeService.getPhoneModelById(phoneSelection.modelId);
    }
    return null;
  }, [phoneSelection]);

  // Display model used for visual mockups when none is chosen or pending
  const visualPreviewModel = useMemo(() => {
    return selectedModel || storeService.getPhoneModelById(STORE_CONFIG.defaultPreviewModelId) || allPhoneModels[0];
  }, [selectedModel, allPhoneModels]);

  const filteredProducts = useMemo(() => {
    return storeService.getProducts({
      modelId: phoneSelection.modelId,
      modelStatus: phoneSelection.status,
      categoryId: activeCategoryId,
      searchQuery,
    });
  }, [phoneSelection.modelId, phoneSelection.status, activeCategoryId, searchQuery]);

  const categoryCounts = useMemo(() => {
    return storeService.getCategoryCounts({
      modelId: phoneSelection.modelId,
      modelStatus: phoneSelection.status,
    });
  }, [phoneSelection.modelId, phoneSelection.status]);

  const showFirstVisitPopover =
    phoneSelection.status === 'none' && !popoverDismissed && !isModelSelectorOpen;

  const dismissFirstVisitPopover = useCallback(() => {
    setPopoverDismissed(true);
    storeService.savePopoverDismissed(true);
  }, []);

  // Site-wide default phone model selector (Header)
  const selectPhoneModel = useCallback((modelId) => {
    const next = {
      status: 'selected',
      modelId,
      pendingPhoneName: null,
      pendingRequestId: null,
    };
    setPhoneSelection(next);
    storeService.savePhoneSelection(next);
    setPopoverDismissed(true);
    storeService.savePopoverDismissed(true);
    setIsModelSelectorOpen(false);
  }, []);

  // Site-wide missing-phone request (Header)
  const submitMissingPhone = useCallback(({ phoneName, mobileNumber }) => {
    const record = storeService.submitMissingPhoneRequest({ phoneName, mobileNumber });
    const next = {
      status: 'pending',
      modelId: null,
      pendingPhoneName: record.phoneName,
      pendingRequestId: record.id,
    };
    setPhoneSelection(next);
    storeService.savePhoneSelection(next);
    setPopoverDismissed(true);
    storeService.savePopoverDismissed(true);
    return record;
  }, []);

  // Per-item missing-phone request (Product Page / Customizer / Quick-Add / Cart) — does NOT overwrite site-wide filter
  const submitItemMissingPhone = useCallback(({ phoneName, mobileNumber }) => {
    return storeService.submitMissingPhoneRequest({ phoneName, mobileNumber });
  }, []);

  /**
   * Resolves a phone selection object (`itemPhone` override or site-wide `phoneSelection`)
   * into `{ phoneModelId, phoneModelName, phoneModelStatus, pendingRequestId }`.
   */
  const resolvePhoneSpecFields = useCallback(
    (itemPhone = null) => {
      const source = itemPhone || phoneSelection;
      if (source?.status === 'pending') {
        return {
          phoneModelId: null,
          phoneModelName: source.pendingPhoneName || 'موديلك بيتأكد',
          phoneModelStatus: 'pending',
          pendingRequestId: source.pendingRequestId || null,
        };
      }
      if (source?.status === 'selected' && source.modelId) {
        const modelObj = storeService.getPhoneModelById(source.modelId);
        if (modelObj) {
          return {
            phoneModelId: modelObj.id,
            phoneModelName: modelObj.name,
            phoneModelStatus: 'selected',
            pendingRequestId: null,
          };
        }
      }
      return {
        phoneModelId: null,
        phoneModelName: visualPreviewModel.name,
        phoneModelStatus: 'unassigned',
        pendingRequestId: null,
      };
    },
    [phoneSelection, visualPreviewModel]
  );

  /**
   * Adds a catalog product to the cart.
   * Accepts optional `{ itemPhone, printedName }` per-item overrides; when called from listing
   * quick-add with no phone chosen anywhere, opens `QuickAddPhoneModal` instead of adding blindly.
   */
  const addCatalogProductToCart = useCallback(
    (product, options = {}) => {
      const effectivePhone = options.itemPhone || phoneSelection;
      if (!effectivePhone || effectivePhone.status === 'none' || (effectivePhone.status === 'selected' && !effectivePhone.modelId)) {
        setQuickAddProduct(product);
        return { openedPhonePicker: true };
      }

      const phoneFields = resolvePhoneSpecFields(effectivePhone);
      const normalizedName = normalizePrintedNameSpec(options.printedName);
      const unitNameFee = hasActivePrintedName(normalizedName) ? STORE_CONFIG.namePrintFee : 0;

      const printSpec = {
        ...phoneFields,
        materialId: product.materialId || STORE_CONFIG.defaultMaterialId,
        designSource: {
          type: 'catalog',
          productId: product.id,
          artworkId: product.artworkId,
          imageUrl: null,
          fileName: null,
        },
        imageTransform: {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
        },
        printedName: normalizedName,
        createdAt: new Date().toISOString(),
      };

      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) =>
          arePrintSpecsMergeable(item.printSpec, printSpec)
        );

        let next;
        if (existingIndex >= 0) {
          next = prev.map((item, idx) =>
            idx === existingIndex
              ? { ...item, namePrintFee: unitNameFee, quantity: item.quantity + 1 }
              : item
          );
        } else {
          next = [
            {
              cartItemId: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: product.name,
              price: product.price,
              namePrintFee: unitNameFee,
              currency: product.currency || STORE_CONFIG.currencyCode,
              quantity: 1,
              printSpec,
            },
            ...prev,
          ];
        }
        storeService.saveCart(next);
        return next;
      });
      setCartPulseKey((k) => k + 1);
      return { ok: true };
    },
    [phoneSelection, resolvePhoneSpecFields]
  );

  const addCustomSpecToCart = useCallback(
    ({ name = 'Custom Studio Print', price = STORE_CONFIG.customCasePrice, printSpec }) => {
      const normalizedName = normalizePrintedNameSpec(printSpec?.printedName);
      const unitNameFee = hasActivePrintedName(normalizedName) ? STORE_CONFIG.namePrintFee : 0;
      const finalSpec = {
        ...printSpec,
        printedName: normalizedName,
      };

      setCartItems((prev) => {
        const next = [
          {
            cartItemId: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name,
            price,
            namePrintFee: unitNameFee,
            currency: STORE_CONFIG.currencyCode,
            quantity: 1,
            printSpec: finalSpec,
          },
          ...prev,
        ];
        storeService.saveCart(next);
        return next;
      });
      setCartPulseKey((k) => k + 1);
    },
    []
  );

  /**
   * Updates an existing cart line's per-item phone model and/or printed name,
   * recalculates `namePrintFee` (+50 when active, 0 when removed), and merges
   * if the edited item now matches another identical catalog line.
   */
  const updateCartItemSpec = useCallback(
    (cartItemId, { itemPhone = undefined, printedName = undefined }) => {
      setCartItems((prev) => {
        const targetIndex = prev.findIndex((it) => it.cartItemId === cartItemId);
        if (targetIndex === -1) return prev;

        const target = prev[targetIndex];
        const nextPhoneFields = itemPhone
          ? resolvePhoneSpecFields(itemPhone)
          : {
              phoneModelId: target.printSpec?.phoneModelId ?? null,
              phoneModelName: target.printSpec?.phoneModelName ?? visualPreviewModel.name,
              phoneModelStatus: target.printSpec?.phoneModelStatus ?? 'selected',
              pendingRequestId: target.printSpec?.pendingRequestId ?? null,
            };

        const nextNameSpec =
          printedName !== undefined
            ? normalizePrintedNameSpec(printedName)
            : normalizePrintedNameSpec(target.printSpec?.printedName);

        const nextUnitNameFee = hasActivePrintedName(nextNameSpec) ? STORE_CONFIG.namePrintFee : 0;

        // Update title for custom cases when name toggles on/off
        let nextTitle = target.name;
        const srcType = target.printSpec?.designSource?.type;
        if (srcType === 'custom-upload') {
          nextTitle = 'Custom Photo Print';
        } else if (srcType === 'custom-text-only') {
          nextTitle = 'Custom Name Print';
        }

        const updatedSpec = {
          ...target.printSpec,
          ...nextPhoneFields,
          printedName: nextNameSpec,
        };

        const updatedItem = {
          ...target,
          name: nextTitle,
          namePrintFee: nextUnitNameFee,
          printSpec: updatedSpec,
        };

        // Merge if another line in the cart now has identical catalog spec
        const duplicateIndex = prev.findIndex(
          (other, idx) =>
            idx !== targetIndex && arePrintSpecsMergeable(other.printSpec, updatedSpec)
        );

        let next;
        if (duplicateIndex >= 0) {
          next = prev
            .map((item, idx) =>
              idx === duplicateIndex
                ? {
                    ...item,
                    namePrintFee: nextUnitNameFee,
                    quantity: item.quantity + updatedItem.quantity,
                  }
                : item
            )
            .filter((_, idx) => idx !== targetIndex);
        } else {
          next = prev.map((item, idx) => (idx === targetIndex ? updatedItem : item));
        }

        storeService.saveCart(next);
        return next;
      });
    },
    [resolvePhoneSpecFields, visualPreviewModel]
  );

  const updateCartQuantity = useCallback((cartItemId, delta) => {
    setCartItems((prev) => {
      const next = prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);
      storeService.saveCart(next);
      return next;
    });
  }, []);

  const removeCartItem = useCallback((cartItemId) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.cartItemId !== cartItemId);
      storeService.saveCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    storeService.saveCart([]);
  }, []);

  const placeOrder = useCallback(
    async (customerData) => {
      const res = await storeService.createOrder({
        customer: customerData,
        cartItems,
        phoneSelection,
      });
      if (res.ok) {
        setCartItems([]);
        storeService.saveCart([]);
      }
      return res;
    },
    [cartItems, phoneSelection]
  );

  const {
    count: cartCount,
    designSubtotal: cartDesignSubtotal,
    nameFeesSubtotal: cartNameFeesSubtotal,
    subtotal: cartSubtotal,
  } = useMemo(() => computeCartTotals(cartItems), [cartItems]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (quickAddProduct) setQuickAddProduct(null);
        else if (isCartOpen) setIsCartOpen(false);
        else if (isModelSelectorOpen) setIsModelSelectorOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, isModelSelectorOpen, quickAddProduct]);

  const value = {
    categories,
    phoneBrands,
    allPhoneModels,
    materials,
    governorates,
    heroProducts,
    heroCases,
    phoneSelection,
    selectedModel,
    visualPreviewModel,
    filteredProducts,
    categoryCounts,
    activeCategoryId,
    setActiveCategoryId,
    searchQuery,
    setSearchQuery,
    isModelSelectorOpen,
    setIsModelSelectorOpen,
    showFirstVisitPopover,
    dismissFirstVisitPopover,
    selectPhoneModel,
    submitMissingPhone,
    submitItemMissingPhone,
    resolvePhoneSpecFields,
    quickAddProduct,
    setQuickAddProduct,
    cartItems,
    cartCount,
    cartDesignSubtotal,
    cartNameFeesSubtotal,
    cartSubtotal,
    cartPulseKey,
    isCartOpen,
    setIsCartOpen,
    addCatalogProductToCart,
    addCustomSpecToCart,
    updateCartItemSpec,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    placeOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

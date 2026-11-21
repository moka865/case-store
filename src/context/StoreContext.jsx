import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORE_CONFIG } from '../config/store';
import { storeService } from '../services/storeService';

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

  const categories = useMemo(() => storeService.getCategories(), []);
  const phoneBrands = useMemo(() => storeService.getPhoneBrands(), []);
  const allPhoneModels = useMemo(() => storeService.getPhoneModels(), []);
  const materials = useMemo(() => storeService.getMaterials(), []);
  const governorates = useMemo(() => storeService.getGovernorates(), []);
  const heroProducts = useMemo(() => storeService.getHeroProducts(), []);

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

  // Show gentle first-visit popover only if user hasn't picked a phone and hasn't dismissed it
  const showFirstVisitPopover =
    phoneSelection.status === 'none' && !popoverDismissed && !isModelSelectorOpen;

  const dismissFirstVisitPopover = useCallback(() => {
    setPopoverDismissed(true);
    storeService.savePopoverDismissed(true);
  }, []);

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

  const addCatalogProductToCart = useCallback(
    (product) => {
      const modelStatus = phoneSelection.status === 'pending' ? 'pending' : selectedModel ? 'selected' : 'unassigned';
      const phoneModelId = selectedModel ? selectedModel.id : null;
      const phoneModelName =
        phoneSelection.status === 'pending'
          ? phoneSelection.pendingPhoneName || 'موديلك بيتأكد'
          : selectedModel
            ? selectedModel.name
            : visualPreviewModel.name;

      const printSpec = {
        phoneModelId,
        phoneModelName,
        phoneModelStatus: modelStatus,
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
        printedName: {
          enabled: false,
          text: '',
          script: null,
          fontId: null,
          fontFamily: null,
          placement: 'bottom',
          ink: 'light',
        },
        createdAt: new Date().toISOString(),
      };

      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.printSpec?.designSource?.type === 'catalog' &&
            item.printSpec?.designSource?.productId === product.id &&
            item.printSpec?.phoneModelId === phoneModelId &&
            item.printSpec?.phoneModelStatus === modelStatus &&
            !item.printSpec?.printedName?.enabled
        );

        let next;
        if (existingIndex >= 0) {
          next = prev.map((item, idx) =>
            idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          next = [
            {
              cartItemId: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: product.name,
              price: product.price,
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
    },
    [phoneSelection, selectedModel, visualPreviewModel]
  );

  const addCustomSpecToCart = useCallback(({ name = 'Custom Studio Print', price = STORE_CONFIG.customCasePrice, printSpec }) => {
    setCartItems((prev) => {
      const next = [
        {
          cartItemId: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name,
          price,
          currency: STORE_CONFIG.currencyCode,
          quantity: 1,
          printSpec,
        },
        ...prev,
      ];
      storeService.saveCart(next);
      return next;
    });
    setCartPulseKey((k) => k + 1);
  }, []);

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

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  // Close overlays cleanly on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isCartOpen) setIsCartOpen(false);
        if (isModelSelectorOpen) setIsModelSelectorOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, isModelSelectorOpen]);

  const value = {
    categories,
    phoneBrands,
    allPhoneModels,
    materials,
    governorates,
    heroProducts,
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
    cartItems,
    cartCount,
    cartSubtotal,
    cartPulseKey,
    isCartOpen,
    setIsCartOpen,
    addCatalogProductToCart,
    addCustomSpecToCart,
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

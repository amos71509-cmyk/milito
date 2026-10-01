/**
 * MILITO Website-Wide User Progress & Draft State Persistence
 * 
 * Provides unified, non-intrusive, and resilient persistence across navigation,
 * page refreshes (F5 / Ctrl+R), and browser restarts without triggering full-page
 * reloads or losing in-flight user or admin work.
 */

import { Product, CartItem, SwapDeviceConditionAnswers, SwapRequest } from "../types";
import { SwapStepNumber } from "../components/swap/SwapProgressBar";

// Storage Keys
const STORAGE_KEYS = {
  SESSION_ID: "milito_user_session_id",
  AUTH_USER_ID: "milito_auth_user_id",
  SWAP_DRAFT: "milito_swap_draft_v2",
  CART_ITEMS: "milito_cart_items_v2",
  CATALOG_FILTERS: "milito_catalog_filters_state",
  COMPARE_LIST: "milito_compare_product_ids",
  ACTIVE_PAGE: "milito_active_page_nav",
  ADMIN_ACTIVE_TAB: "milito_admin_active_tab",
  ADMIN_TRADEIN_DRAFT: "milito_admin_tradein_draft",
  ADMIN_PRODUCT_DRAFT: "milito_admin_product_draft",
  ADMIN_FILTERS: "milito_admin_filters_state",
};

// Custom event names for reactive multi-component & multi-tab synchronization
export const PERSISTENCE_EVENTS = {
  SWAP_DRAFT_UPDATED: "milito_swap_draft_updated",
  CART_UPDATED: "milito_cart_updated",
  CATALOG_FILTERS_UPDATED: "milito_catalog_filters_updated",
  ADMIN_DRAFT_UPDATED: "milito_admin_draft_updated",
};

/* ==========================================================================
   1. ANONYMOUS SESSION & USER IDENTIFIER
   ========================================================================== */

export function getOrCreateSessionId(): string {
  try {
    let sid = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (!sid) {
      sid = "anon_session_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sid);
    }
    return sid;
  } catch (e) {
    return "anon_fallback_" + Date.now();
  }
}

export function getAuthUserId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_USER_ID);
  } catch (e) {
    return null;
  }
}

export function setAuthUserId(userId: string | null) {
  try {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER_ID);
    }
  } catch (e) {
    console.error("Failed to set auth user id:", e);
  }
}

/* ==========================================================================
   2. SWAP DEALS DRAFT STATE MANAGEMENT
   ========================================================================== */

export interface SwapDraftState {
  draftId: string;
  sessionId: string;
  userId?: string | null;
  updatedAt: number;
  currentStep: SwapStepNumber;
  maxReachedStep: SwapStepNumber;
  selectedBrand: string;
  selectedModel: string;
  selectedStorage: string;
  conditionAnswers: SwapDeviceConditionAnswers;
  selectedTargetProductId: string | null;
  selectedTargetProductSnapshot?: {
    id: string;
    name: string;
    brand: string;
    price: number;
    condition: string;
    image: string;
  } | null;
  submittedRequest?: SwapRequest | null;
}

let swapSaveTimer: any = null;

/**
 * Saves the current Swap draft state.
 * Debounced by 200ms to avoid excessive disk I/O while capturing every meaningful transition.
 */
export function saveSwapDraft(partial: Partial<SwapDraftState>, immediate = false) {
  const doSave = () => {
    try {
      const existing = getStoredSwapDraft();
      const updated: SwapDraftState = {
        draftId: existing?.draftId || "swap_draft_" + Date.now().toString(36),
        sessionId: getOrCreateSessionId(),
        userId: getAuthUserId(),
        updatedAt: Date.now(),
        currentStep: partial.currentStep !== undefined ? partial.currentStep : (existing?.currentStep ?? 1),
        maxReachedStep: partial.maxReachedStep !== undefined ? partial.maxReachedStep : (existing?.maxReachedStep ?? 1),
        selectedBrand: partial.selectedBrand !== undefined ? partial.selectedBrand : (existing?.selectedBrand ?? ""),
        selectedModel: partial.selectedModel !== undefined ? partial.selectedModel : (existing?.selectedModel ?? ""),
        selectedStorage: partial.selectedStorage !== undefined ? partial.selectedStorage : (existing?.selectedStorage ?? ""),
        conditionAnswers: partial.conditionAnswers !== undefined ? partial.conditionAnswers : (existing?.conditionAnswers ?? ({} as any)),
        selectedTargetProductId: partial.selectedTargetProductId !== undefined ? partial.selectedTargetProductId : (existing?.selectedTargetProductId ?? null),
        selectedTargetProductSnapshot: partial.selectedTargetProductSnapshot !== undefined ? partial.selectedTargetProductSnapshot : (existing?.selectedTargetProductSnapshot ?? null),
        submittedRequest: partial.submittedRequest !== undefined ? partial.submittedRequest : (existing?.submittedRequest ?? null),
      };

      // Only save if there's actual user progress
      const hasProgress = Boolean(
        updated.selectedBrand ||
        updated.selectedModel ||
        updated.selectedStorage ||
        updated.currentStep > 1 ||
        updated.selectedTargetProductId ||
        (updated.conditionAnswers && (updated.conditionAnswers.screen || updated.conditionAnswers.body))
      );

      if (hasProgress) {
        localStorage.setItem(STORAGE_KEYS.SWAP_DRAFT, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(PERSISTENCE_EVENTS.SWAP_DRAFT_UPDATED, { detail: updated }));
      }
    } catch (e) {
      console.error("Failed to save swap draft:", e);
    }
  };

  if (swapSaveTimer) clearTimeout(swapSaveTimer);
  if (immediate) {
    doSave();
  } else {
    swapSaveTimer = setTimeout(doSave, 200);
  }
}

/**
 * Retrieves the stored Swap draft if available and not expired (valid for 30 days).
 */
export function getStoredSwapDraft(): SwapDraftState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SWAP_DRAFT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SwapDraftState;
    if (!parsed || typeof parsed !== "object") return null;

    // Check expiration: 30 days
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.updatedAt > THIRTY_DAYS_MS) {
      clearSwapDraft();
      return null;
    }

    return parsed;
  } catch (e) {
    console.error("Failed to parse swap draft:", e);
    return null;
  }
}

/**
 * Clears the stored Swap draft (e.g. when user confirms "Start Over" or submits a request).
 */
export function clearSwapDraft() {
  try {
    if (swapSaveTimer) clearTimeout(swapSaveTimer);
    localStorage.removeItem(STORAGE_KEYS.SWAP_DRAFT);
    window.dispatchEvent(new CustomEvent(PERSISTENCE_EVENTS.SWAP_DRAFT_UPDATED, { detail: null }));
  } catch (e) {
    console.error("Failed to clear swap draft:", e);
  }
}

/**
 * Checks if a legitimate, non-empty Swap draft is stored.
 */
export function hasActiveSwapDraft(): boolean {
  const draft = getStoredSwapDraft();
  if (!draft) return false;
  return Boolean(draft.selectedBrand || draft.selectedModel || draft.currentStep > 1 || draft.selectedTargetProductId);
}

/* ==========================================================================
   3. SHOPPING CART PERSISTENCE & CATALOG SYNCHRONIZATION
   ========================================================================== */

export function saveCartState(cart: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent(PERSISTENCE_EVENTS.CART_UPDATED, { detail: cart }));
  } catch (e) {
    console.error("Failed to save cart items:", e);
  }
}

export function getStoredCartState(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART_ITEMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse cart items:", e);
    return [];
  }
}

export interface CartSyncResult {
  syncedCart: CartItem[];
  priceChanges: {
    name: string;
    oldPrice: number;
    newPrice: number;
  }[];
  unavailableItems: {
    name: string;
  }[];
}

/**
 * Synchronizes stored cart items with live product catalogue data.
 * Updates prices to live rates, flags sold-out items, and preserves user options.
 */
export function syncCartWithCatalog(cart: CartItem[], liveProducts: Product[]): CartSyncResult {
  if (!liveProducts || liveProducts.length === 0 || cart.length === 0) {
    return { syncedCart: cart, priceChanges: [], unavailableItems: [] };
  }

  const liveMap = new Map<string, Product>();
  liveProducts.forEach((p) => liveMap.set(p.id, p));

  const priceChanges: { name: string; oldPrice: number; newPrice: number }[] = [];
  const unavailableItems: { name: string }[] = [];

  const syncedCart = cart.map((item) => {
    const liveProd = liveMap.get(item.product.id);
    if (!liveProd) {
      // Product no longer in catalog
      unavailableItems.push({ name: item.product.name });
      return item;
    }

    if (liveProd.availability === "Sold Out" || (typeof liveProd.stockQuantity === "number" && liveProd.stockQuantity <= 0)) {
      unavailableItems.push({ name: liveProd.name });
    }

    if (liveProd.price !== item.product.price) {
      priceChanges.push({
        name: liveProd.name,
        oldPrice: item.product.price,
        newPrice: liveProd.price,
      });
    }

    return {
      ...item,
      product: liveProd,
    };
  });

  return {
    syncedCart,
    priceChanges,
    unavailableItems,
  };
}

/* ==========================================================================
   4. CATALOG SEARCH, FILTERS & ACTIVE PAGE PERSISTENCE
   ========================================================================== */

export interface CatalogFilterState {
  searchQuery: string;
  brandFilter: string;
  conditionFilter: string;
  priceRangeFilter: string;
  storageFilter: string;
  batteryHealthFilter: string;
  availabilityFilter: string;
  priceSort: string;
  currentPage: number;
  updatedAt: number;
}

export function saveCatalogFilterState(filters: Partial<CatalogFilterState>) {
  try {
    const existing = getStoredCatalogFilterState();
    const updated: CatalogFilterState = {
      searchQuery: filters.searchQuery !== undefined ? filters.searchQuery : (existing?.searchQuery || ""),
      brandFilter: filters.brandFilter !== undefined ? filters.brandFilter : (existing?.brandFilter || "All"),
      conditionFilter: filters.conditionFilter !== undefined ? filters.conditionFilter : (existing?.conditionFilter || "All"),
      priceRangeFilter: filters.priceRangeFilter !== undefined ? filters.priceRangeFilter : (existing?.priceRangeFilter || "All"),
      storageFilter: filters.storageFilter !== undefined ? filters.storageFilter : (existing?.storageFilter || "All"),
      batteryHealthFilter: filters.batteryHealthFilter !== undefined ? filters.batteryHealthFilter : (existing?.batteryHealthFilter || "All"),
      availabilityFilter: filters.availabilityFilter !== undefined ? filters.availabilityFilter : (existing?.availabilityFilter || "All"),
      priceSort: filters.priceSort !== undefined ? filters.priceSort : (existing?.priceSort || "Default"),
      currentPage: filters.currentPage !== undefined ? filters.currentPage : (existing?.currentPage || 1),
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CATALOG_FILTERS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(PERSISTENCE_EVENTS.CATALOG_FILTERS_UPDATED, { detail: updated }));
  } catch (e) {
    console.error("Failed to save catalog filters:", e);
  }
}

export function getStoredCatalogFilterState(): CatalogFilterState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATALOG_FILTERS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveActivePage(page: "gadgets" | "vehicles" | "swap-deals") {
  try {
    sessionStorage.setItem(STORAGE_KEYS.ACTIVE_PAGE, page);
  } catch (e) {
    // ignore
  }
}

export function getStoredActivePage(): "gadgets" | "vehicles" | "swap-deals" {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_PAGE);
    if (saved === "gadgets" || saved === "vehicles" || saved === "swap-deals") {
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return "gadgets";
}

/* ==========================================================================
   5. PRODUCT COMPARISON LIST PERSISTENCE
   ========================================================================== */

export function saveCompareProductIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPARE_LIST, JSON.stringify(ids));
  } catch (e) {
    console.error("Failed to save compare product ids:", e);
  }
}

export function getStoredCompareProductIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPARE_LIST);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/* ==========================================================================
   6. ADMIN DASHBOARD PERSISTENCE (TABS, VALUATION DRAFTS, PRODUCT DRAFTS)
   ========================================================================== */

export function saveAdminActiveTab(tab: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_ACTIVE_TAB, tab);
  } catch (e) {
    console.error("Failed to save admin active tab:", e);
  }
}

export function getStoredAdminActiveTab(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_ACTIVE_TAB);
  } catch (e) {
    return null;
  }
}

export interface AdminTradeInDraft {
  brand: string;
  model: string;
  storage: string;
  baseTradeInValue: string;
  status: "Active" | "Inactive";
  notes: string;
  editingId?: string | null;
  isDirty: boolean;
  updatedAt: number;
}

export function saveAdminTradeInDraft(draft: AdminTradeInDraft | null) {
  try {
    if (!draft || !draft.isDirty) {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TRADEIN_DRAFT);
    } else {
      localStorage.setItem(STORAGE_KEYS.ADMIN_TRADEIN_DRAFT, JSON.stringify(draft));
    }
    window.dispatchEvent(new CustomEvent(PERSISTENCE_EVENTS.ADMIN_DRAFT_UPDATED, { detail: { type: "tradein", draft } }));
  } catch (e) {
    console.error("Failed to save admin trade-in draft:", e);
  }
}

export function getStoredAdminTradeInDraft(): AdminTradeInDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_TRADEIN_DRAFT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export interface AdminProductDraft {
  productForm: Partial<Product>;
  isAddingProduct: boolean;
  editingProductId: string | null;
  isDirty: boolean;
  updatedAt: number;
}

export function saveAdminProductDraft(draft: AdminProductDraft | null) {
  try {
    if (!draft || !draft.isDirty) {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_PRODUCT_DRAFT);
    } else {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PRODUCT_DRAFT, JSON.stringify(draft));
    }
    window.dispatchEvent(new CustomEvent(PERSISTENCE_EVENTS.ADMIN_DRAFT_UPDATED, { detail: { type: "product", draft } }));
  } catch (e) {
    console.error("Failed to save admin product draft:", e);
  }
}

export function getStoredAdminProductDraft(): AdminProductDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_PRODUCT_DRAFT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveAdminFilterState(filters: any) {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_FILTERS, JSON.stringify(filters));
  } catch (e) {
    console.error("Failed to save admin filters:", e);
  }
}

export function getStoredAdminFilterState(): any {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_FILTERS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Scroll Position Retention & Body Scroll Management Utility
 * 
 * Provides robust scroll memory for view transitions, modals, and navigation
 * to prevent unwanted page resets to (0, 0).
 */

const SCROLL_STORAGE_PREFIX = "milito_scroll_pos_";

// In-memory memory map for instantaneous synchronous access
const scrollMemoryMap: Record<string, number> = {
  gadgets: 0,
  vehicles: 0,
};

let lastModalScrollCoordinate = 0;
let isScrollLocked = false;
let previousBodyOverflow = "";
let previousBodyPosition = "";
let previousBodyTop = "";
let previousBodyWidth = "";

/**
 * Save current scroll position for a specific view/route key
 */
export function saveScrollPosition(viewKey: string, customY?: number): void {
  if (typeof window === "undefined") return;
  
  const y = customY !== undefined ? customY : (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0);
  scrollMemoryMap[viewKey] = y;

  try {
    sessionStorage.setItem(`${SCROLL_STORAGE_PREFIX}${viewKey}`, String(y));
  } catch {
    // ignore sessionStorage errors if storage is blocked
  }
}

/**
 * Retrieve saved scroll position for a specific view/route key
 */
export function getSavedScrollPosition(viewKey: string): number {
  if (typeof window === "undefined") return 0;

  if (scrollMemoryMap[viewKey] !== undefined && scrollMemoryMap[viewKey] > 0) {
    return scrollMemoryMap[viewKey];
  }

  try {
    const saved = sessionStorage.getItem(`${SCROLL_STORAGE_PREFIX}${viewKey}`);
    if (saved !== null) {
      const parsed = Number(saved);
      if (!isNaN(parsed) && parsed >= 0) {
        scrollMemoryMap[viewKey] = parsed;
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  return 0;
}

/**
 * Restore window scroll to saved position for a view key
 */
export function restoreScrollPosition(viewKey: string, behavior: ScrollBehavior = "instant"): void {
  if (typeof window === "undefined") return;

  const targetY = getSavedScrollPosition(viewKey);
  
  // Use requestAnimationFrame and setTimeout fallback to ensure DOM is rendered
  requestAnimationFrame(() => {
    window.scrollTo({
      top: targetY,
      left: 0,
      behavior: behavior
    });
  });

  setTimeout(() => {
    if (Math.abs((window.scrollY || 0) - targetY) > 50 && targetY > 0) {
      window.scrollTo({
        top: targetY,
        left: 0,
        behavior: "instant"
      });
    }
  }, 60);
}

/**
 * Record scroll position immediately prior to opening a modal or popup
 */
export function saveModalScroll(): void {
  if (typeof window === "undefined") return;
  lastModalScrollCoordinate = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
}

/**
 * Restore window scroll position upon modal closure
 */
export function restoreModalScroll(): void {
  if (typeof window === "undefined") return;
  const targetY = lastModalScrollCoordinate;

  requestAnimationFrame(() => {
    window.scrollTo({
      top: targetY,
      left: 0,
      behavior: "instant"
    });
  });

  setTimeout(() => {
    if (Math.abs((window.scrollY || 0) - targetY) > 20 && targetY > 0) {
      window.scrollTo({
        top: targetY,
        left: 0,
        behavior: "instant"
      });
    }
  }, 50);
}

/**
 * Lock body scroll for modals without jumping the page to top
 */
export function lockBodyScroll(): void {
  if (typeof window === "undefined" || isScrollLocked) return;
  
  saveModalScroll();
  const scrollY = lastModalScrollCoordinate;

  previousBodyOverflow = document.body.style.overflow;
  previousBodyPosition = document.body.style.position;
  previousBodyTop = document.body.style.top;
  previousBodyWidth = document.body.style.width;

  document.body.style.overflow = "hidden";
  isScrollLocked = true;
}

/**
 * Unlock body scroll and restore previous scroll coordinate
 */
export function unlockBodyScroll(): void {
  if (typeof window === "undefined" || !isScrollLocked) return;

  document.body.style.overflow = previousBodyOverflow || "";
  document.body.style.position = previousBodyPosition || "";
  document.body.style.top = previousBodyTop || "";
  document.body.style.width = previousBodyWidth || "";
  
  isScrollLocked = false;
  restoreModalScroll();
}

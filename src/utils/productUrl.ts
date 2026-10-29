import { Product } from "../types";
import { formatNaira, getProductDisplayId } from "./whatsapp";

/**
 * Creates a clean, human-readable SEO slug from a product name.
 * e.g., "iPhone 14 Pro Max (256GB)" -> "iphone-14-pro-max-256gb"
 */
export function slugify(text: string): string {
  if (!text) return "device";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "") || "device";
}

/**
 * Generates the stable, unique public path for any product.
 * Formats as: `/product/{slug}--{id}`
 * Including the stable ID at the end ensures that changing a product name
 * or title will NEVER break previously shared links.
 */
export function getProductPath(product: Product): string {
  if (!product) return "/store";
  const nameSlug = slugify(product.name || "device");
  const cleanId = encodeURIComponent(String(product.id || "0").trim());
  return `/product/${nameSlug}--${cleanId}`;
}

/**
 * Generates the absolute, fully qualified public URL for sharing.
 * Supports optional traffic source parameter (e.g. `whatsapp`, `instagram`, `facebook`, `x`, `direct`).
 */
export function getProductPublicUrl(product: Product, source?: string): string {
  if (!product) return "";
  let origin = "https://milito.ng";
  if (typeof window !== "undefined" && window.location) {
    if (window.location.origin && window.location.origin !== "null" && window.location.origin !== "about:blank") {
      origin = window.location.origin;
    } else if (window.location.protocol && window.location.host) {
      origin = `${window.location.protocol}//${window.location.host}`;
    }
  }
  const path = getProductPath(product);
  try {
    const url = new URL(path, origin);
    if (source && source.trim() && source.trim().toLowerCase() !== "direct") {
      url.searchParams.set("source", source.trim().toLowerCase());
    }
    return url.toString();
  } catch {
    return `${origin}${path}`;
  }
}

/**
 * Alias for getProductPublicUrl
 */
export const generateProductShareUrl = getProductPublicUrl;

/**
 * Resolves a product from the active catalog by ID or URL slug.
 * Handles:
 * 1. Exact ID match (e.g., `phone-1`, `1042`, `doc_xxx`)
 * 2. URL slug with `--{id}` suffix (e.g., `iphone-14-pro-max-256gb--phone-1`)
 * 3. Exact slug match on product name
 * 4. Case-insensitive substring or normalized name match
 */
export function findProductBySlugOrId(products: Product[], slugOrId: string): Product | undefined {
  if (!products || products.length === 0 || !slugOrId) return undefined;
  const rawTarget = decodeURIComponent(slugOrId).trim();
  const lowerTarget = rawTarget.toLowerCase();

  // 1. Direct ID match
  const directMatch = products.find(p => String(p.id).trim().toLowerCase() === lowerTarget);
  if (directMatch) return directMatch;

  // 2. Slug with stable ID delimiter (`--{id}`)
  if (rawTarget.includes("--")) {
    const parts = rawTarget.split("--");
    const potentialId = parts[parts.length - 1].trim().toLowerCase();
    if (potentialId) {
      const idMatch = products.find(p => String(p.id).trim().toLowerCase() === potentialId);
      if (idMatch) return idMatch;
    }
  }

  // 3. Match against generated slug
  const slugMatch = products.find(p => slugify(p.name) === lowerTarget);
  if (slugMatch) return slugMatch;

  // 4. Loose match against name or display ID
  return products.find(p => {
    const pNameSlug = slugify(p.name);
    const displayId = getProductDisplayId(p).toLowerCase();
    return pNameSlug.includes(lowerTarget) || lowerTarget.includes(pNameSlug) || displayId === lowerTarget;
  });
}

/**
 * Generates the dynamically populated product share text.
 * Contains only public product attributes: Name, Storage/Specs, Condition, Price, and Public URL.
 * NEVER contains private info, customer notes, or internal tokens.
 */
export function generateProductShareText(product: Product, source = "whatsapp"): string {
  if (!product) return "";
  const url = getProductPublicUrl(product, source);
  const formattedPrice = formatNaira(product.price);
  const lines: string[] = [];

  // Title
  lines.push(`🔥 ${product.name}`);
  lines.push("");

  // Specs & Condition
  if (product.productType === "vehicle") {
    const specs = [
      product.year,
      product.condition,
      product.transmission,
      product.location ? `Location: ${product.location}` : ""
    ].filter(Boolean).join(" • ");
    if (specs) {
      lines.push(specs);
      lines.push("");
    }
  } else {
    const storage = product.storageOptions && product.storageOptions[0] ? product.storageOptions[0] : "";
    const specs = [
      storage,
      product.condition,
      product.batteryHealth ? `Battery: ${product.batteryHealth}` : ""
    ].filter(Boolean).join(" • ");
    if (specs) {
      lines.push(specs);
      lines.push("");
    }
  }

  // Price
  lines.push(formattedPrice);
  lines.push("");
  lines.push("Check it out on MILITO:");
  lines.push(url);

  return lines.join("\n");
}

/**
 * Backward-compatible alias for generateProductShareText
 */
export const generateWhatsAppSharePost = generateProductShareText;

/**
 * Universal safe copy to clipboard with fallback for iframes / older browsers.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  
  // Method 1: Modern navigator.clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.debug("[Clipboard] navigator.clipboard failed, attempting fallback:", e);
    }
  }

  // Method 2: Fallback using temporary textarea
  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      textArea.style.opacity = "0";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) return true;
    } catch (err) {
      console.debug("[Clipboard] document.execCommand fallback failed:", err);
    }
  }

  return false;
}

/**
 * Checks if the Web Share API is supported in the current environment.
 */
export function isNativeShareSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/**
 * Triggers native mobile/browser share or returns false if unsupported/cancelled.
 */
export async function triggerNativeProductShare(product: Product, source = "native"): Promise<boolean> {
  if (!isNativeShareSupported()) return false;
  
  const shareUrl = getProductPublicUrl(product, source);
  const shareData = {
    title: product.name,
    text: `Check out this ${product.name} on MILITO.`,
    url: shareUrl,
  };

  try {
    await navigator.share(shareData);
    trackFunnelEvent("product_viewed", {
      productId: product.id,
      productName: product.name,
      source: `share_${source}`,
      metadata: { method: "native" }
    });
    return true;
  } catch (err: any) {
    // If the user cancelled the share dialogue, do not treat as fatal error
    if (err && err.name === "AbortError") {
      return true;
    }
    console.debug("[NativeShare] Native share failed:", err);
    return false;
  }
}

/**
 * Social Sharing URL generators
 */
export function getWhatsAppShareUrl(product: Product, source = "whatsapp"): string {
  const text = generateProductShareText(product, source);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getFacebookShareUrl(product: Product, source = "facebook"): string {
  const url = getProductPublicUrl(product, source);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function getXShareUrl(product: Product, source = "x"): string {
  const url = getProductPublicUrl(product, source);
  const text = `🔥 Check out this ${product.name} on MILITO:`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

/**
 * Parses current window location for public product routes.
 */
export function parseCurrentProductUrl(): { slugOrId: string | null; source: string | null } {
  if (typeof window === "undefined") return { slugOrId: null, source: null };
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const source = searchParams.get("source") || searchParams.get("utm_source") || null;

  // Check for `/product/:slugOrId`
  const match = pathname.match(/^\/product\/(.+)$/);
  if (match && match[1]) {
    return {
      slugOrId: match[1].replace(/\/+$/, ""),
      source
    };
  }

  // Check for query parameter `?product=:id` or `?p=:id`
  const queryProduct = searchParams.get("product") || searchParams.get("p") || searchParams.get("id");
  if (queryProduct) {
    return {
      slugOrId: queryProduct,
      source
    };
  }

  return { slugOrId: null, source };
}

/**
 * Lightweight Analytics Tracking Foundation
 */
export interface FunnelEvent {
  eventName: "product_viewed" | "add_to_cart" | "order_started" | "order_submitted" | "payment_notified" | "order_completed";
  productId?: string;
  productName?: string;
  orderId?: string;
  source?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function trackFunnelEvent(
  eventName: FunnelEvent["eventName"],
  data: {
    productId?: string;
    productName?: string;
    orderId?: string;
    source?: string;
    metadata?: Record<string, any>;
  }
): void {
  try {
    const event: FunnelEvent = {
      eventName,
      ...data,
      timestamp: new Date().toISOString()
    };

    // Save to local telemetry store
    const existingRaw = localStorage.getItem("milito_analytics_events");
    const events: FunnelEvent[] = existingRaw ? JSON.parse(existingRaw) : [];
    events.unshift(event);
    // Keep last 200 events
    localStorage.setItem("milito_analytics_events", JSON.stringify(events.slice(0, 200)));

    // Emit custom event for live dashboard listeners
    window.dispatchEvent(new CustomEvent("milito_funnel_event", { detail: event }));
  } catch (err) {
    console.debug("[Analytics] Event tracking error:", err);
  }
}


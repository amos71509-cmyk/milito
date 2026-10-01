export const PRODUCTION_RENDER_BACKEND = "https://milito.onrender.com";

let cachedWorkingApiBase: string | null = null;

export function setWorkingApiBase(base: string) {
  if (base && typeof base === "string") {
    cachedWorkingApiBase = base.replace(/\/+$/, "");
    console.log(`[API] Cached working backend URL: ${cachedWorkingApiBase}`);
  }
}

export function getWorkingApiBase(): string | null {
  return cachedWorkingApiBase;
}

/**
 * Resolves the primary API endpoint dynamically based on environment.
 * - In local dev or Cloud Run / Express container with same-origin backend, uses relative path (e.g. /api/upload) for maximum speed.
 * - Direct Vite environment variable check (VITE_API_URL).
 * - Fallback to relative or production backend if running on external static hosts.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (cachedWorkingApiBase) {
    return `${cachedWorkingApiBase}${cleanPath}`;
  }

  // Direct Vite environment variable check
  const envApiUrl = String((import.meta as any)?.env?.VITE_API_URL || "").trim().replace(/\/+$/, "");

  if (envApiUrl) {
    if (typeof window !== "undefined" && window.location && window.location.origin) {
      if (envApiUrl === window.location.origin) {
        return cleanPath;
      }
    }
    return `${envApiUrl}${cleanPath}`;
  }

  // Always prefer relative paths inside browser environments with same-origin backend
  if (typeof window !== "undefined" && window.location) {
    const host = (window.location.hostname || "").toLowerCase();
    const isLocalOrContainer =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".run.app") ||
      host.includes("ai.studio") ||
      window.location.port === "3000";

    if (isLocalOrContainer) {
      return cleanPath;
    }

    // Default to relative cleanPath first to avoid slow 3rd-party cold boots
    return cleanPath;
  }

  return cleanPath;
}

/**
 * Returns prioritized list of candidate URLs for resilient connectivity without blocking on slow external servers.
 */
export function getApiFallbackUrls(path: string): string[] {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const candidates: string[] = [];

  // 1. Same-origin relative path is always the fastest and lowest latency
  candidates.push(cleanPath);

  if (cachedWorkingApiBase && !candidates.includes(`${cachedWorkingApiBase}${cleanPath}`)) {
    candidates.push(`${cachedWorkingApiBase}${cleanPath}`);
  }

  const primary = getApiUrl(cleanPath);
  if (!candidates.includes(primary)) {
    candidates.push(primary);
  }

  return candidates;
}





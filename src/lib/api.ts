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
 * - If VITE_API_URL is configured, prioritizes that configured URL.
 * - In production/preview environments (Netlify, custom domains, external preview), uses https://milito.onrender.com
 * - In local dev or Cloud Run container with same-origin backend, uses relative path (e.g. /api/upload)
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

  // Detect environment in browser
  if (typeof window !== "undefined" && window.location) {
    const host = (window.location.hostname || "").toLowerCase();
    // Both AI Studio dev (ais-dev-*.run.app) and share/preview (ais-pre-*.run.app) are full-stack Cloud Run containers hosting Express
    const isLocalOrContainer =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".run.app") ||
      host.includes("ai.studio");

    if (isLocalOrContainer) {
      return cleanPath;
    }

    // In production on Netlify, static hosting, or custom domains, directly route to Render
    return `${PRODUCTION_RENDER_BACKEND}${cleanPath}`;
  }

  return `${PRODUCTION_RENDER_BACKEND}${cleanPath}`;
}

/**
 * Returns prioritized list of candidate URLs to ensure resilient connectivity across environments.
 */
export function getApiFallbackUrls(path: string): string[] {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const candidates: string[] = [];

  if (cachedWorkingApiBase) {
    candidates.push(`${cachedWorkingApiBase}${cleanPath}`);
  }

  const primary = getApiUrl(cleanPath);
  if (!candidates.includes(primary)) {
    candidates.push(primary);
  }

  const renderUrl = `${PRODUCTION_RENDER_BACKEND}${cleanPath}`;
  if (!candidates.includes(renderUrl)) {
    candidates.push(renderUrl);
  }

  if (!candidates.includes(cleanPath)) {
    candidates.push(cleanPath);
  }

  return candidates;
}




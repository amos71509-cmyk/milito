const CACHE_NAME = "milito-2g-fast-v1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/discovery-cards/iphone.webp",
  "/discovery-cards/android.jpg",
  "/discovery-cards/ipad.jpg",
  "/discovery-cards/wrist.jpg"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Skip Firestore / API realtime endpoints
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Cache-first for static discovery cards, compiled JS/CSS assets, and Cloudinary thumbnails
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/discovery-cards/") ||
    url.hostname.includes("res.cloudinary.com") ||
    url.hostname.includes("fonts.gstatic.com");

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          const networkFetch = fetch(req)
            .then((res) => {
              if (res && (res.status === 200 || res.type === "opaque")) {
                cache.put(req, res.clone());
              }
              return res;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Stale-while-revalidate for navigation HTML shell so 2G opens in 0ms
  if (req.mode === "navigate") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match("/index.html").then((cached) => {
          const networkFetch = fetch(req)
            .then((res) => {
              if (res && res.status === 200) {
                cache.put("/index.html", res.clone());
              }
              return res;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
  }
});

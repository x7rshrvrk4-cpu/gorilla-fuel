// Gorilla Fuel Service Worker — gf-v5
// CRITICAL: Never intercept cross-origin requests.
// iOS Safari throws "response by service worker has restrictions" when
// respondWith() is called for a request to a different origin.

const CACHE_VERSION = "gf-v5";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Pages pre-cached for offline access
const SHELL_URLS = ["/", "/scan", "/alcohol", "/approved", "/cheat", "/avoid"];

// ── Install: pre-cache app shell ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.allSettled(SHELL_URLS.map((url) => cache.add(url)))
      )
  );
  // Replace any existing service worker immediately — do not wait for all tabs to close.
  self.skipWaiting();
});

// ── Activate: evict all caches from previous versions ─────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  // Take control of all open pages immediately.
  self.clients.claim();
});

// ── Fetch: strict cross-origin guard ─────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ── GUARD 1: Never intercept cross-origin requests ────────────────────────
  // This is the fix for the iOS Safari PWA error:
  //   "The FetchEvent for '...' resulted in a network error response:
  //    a response with a type of 'opaque'..." or
  //   "response by service worker has restrictions"
  // Returning without calling respondWith() lets the browser handle the
  // request natively, opening the external URL in Safari as expected.
  if (url.origin !== self.location.origin) {
    return;
  }

  // ── GUARD 2: Only cache GET requests ─────────────────────────────────────
  if (request.method !== "GET") {
    return;
  }

  // ── GUARD 3: Skip API routes — always fetch fresh ────────────────────────
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // ── Static assets: cache-first ───────────────────────────────────────────
  // Next.js embeds a content hash in all /_next/static/ filenames, so these
  // are safe to cache forever — a changed asset gets a new URL.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches
              .open(STATIC_CACHE)
              .then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Navigation requests: network-first, fall back to cached page or shell ─
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached ?? caches.match("/"))
        )
    );
    return;
  }

  // ── Everything else: network-first with cache fallback ────────────────────
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches
            .open(RUNTIME_CACHE)
            .then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

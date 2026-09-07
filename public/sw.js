/* OSSZ Collections service worker.
 *
 * Deliberately conservative. An earlier version cached HTML navigations, which
 * caused a serious failure: a browser could hold a cached page from an old
 * build whose embedded server-action IDs no longer existed. Sign-in and every
 * other form then failed with "Failed to find Server Action", surfacing as a
 * generic error page.
 *
 * HTML is therefore NEVER cached now. Only content-hashed build assets and
 * optimised images are cached, plus the offline page as a fallback. Those are
 * immutable, so they can never go stale in a harmful way.
 */
const VERSION = "ossz-v5";
const STATIC_CACHE = `${VERSION}-static`;
const IMAGE_CACHE = `${VERSION}-images`;
const OFFLINE_URL = "/offline";

// Never touched by the cache: anything personal, transactional, or dynamic.
const NEVER = [/^\/api\//, /^\/admin/, /^\/account/, /^\/checkout/, /^\/cart/, /^\/login/, /^\/register/];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((c) => c.addAll([OFFLINE_URL, "/manifest.webmanifest"]).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER.some((re) => re.test(url.pathname))) return;

  // React Server Component payloads must always be live.
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  // Documents: always network. Fall back to the offline page only when the
  // network genuinely fails — never to a cached copy of a previous build.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Content-hashed build output — safe to cache first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Optimised images — stale-while-revalidate.
  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || network;
      }),
    );
  }
});

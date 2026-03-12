const CACHE = "vpe-mobile-shell-v5";
const SHELL_ASSETS = [
  "./",
  "index.html",
  "mobile.css?v=20260312-7",
  "offline.html",
  "../js/client_logic_full.js?v=20260312-7",
  "../js/action-buttons.js?v=20260312-7",
  "../js/section-visibility.js?v=20260312-7",
  "js/mobile-shell.js?v=20260312-7",
  "../config/style-presets.json",
  "../config/prompt-templates.json",
  "../config/engine-capabilities.json",
  "../config/taxonomy-rules.json",
  "../config/ui-buttons.json"
];

function resolveScopeUrl(relativePath) {
  return new URL(relativePath, self.registration.scope).toString();
}

function getOfflineUrl() {
  return resolveScopeUrl("offline.html");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL_ASSETS.map(resolveScopeUrl))).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return caches.match(getOfflineUrl());
    })
  );
});

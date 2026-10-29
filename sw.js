/* Wetterbank service worker: keeps the app working offline.
   Weather requests always go to the network and are never cached. */
const VERSION = "wb-v4";
const FILES = [
  "./", "./index.html", "./privacy.html", "./app/", "./app/index.html",
  "./css/wb.css", "./js/config.js", "./js/wetterbank.js", "./js/collect.js", "./js/encounter.js", "./js/sit.js",
  "./manifest.webmanifest",
  "./assets/icon.svg", "./assets/icon-180.png", "./assets/icon-192.png",
  "./assets/icon-512.png", "./assets/icon-maskable-512.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  /* Network first, so updates show up; cache as fallback when offline. */
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      if (res.ok) caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

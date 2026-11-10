/* Bee's Limpieza · service worker: app instalable, funciona con mala señal y recibe avisos. */
const CACHE = "bees-limpieza-v4";
const SHELL = ["/", "/index.html", "/app.js", "/shared.js", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Primero la red (para recibir mejoras al momento); si no hay señal, lo guardado. Las peticiones a la API nunca se guardan. */
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match("/index.html")))
  );
});

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: "Bee's Limpieza", body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Bee's Limpieza", {
    body: d.body || "",
    tag: d.tag,
    renotify: !!d.tag,
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    vibrate: [180, 80, 180],
    data: { url: d.url || "/" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) { if ("focus" in c) return c.focus(); }
    return self.clients.openWindow(target);
  }));
});

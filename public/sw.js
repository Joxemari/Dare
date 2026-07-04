/*
 * Service worker de DARE — PWA instalable + offline.
 *
 * Estrategia (elegida a propósito para un rollout de feedback):
 *   - NAVEGACIÓN (documento HTML): network-first. Online siempre sirve el último
 *     deploy, así los amigos que instalan la app NO se quedan clavados en una
 *     versión vieja cuando publicas cambios. Offline cae al HTML cacheado.
 *   - ASSETS estáticos (JS/CSS/fuentes/PNG): cache-first. Vite los emite con
 *     hash de contenido (inmutables), así que cachear-y-servir es seguro y rápido,
 *     y da offline tras la primera carga.
 *
 * BASE se deriva del scope del propio SW (servido en /Dare/sw.js → scope /Dare/),
 * de modo que no duplicamos el `base: '/Dare/'` de vite.config.ts.
 *
 * CACHE lleva versión: al activar, se purgan las caches viejas. Si cambia la
 * estrategia o el shell, súbela (dare-v3, …).
 *
 * NOTIFICACIONES: además de la PWA, el SW gestiona el clic del recordatorio
 * diario (`notificationclick`) para enfocar/abrir la app. El disparo del
 * recordatorio lo hace la app (frontera `src/lib/notify.ts`) mientras está
 * viva; sin backend no hay push con la app cerrada. Ver CLAUDE.md.
 */
const CACHE = "dare-v2";
const BASE = new URL("./", self.location).pathname; // "/Dare/"
const SHELL = BASE; // documento raíz de la SPA

self.addEventListener("install", (event) => {
  // Activar de inmediato el SW nuevo (junto a clients.claim en activate).
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.add(SHELL)).catch(() => {}));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Clic en el recordatorio diario: enfoca una ventana ya abierta o abre una
// nueva en la URL que la app adjuntó en `data.url`.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || BASE;
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((cs) => {
        for (const c of cs) {
          if ("focus" in c) return c.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
      })
      .catch(() => {}),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // solo mismo origen

  // El script del SW y el manifest se dejan a la lógica nativa del navegador
  // (comprobación de actualización), nunca a la cache de assets.
  if (url.pathname.endsWith("/sw.js") || url.pathname.endsWith("/manifest.webmanifest")) return;

  const isNavigation = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    // network-first: último deploy si hay red; si no, shell cacheado.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(SHELL, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match(SHELL))),
    );
    return;
  }

  // cache-first para assets (hasheados → inmutables).
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // Solo cachear respuestas básicas OK (evita opaques/errores).
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    }),
  );
});

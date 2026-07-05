/* ============================================================
   DARE — recordatorio local (frontera con efectos).

   Impuro POR DISEÑO: habla con `Notification`, con el service
   worker y con el reloj, así que vive fuera de los módulos puros
   de `src/lib` y NO se testea unitariamente (misma categoría que
   `feedback.ts`/`storage.ts`). La DECISIÓN de qué franja avisar
   (`dueSlot`) y el CONTENIDO (`buildReminder`) son puros y
   viven en `briefing.ts`, con sus tests.

   Límite honesto (sin backend): esto es un recordatorio LOCAL. Se
   muestra de forma fiable mientras la pestaña está viva (la app
   comprueba la hora al abrir/enfocar y cada minuto). El push con la
   app CERRADA necesita servidor push + VAPID → diferido a cuando
   DARE tenga backend (ver docs/social-layer.md y CLAUDE.md).
   ============================================================ */

/** El tag agrupa/colapsa el recordatorio diario (no apila duplicados). */
const TAG = "dare-daily";

/** ¿Soporta el navegador notificaciones? */
export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/** Estado del permiso, o "unsupported" si el navegador no lo tiene. */
export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

/** Pide permiso (idempotente si ya está concedido/denegado). */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/**
 * Muestra el recordatorio. Prefiere el service worker (persiste aunque el
 * navegador colapse la pestaña y permite `notificationclick`); si no hay SW
 * disponible, cae a `new Notification`. Devuelve true si se mostró.
 */
export async function showReminderNotification(
  title: string,
  body: string,
  url: string,
): Promise<boolean> {
  if (notificationPermission() !== "granted") return false;
  const icon = `${import.meta.env.BASE_URL}icons/icon-192.png`;
  const options: NotificationOptions = {
    body,
    icon,
    badge: icon,
    tag: TAG,
    // `data` viaja al handler `notificationclick` del SW para enfocar/abrir.
    data: { url },
  };
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return true;
    }
  } catch {
    /* cae al fallback */
  }
  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

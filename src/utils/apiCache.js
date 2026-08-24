/**
 * Caché de respuestas de la API con expiración de 10 minutos.
 *
 * Usa sessionStorage a propósito: sobrevive a recargas de la pestaña (que es el
 * caso de uso) pero se limpia al cerrarla, así no quedan datos de un evento —ni
 * de un usuario— colgando en un equipo compartido. Aun así, `clearApiCache()` se
 * invoca al cerrar sesión.
 */

const PREFIX = "macak:cache:";
export const CACHE_TTL_MS = 10 * 60 * 1000;

/** Devuelve la respuesta cacheada, o null si no existe o ya expiró. */
export function readCache(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { savedAt, value } = JSON.parse(raw);
    if (!savedAt || Date.now() - savedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(PREFIX + key);
      return null;
    }
    return value;
  } catch {
    // JSON corrupto o storage no disponible: se trata como fallo de caché.
    return null;
  }
}

export function writeCache(key, value) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), value }));
  } catch {
    // Sin cuota o en modo privado: seguir sin cachear no es un error.
  }
}

/** Edad de la entrada en ms, o null si no hay nada válido. */
export function cacheAge(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { savedAt } = JSON.parse(raw);
    const age = Date.now() - savedAt;
    return age > CACHE_TTL_MS ? null : age;
  } catch {
    return null;
  }
}

/** Vacía la caché entera. Se llama al cerrar sesión. */
export function clearApiCache() {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // nada que hacer
  }
}

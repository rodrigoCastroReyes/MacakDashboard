import axios from "axios";

/**
 * Contador de peticiones en vuelo.
 *
 * Se engancha a los interceptores globales de axios en lugar de exponer un
 * estado por pantalla: así cuentan también los refrescos y las páginas que pide
 * `usePagedAxios`, que ocurren cuando la tabla ya está pintada y hasta ahora no
 * daban ninguna señal de que algo estuviera pasando.
 *
 * Es un store externo mínimo (sin contexto de React) para que incrementar el
 * contador no vuelva a renderizar el árbol entero: solo se suscribe la barra.
 */

let pending = 0;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Snapshot para useSyncExternalStore: un número, comparable por identidad. */
export const getPendingCount = () => pending;

const settle = () => {
  // Nunca por debajo de cero: una respuesta sin su petición (por ejemplo si se
  // cancela) dejaría el contador negativo y la barra no se apagaría jamás.
  pending = Math.max(0, pending - 1);
  emit();
};

// Sin manejador de error: aquí solo se llega si un interceptor anterior rechazó,
// y en ese caso la petición nunca llegó a contarse.
axios.interceptors.request.use((config) => {
  pending += 1;
  emit();
  return config;
});

axios.interceptors.response.use(
  (response) => {
    settle();
    return response;
  },
  (error) => {
    settle();
    return Promise.reject(error);
  }
);

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { readCache, writeCache } from "utils/apiCache";

const DEFAULT_PAGE_SIZE = 100;

// Cinturón de seguridad: ningún token del evento se acerca a esto, pero evita
// un bucle infinito si el backend empieza a devolver páginas para siempre.
const MAX_PAGES = 100;

/**
 * GET sobre un endpoint paginado que recorre todas las páginas y devuelve la
 * respuesta ya unida.
 *
 * `/dashboard/token` responde solo con los 10 movimientos más recientes si no
 * se le pasan `page` y `limit`, así que el historial de las pulseras activas
 * salía cortado.
 *
 * El recorrido para cuando una página no aporta elementos nuevos, no cuando
 * devuelve menos de los pedidos. La diferencia importa: si el servidor recorta
 * `limit` por su cuenta (pedimos 100 y sirve 10), la segunda condición daría la
 * lectura por terminada en la primera página y perderíamos el resto sin avisar.
 * Y si además ignorase `page`, todas las páginas repetirían lo mismo: por eso se
 * corta también cuando una página entera resulta ser duplicada.
 */
const usePagedAxios = (baseUrl, { itemsKey = "transactions", pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const cacheKey = baseUrl ? `${baseUrl}&__all=${pageSize}` : null;

  const [state, setState] = useState(() => {
    const hit = cacheKey ? readCache(cacheKey) : null;
    return { data: hit, loading: !hit && Boolean(baseUrl), error: null };
  });

  const skipNextFetch = useRef(state.data !== null);

  const fetchAll = useCallback(
    async ({ force = false } = {}) => {
      if (!baseUrl) return;

      if (!force) {
        const hit = readCache(cacheKey);
        if (hit) {
          setState({ data: hit, loading: false, error: null });
          return;
        }
      }

      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const separator = baseUrl.includes("?") ? "&" : "?";
        const seen = new Set();
        const items = [];
        let envelope = null;

        // `page` es 0-indexado: el desplazamiento es page * limit, así que
        // empezar en 1 se saltaba el primer bloque entero (comprobado: con
        // page=1&limit=100 el token llega pero la lista viene vacía).
        for (let page = 0; page < MAX_PAGES; page += 1) {
          // eslint-disable-next-line no-await-in-loop -- la página N+1 no se
          // puede pedir sin saber si la N venía vacía.
          const response = await axios.get(`${baseUrl}${separator}page=${page}&limit=${pageSize}`);
          if (response.status !== 200) {
            throw new Error(`Request failed with status ${response.status}`);
          }
          if (!envelope) envelope = response.data;

          const batch = response.data?.[itemsKey] || [];
          if (batch.length === 0) break;

          let added = 0;
          batch.forEach((item) => {
            const id = item?._id;
            if (id && seen.has(id)) return;
            if (id) seen.add(id);
            items.push(item);
            added += 1;
          });

          if (added === 0) break;
        }

        const merged = { ...envelope, [itemsKey]: items };
        writeCache(cacheKey, merged);
        setState({ data: merged, loading: false, error: null });
      } catch (err) {
        setState((s) => ({ ...s, loading: false, error: err }));
      }
    },
    [baseUrl, cacheKey, itemsKey, pageSize]
  );

  useEffect(() => {
    if (!baseUrl) return;
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    fetchAll();
  }, [baseUrl, fetchAll]);

  const refetch = useCallback(() => fetchAll({ force: true }), [fetchAll]);

  return { data: state.data, loading: state.loading, error: state.error, refetch };
};

export default usePagedAxios;

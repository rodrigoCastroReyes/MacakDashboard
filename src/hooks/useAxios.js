import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

import { readCache, writeCache } from "utils/apiCache";

/**
 * GET con caché de 10 minutos (ver utils/apiCache).
 *
 * En el primer render sirve la respuesta cacheada si sigue vigente, evitando
 * la petición. `refetch()` siempre ignora la caché y trae datos frescos, que es
 * lo que hacen los botones de "Actualizar".
 */
const useAxios = (url, { cache = true } = {}) => {
  // Inicialización perezosa: la caché se lee una sola vez, no en cada render.
  const [state, setState] = useState(() => {
    const hit = cache && url ? readCache(url) : null;
    return { data: hit, loading: !hit && Boolean(url), error: null };
  });

  // Si ya servimos desde caché, el efecto de montaje no debe volver a pedir.
  const skipNextFetch = useRef(state.data !== null);

  const fetchData = useCallback(
    async ({ force = false } = {}) => {
      if (!url) return;

      if (!force && cache) {
        const hit = readCache(url);
        if (hit) {
          setState({ data: hit, loading: false, error: null });
          return;
        }
      }

      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const response = await axios.get(url);
        if (response.status !== 200) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        if (cache) writeCache(url, response.data);
        setState({ data: response.data, loading: false, error: null });
      } catch (err) {
        setState((s) => ({ ...s, loading: false, error: err }));
      }
    },
    [url, cache]
  );

  useEffect(() => {
    if (!url) return;
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    fetchData();
  }, [url, fetchData]);

  // Forzado: los botones de "Actualizar" deben saltarse la caché.
  const refetch = useCallback(() => fetchData({ force: true }), [fetchData]);

  return { data: state.data, loading: state.loading, error: state.error, refetch };
};

export default useAxios;

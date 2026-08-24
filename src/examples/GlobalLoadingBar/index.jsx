import { useEffect, useState, useSyncExternalStore } from "react";

import LinearProgress from "@mui/material/LinearProgress";

import MDBox from "components/MDBox";

import { subscribe, getPendingCount } from "utils/requestActivity";

// Las respuestas servidas desde caché no pasan por axios, pero las rápidas sí:
// sin esta espera la barra daría un fogonazo en cada petición de 80 ms.
const SHOW_AFTER_MS = 150;

/**
 * Barra de progreso fija en la parte superior mientras haya peticiones en vuelo.
 *
 * Cubre lo que los mensajes de "Cargando…" no pueden: los refrescos y los
 * cambios de tienda, en los que la pantalla ya tiene contenido y no había
 * ninguna señal de que se estuvieran pidiendo datos nuevos.
 */
function GlobalLoadingBar() {
  const pending = useSyncExternalStore(subscribe, getPendingCount, getPendingCount);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pending) {
      setVisible(false);
      return undefined;
    }
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [pending]);

  if (!visible) return null;

  return (
    <MDBox
      role="status"
      aria-live="polite"
      aria-label="Cargando datos"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        // Por encima del sidenav fijo y de cualquier menú desplegado.
        zIndex: ({ zIndex }) => zIndex.tooltip + 1,
      }}
    >
      <LinearProgress
        color="info"
        sx={{ height: 3, borderRadius: 0, backgroundColor: "transparent" }}
      />
    </MDBox>
  );
}

export default GlobalLoadingBar;

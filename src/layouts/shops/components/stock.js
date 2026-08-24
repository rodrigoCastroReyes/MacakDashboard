/**
 * Estados de existencias de un producto.
 *
 * La distinción clave es entre "sin registrar" y "agotado": en este evento 42 de
 * las 43 tiendas no tienen ninguna entrada de inventario (el endpoint responde
 * 404), así que tratar la ausencia de dato como "agotado" encendería una alarma
 * roja en todas las tiendas a la vez. Una alarma siempre encendida no informa.
 */

export const LOW_STOCK_THRESHOLD = 5;

export const STOCK_STATES = {
  untracked: { label: "Sin registrar", color: "secondary", icon: "remove" },
  out: { label: "Agotado", color: "error", icon: "cancel" },
  low: { label: "Bajo", color: "warning", icon: "error_outline" },
  ok: { label: "En stock", color: "success", icon: "check_circle" },
};

export const stockStateOf = (quantity) => {
  if (quantity === undefined || quantity === null) return "untracked";
  if (quantity <= 0) return "out";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
};

/** Recuento por estado para las métricas de la cabecera. */
export const summarizeStock = (products, inventory) => {
  const counts = { untracked: 0, out: 0, low: 0, ok: 0 };
  products.forEach((p) => {
    counts[stockStateOf(inventory[p._id])] += 1;
  });
  return {
    ...counts,
    total: products.length,
    inStock: counts.ok + counts.low,
    // La tienda lleva inventario solo si algún producto tiene cantidad registrada.
    tracked: products.length > 0 && counts.untracked < products.length,
  };
};

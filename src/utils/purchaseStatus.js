/**
 * Estado de pago de las órdenes de boletería.
 *
 * La ticketera crea la orden y sus boletos ANTES de cobrar, y recién marca
 * "completed" cuando PayPhone confirma. Por eso un intento abandonado queda
 * guardado como una orden más: sin este filtro, el dashboard lo mostraba y lo
 * sumaba como si fuera una venta.
 *
 * Sin pagar = "pending" o "error". Ojo: NO es "distinto de completed". Las
 * órdenes anteriores a que existiera el campo tienen estado nulo y son ventas
 * reales (por ejemplo, las 948 del Oktoberfest 2025), así que cuentan como
 * pagadas.
 */
export const UNPAID_STATUSES = ["pending", "error"];

/** true si la orden no llegó a pagarse. Recibe el purchase_ticket. */
export const isUnpaidPurchase = (purchaseTicket) =>
  UNPAID_STATUSES.includes(purchaseTicket?.status);

/**
 * Separa las filas de `GET /purchase_ticket/event` (cada una trae
 * `purchase_ticket` y `purchase_ticket_items`) en pagadas y sin pagar.
 */
export const splitPurchasesByPayment = (rows = []) => {
  const paid = [];
  const unpaid = [];
  for (const row of rows) {
    (isUnpaidPurchase(row?.purchase_ticket) ? unpaid : paid).push(row);
  }
  return { paid, unpaid };
};

/**
 * Boletos realmente vendidos por localidad, contando solo órdenes pagadas.
 * Devuelve un objeto { [nombre de la localidad]: cantidad }; los ítems traen
 * el nombre de la localidad, no su id.
 */
export const countSoldByTicketName = (rows = []) => {
  const sold = {};
  for (const row of splitPurchasesByPayment(rows).paid) {
    for (const item of row?.purchase_ticket_items || []) {
      const name = item?.ticket;
      if (name) sold[name] = (sold[name] || 0) + 1;
    }
  }
  return sold;
};

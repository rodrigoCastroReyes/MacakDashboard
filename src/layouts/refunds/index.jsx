import AnnulmentList from "layouts/annulments/AnnulmentList";

import { API_BASE_URL } from "config";

/** Compras anuladas: el punto de venta devolvió el importe a la pulsera. */
function RefundedTransactions() {
  const eventId = localStorage.getItem("eventId");

  return (
    <AnnulmentList
      mainTitle="Reembolsos"
      endpoint={`${API_BASE_URL}/dashboard/order_anulled?event_id=${eventId}`}
      tableTitle="Compras anuladas"
      countLabel={["reembolso", "reembolsos"]}
      totalLabel="Total reembolsado"
      totalCaption="devuelto a las pulseras"
      actorLabel="Punto de venta"
      actorPluralLabel="Puntos de venta"
      emptyMessage="No hay reembolsos en este evento"
    />
  );
}

export default RefundedTransactions;

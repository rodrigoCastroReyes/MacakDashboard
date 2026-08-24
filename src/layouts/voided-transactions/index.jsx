import AnnulmentList from "layouts/annulments/AnnulmentList";

import { API_BASE_URL } from "config";

/** Recargas anuladas: el cajero revirtió una carga de saldo. */
function VoidedTransactions() {
  const eventId = localStorage.getItem("eventId");

  return (
    <AnnulmentList
      mainTitle="Anulaciones"
      endpoint={`${API_BASE_URL}/dashboard/recharge_anulled?event_id=${eventId}`}
      tableTitle="Recargas anuladas"
      countLabel={["anulación", "anulaciones"]}
      totalLabel="Total anulado"
      totalCaption="saldo revertido de las recargas"
      actorLabel="Cajero"
      actorPluralLabel="Cajeros"
      emptyMessage="No hay recargas anuladas en este evento"
    />
  );
}

export default VoidedTransactions;

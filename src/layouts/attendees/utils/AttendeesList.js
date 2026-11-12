import { API_BASE_URL } from "config";
import { isUnpaidPurchase } from "utils/purchaseStatus";
import { downloadExcel } from "utils/excel";

export async function downloadAttendeesAsExcel(eventId) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/purchase_ticket/attender_event?id=${eventId}`
    );
    const attendees = await res.json();

    const headers = [
      "Nombre Completo",
      "Numero de Cedula",
      "Correo Electronico",
      "Tickets Adquiridos",
      "Tokens Registrados",
    ];

    const rowsWithEmpties = await Promise.all(
      attendees.map(async (attendee) => {
        const { _id, full_name, id_document, email } = attendee;

        const ticketRes = await fetch(
          `${API_BASE_URL}/purchase_ticket/by_attender_event?attender_id=${_id}&event_id=${eventId}`
        );
        const ticketData = await ticketRes.json();

        // Solo compras pagadas: las ordenes se crean antes de cobrar, asi que
        // contar todas inflaria los boletos de quien abandono el pago.
        const paidPurchases = (ticketData.purchase_tickets || []).filter(
          (ticket) => !isUnpaidPurchase(ticket)
        );
        if (paidPurchases.length === 0) {
          return null;
        }

        const ticketCount = paidPurchases.reduce(
          (acc, ticket) => acc + (ticket.purchase_ticket_items?.length || 0),
          0
        );

        const tokenRes = await fetch(
          `${API_BASE_URL}/token/by_attender_event?attender_id=${_id}&event_id=${eventId}`
        );
        const tokens = await tokenRes.json();
        const tokenCount = tokens?.length || 0;

        return [full_name, id_document, email, ticketCount, tokenCount];
      })
    );

    // Fuera quienes no llegaron a pagar ninguna compra.
    const rows = rowsWithEmpties.filter(Boolean);

    const today = new Date().toISOString().split("T")[0]; // formato YYYY-MM-DD
    downloadExcel(
      `ListaAsistentes_${today}.xlsx`,
      headers,
      rows,
      "Asistentes"
    );
  } catch (error) {
    console.error("Error al descargar los datos:", error);
    alert("Ocurrió un error al generar el archivo Excel.");
  }
}

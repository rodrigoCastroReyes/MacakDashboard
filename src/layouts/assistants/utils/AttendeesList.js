import { API_BASE_URL } from "config";

export async function downloadAttendeesAsCSV(eventId) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/purchase_ticket/attender_event?id=${eventId}`
    );
    const attendees = await res.json();

    const headers = [
      "Nombre Completo",
      "Numero de Cedula",
      "Correo Electronico",
      "Fecha de Registro",
      "Tickets Adquiridos",
      "Tokens Registrados",
    ];

    const rows = await Promise.all(
      attendees.map(async (attendee) => {
        const { _id, full_name, id_document, email } = attendee;

        const ticketRes = await fetch(
          `${API_BASE_URL}/purchase_ticket/by_attender_event?attender_id=${_id}&event_id=${eventId}`
        );
        const ticketData = await ticketRes.json();

        const createdDate = new Date(
          ticketData.attender?.created_time || 0
        ).toLocaleDateString("es-EC");

        const ticketCount =
          ticketData.purchase_tickets?.reduce((acc, ticket) => {
            return acc + (ticket.purchase_ticket_items?.length || 0);
          }, 0) || 0;

        const tokenRes = await fetch(
          `${API_BASE_URL}/token/by_attender_event?attender_id=${_id}&event_id=${eventId}`
        );
        const tokens = await tokenRes.json();
        const tokenCount = tokens?.length || 0;

        return [
          full_name,
          id_document,
          email,
          createdDate,
          ticketCount,
          tokenCount,
        ];
      })
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const today = new Date().toISOString().split("T")[0]; // formato YYYY-MM-DD
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ListaAsistentes_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error al descargar los datos:", error);
    alert("Ocurrió un error al generar el archivo CSV.");
  }
}

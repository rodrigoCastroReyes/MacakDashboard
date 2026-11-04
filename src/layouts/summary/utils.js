import moment from "moment";

/** "9" -> "09:00" */
export const HL = (hour) => `${String(hour).padStart(2, "0")}:00`;

/** "09:00 – 10:00" */
export const hourRange = (hour) => `${HL(hour)} – ${HL((hour + 1) % 24)}`;

/**
 * Las horas sin ventas no vienen del backend: se rellenan con 0 para que el
 * eje X sea continuo y un hueco se vea como hueco, no como una línea recta.
 * Recibe y devuelve filas { date: "YYYY-MM-DD", hour, total, orders }.
 */
export const fillHours = (rows) => {
  if (!rows.length) return [];
  const key = (r) => `${r.date} ${r.hour}`;
  const byKey = new Map(rows.map((r) => [key(r), r]));
  const at = (r) => moment(`${r.date} ${HL(r.hour)}`, "YYYY-MM-DD HH:mm");
  const last = at(rows[rows.length - 1]);
  const out = [];
  for (const t = at(rows[0]); !t.isAfter(last); t.add(1, "hour")) {
    const date = t.format("YYYY-MM-DD");
    const hour = t.hour();
    out.push(byKey.get(`${date} ${hour}`) || { date, hour, total: 0, orders: 0 });
  }
  return out;
};

/**
 * "18/10 · " para las horas que caen en un día distinto del primero, y nada para
 * las del primer día: un evento que pasa de medianoche no necesita la fecha en
 * todas las filas, solo en las de la madrugada siguiente.
 */
export const dayPrefix = (row, firstDate) =>
  row.date === firstDate ? "" : `${moment(row.date).format("DD/MM")} · `;

/** Fila con el mayor valor de `key`, o null si todas están en 0. */
export const peakBy = (rows, key) =>
  rows.reduce((best, row) => (row[key] > (best ? best[key] : 0) ? row : best), null);

/**
 * Descarga un CSV generado en el navegador.
 *
 * Lleva BOM UTF-8: sin él, Excel abre el archivo como ANSI y muestra
 * "CervecerÃ­a" en vez de "Cervecería". Los valores con coma, comillas o
 * saltos de línea van entre comillas, como pide el formato.
 *
 * @param {string} filename  nombre del archivo, con .csv
 * @param {string[]} headers fila de encabezados
 * @param {Array<Array<string|number>>} rows filas de datos
 */
export function downloadCsv(filename, headers, rows) {
  const escape = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [headers, ...rows].map((row) => row.map(escape).join(","));
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

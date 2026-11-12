import * as XLSX from "xlsx";

/**
 * Descarga un archivo Excel (.xlsx) generado en el navegador.
 *
 * Reemplaza al antiguo CSV: el .xlsx abre directo en Excel sin problemas de
 * codificación (acentos) ni de separadores por configuración regional, y
 * respeta los tipos (los números quedan como números, no como texto).
 *
 * @param {string} filename   nombre del archivo, con .xlsx
 * @param {string[]} headers  fila de encabezados
 * @param {Array<Array<string|number>>} rows filas de datos
 * @param {string} [sheetName="Hoja1"] nombre de la hoja
 */
export function downloadExcel(filename, headers, rows, sheetName = "Hoja1") {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  // Excel limita el nombre de hoja a 31 caracteres.
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename);
}

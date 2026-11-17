import { useState } from "react";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";
import axios from "axios";

import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import { API_BASE_URL } from "../../config";
import { esMoment } from "utils/datetime";

// Campos planos del attender, en el orden en que queremos las columnas fijas.
// Las observaciones (dinámicas) se añaden después, a la derecha.
const BASE_COLUMNS = [
  ["full_name", "Nombre completo"],
  ["email", "Email"],
  ["id_document", "Documento"],
  ["phone", "Teléfono"],
  ["payphone_id", "Payphone ID"],
  ["attender_id", "ID Asistente"],
];

/**
 * Aplana el arreglo de asistentes de Payphone a una matriz lista para Excel.
 *
 * Cada asistente trae un arreglo `observations` ([{name, value}]) cuyo juego de
 * nombres varía entre registros (p. ej. "Curso", "nombre_estudiante"). Para que
 * todas las filas compartan las mismas columnas, primero se recolectan todos los
 * nombres de observación presentes en el dataset y luego cada fila rellena el
 * valor correspondiente (vacío si ese registro no lo tiene).
 */
const flattenAttenders = (attenders = []) => {
  // Nombres de observación únicos, preservando el orden de aparición.
  const observationKeys = [];
  attenders.forEach((a) => {
    (a.observations || []).forEach((o) => {
      if (o?.name && !observationKeys.includes(o.name)) observationKeys.push(o.name);
    });
  });

  const rows = attenders.map((a) => {
    const row = {};
    BASE_COLUMNS.forEach(([key, label]) => {
      row[label] = a[key] ?? "";
    });
    row["Fecha de compra"] = a.purchase_date
      ? esMoment(a.purchase_date).format("DD/MM/YYYY HH:mm:ss")
      : "";

    const byName = Object.fromEntries((a.observations || []).map((o) => [o.name, o.value]));
    observationKeys.forEach((name) => {
      row[name] = byName[name] ?? "";
    });
    return row;
  });

  return rows;
};

/**
 * Botón de descarga del reporte de asistentes pagados con Payphone, en Excel.
 *
 * Pide los datos al endpoint solo al pulsar (no es información que se muestre en
 * pantalla) y genera el .xlsx con las observaciones aplanadas a columnas.
 */
function PayphoneAttendersReport({ id_event }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!id_event || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/payphone_attenders?event_id=${id_event}`
      );

      const rows = flattenAttenders(Array.isArray(data) ? data : []);
      if (!rows.length) {
        setError("No hay asistentes de Payphone para este evento.");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Asistentes Payphone");
      XLSX.writeFile(wb, `Asistentes_Payphone_${esMoment().format("YYYYMMDD_HHmmss")}.xlsx`);
    } catch (err) {
      console.error("Error al descargar el reporte de asistentes Payphone:", err);
      setError("No se pudo generar el reporte. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBox display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
      <MDButton
        variant="gradient"
        color="info"
        size="small"
        onClick={handleDownload}
        disabled={loading || !id_event}
        startIcon={<Icon>{loading ? "hourglass_empty" : "download"}</Icon>}
      >
        {loading ? "Generando…" : "Descargar asistentes (Payphone)"}
      </MDButton>
      {error && (
        <MDTypography variant="caption" color="error">
          {error}
        </MDTypography>
      )}
    </MDBox>
  );
}

PayphoneAttendersReport.propTypes = {
  id_event: PropTypes.string,
};

export default PayphoneAttendersReport;

// layouts/resumen/components/StoreHero.js
import React, { useMemo } from "react";
import useAxios from "hooks/useAxios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { API_BASE_URL } from "../../../config";

function StoreHero({ id_store, store_name }) {
  const { data, loading } = useAxios(
    `${API_BASE_URL}/dashboard/sales_by_hour?store_id=${id_store}`
  );

  const stats = useMemo(() => {
    if (!data?.sales_by_hour) return null;
    const hours   = [...data.sales_by_hour].sort((a, b) => a.hora - b.hora);
    const total   = hours.reduce((acc, d) => acc + d.total_ventas, 0);
    const ordenes = hours.reduce((acc, d) => acc + d.num_ordenes, 0);
    const pico    = hours.reduce((a, b) => (a.total_ventas > b.total_ventas ? a : b));
    const HL      = (h) => `${String(h).padStart(2, "0")}:00`;
    const picoEnd = pico.hora === 23 ? "00:00" : HL(pico.hora + 1);
    return {
      total, ordenes, pico,
      picoRange:   `${HL(pico.hora)} – ${picoEnd}`,
      primeraHora: HL(hours[0].hora),
      ultimaHora:  HL(hours[hours.length - 1].hora),
    };
  }, [data]);

  if (loading || !stats) return null;

  const fmt     = (v) => v.toLocaleString("es-EC", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtDec  = (v) => v.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ─── estilos inline (sin CSS externo, sin clases nuevas) ─── */
  const s = {
    wrap: {
      px: 3, pt: 2.5, pb: 2,
      borderBottom: "0.5px solid rgba(0,0,0,0.1)",
      mb: 2,
    },
    eyebrow: {
      fontSize: "10px",
      fontWeight: 500,
      letterSpacing: ".1em",
      textTransform: "uppercase",
      color: "text.secondary",
      mb: 1,
    },
    accentText: { color: "#1D9E75" },
    totalLabel: {
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: ".07em",
      color: "text.secondary",
      mb: "2px",
    },
    totalVal: {
      fontSize: "36px",
      fontWeight: 500,
      lineHeight: 1,
      letterSpacing: "-.5px",
    },
    divider: {
      width: "0.5px",
      bgcolor: "rgba(0,0,0,0.12)",
      alignSelf: "stretch",
      minHeight: "48px",
      flexShrink: 0,
      mx: 1,
    },
    rowLabel: {
      fontSize: "10px",
      textTransform: "uppercase",
      letterSpacing: ".07em",
      color: "text.secondary",
      minWidth: "86px",
    },
    rowVal: { fontSize: "13px", fontWeight: 500 },
    pill: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      background: "#E1F5EE",
      color: "#0F6E56",
      fontSize: "10px",
      fontWeight: 500,
      px: "8px",
      py: "1px",
      borderRadius: "10px",
      ml: 0.5,
    },
  };

  const MetaRow = ({ label, children }) => (
    <MDBox display="flex" alignItems="baseline" gap={0.75}>
      <MDTypography sx={s.rowLabel} component="span">{label}</MDTypography>
      {children}
    </MDBox>
  );

  return (
    <MDBox sx={s.wrap}>
      {/* Eyebrow */}
      <MDTypography sx={s.eyebrow}>
        <span style={s.accentText}>{store_name}</span>
        {" "}· reporte de ventas
      </MDTypography>

      {/* Cuerpo */}
      <MDBox display="flex" alignItems="flex-start" gap={3} flexWrap="wrap">

        {/* Total */}
        <MDBox>
          <MDTypography sx={s.totalLabel}>Ingresos totales</MDTypography>
          <MDTypography sx={s.totalVal}>
            <span style={{ fontSize: 20, color: "#888", marginRight: 1 }}>$</span>
            {fmt(stats.total)}
          </MDTypography>
        </MDBox>

        {/* Divisor */}
        <MDBox sx={s.divider} />

        {/* Meta */}
        <MDBox display="flex" flexDirection="column" gap={0.6} pt="2px">
          <MetaRow label="Órdenes">
            <MDTypography sx={s.rowVal}>{stats.ordenes.toLocaleString("es-EC")}</MDTypography>
          </MetaRow>

          <MetaRow label="Hora pico">
            <MDTypography sx={s.rowVal}>{stats.picoRange}</MDTypography>
            <MDBox sx={s.pill}>
              ⚡ ${fmtDec(stats.pico.total_ventas)} · {stats.pico.num_ordenes} órdenes
            </MDBox>
          </MetaRow>

          <MetaRow label="Horas activas">
            <MDTypography sx={s.rowVal}>
              {stats.primeraHora} – {stats.ultimaHora}
            </MDTypography>
          </MetaRow>
        </MDBox>

      </MDBox>
    </MDBox>
  );
}

export default StoreHero;
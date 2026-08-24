import { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import { Chip, Stack, IconButton, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import StateMessage from "examples/StateMessage";

import useAxios from "hooks/useAxios";
import useDownloadCard from "hooks/useDownloadCard";
import { CHART_PRIMARY } from "utils/chartColors";
import { formatNumber } from "utils/format";
import { API_BASE_URL } from "config";

const TODOS_COLOR = "#64748b";
const HL = (h) => (h === 0 ? "00:00" : `${String(h).padStart(2, "0")}:00`);
const hourRange = (h) => `${HL(h)} - ${HL(h === 23 ? 0 : h + 1)}`;

/**
 * Serie de tiempo de UNIDADES vendidas por hora. Es el equivalente en unidades
 * de SalesPerHour (que muestra ingresos); el heatmap de al lado responde otra
 * pregunta —en qué hora concentra cada producto— y no sustituye a esta vista.
 */
function UnitsPerHourAndProduct({ id_store, refreshToken = 0 }) {
  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/sales_by_hour_and_product?store_id=${id_store}`
  );

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    refetch();
  }, [refreshToken, refetch]);

  const cardRef = useRef();
  const { downloadCard } = useDownloadCard();
  const [selProd, setSelProd] = useState(null);

  const products = useMemo(() => {
    if (!data?.sales_by_hour_and_product) return [];
    return [...new Set(data.sales_by_hour_and_product.map((d) => d.producto))];
  }, [data]);

  const hours = useMemo(() => {
    if (!data?.sales_by_hour_and_product) return [];
    return [...new Set(data.sales_by_hour_and_product.map((d) => d.hora))].sort((a, b) => a - b);
  }, [data]);

  const chart = useMemo(() => {
    if (!data?.sales_by_hour_and_product) return { labels: [], datasets: [] };
    const raw = data.sales_by_hour_and_product;
    // Serie única: el color no codifica identidad (ver utils/chartColors).
    const color = CHART_PRIMARY;
    const line = {
      borderColor: color,
      pointBackgroundColor: color,
      borderWidth: 4,
      pointRadius: 5,
      datalabels: { anchor: "end", align: "top", offset: 4, font: { size: 11, weight: "500" } },
    };

    if (!selProd) {
      const byHour = hours.map((h) => ({
        hora: h,
        total: raw.filter((d) => d.hora === h).reduce((acc, d) => acc + d.num_ordenes, 0),
      }));
      return {
        labels: byHour.map((d) => HL(d.hora)),
        datasets: [{ label: "Unidades totales", data: byHour.map((d) => d.total), ...line }],
      };
    }

    const filtered = raw.filter((d) => d.producto === selProd).sort((a, b) => a.hora - b.hora);
    return {
      labels: filtered.map((d) => HL(d.hora)),
      datasets: [{ label: `Unidades ${selProd}`, data: filtered.map((d) => d.num_ordenes), ...line }],
    };
  }, [data, selProd, hours]);

  const prodStats = useMemo(() => {
    if (!selProd || !data?.sales_by_hour_and_product) return null;
    const filtered = data.sales_by_hour_and_product.filter((d) => d.producto === selProd);
    const totalUnits = filtered.reduce((acc, d) => acc + d.num_ordenes, 0);
    const peak = filtered.reduce((a, b) => (a.num_ordenes > b.num_ordenes ? a : b), {
      num_ordenes: 0,
      hora: 0,
    });
    const activeHours = filtered.filter((d) => d.num_ordenes > 0).length;
    return [
      { label: "Total unidades", value: formatNumber(totalUnits) },
      { label: "Hora pico", value: hourRange(peak.hora) },
      { label: "Unidades en pico", value: formatNumber(peak.num_ordenes) },
      { label: "Horas activas", value: formatNumber(activeHours) },
    ];
  }, [data, selProd]);

  if (loading) return <StateMessage state="loading" message="Cargando unidades por hora…" />;
  if (error) return <StateMessage state="error" />;
  if (!hours.length) return <StateMessage state="empty" message="Sin unidades registradas por hora" />;

  const total = data.sales_by_hour_and_product.reduce((acc, d) => acc + d.num_ordenes, 0);

  return (
    <MDBox p={2} ref={cardRef}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <MDTypography variant="h6">Unidades por hora y producto</MDTypography>
        <Tooltip title="Descargar imagen">
          <IconButton
            size="small"
            onClick={() => downloadCard(cardRef, `Unidades_hora_${selProd || "todos"}`)}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </MDBox>

      <Stack direction="row" flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
        <Chip
          label="Todos"
          size="small"
          onClick={() => setSelProd(null)}
          sx={
            !selProd
              ? { backgroundColor: TODOS_COLOR, color: "#fff", "&:hover": { backgroundColor: TODOS_COLOR } }
              : {}
          }
          variant={!selProd ? "filled" : "outlined"}
        />
        {products.map((p) => (
          <Chip
            key={p}
            label={p}
            size="small"
            onClick={() => setSelProd(p)}
            sx={
              selProd === p
                ? { backgroundColor: CHART_PRIMARY, color: "#fff", "&:hover": { backgroundColor: CHART_PRIMARY } }
                : {}
            }
            variant={selProd === p ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {prodStats && (
        <MDBox display="flex" gap={3} flexWrap="wrap" sx={{ mb: 2 }}>
          {prodStats.map((s) => (
            <MDBox key={s.label}>
              <MDTypography variant="caption" color="text" display="block">
                {s.label}
              </MDTypography>
              <MDTypography variant="h5" fontWeight="medium">
                {s.value}
              </MDTypography>
            </MDBox>
          ))}
        </MDBox>
      )}

      <DefaultLineChart
        title={selProd ? `Unidades por hora — ${selProd}` : "Unidades por hora"}
        description={`${formatNumber(total)} u en total`}
        chart={chart}
        height="250px"
      />
    </MDBox>
  );
}

UnitsPerHourAndProduct.propTypes = {
  id_store: PropTypes.string.isRequired,
  refreshToken: PropTypes.number,
};

export default UnitsPerHourAndProduct;

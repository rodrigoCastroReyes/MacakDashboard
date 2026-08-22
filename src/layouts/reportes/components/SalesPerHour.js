import React, { useState, useMemo, useRef } from "react";
import useAxios from "hooks/useAxios";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import { Chip, Stack, IconButton, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { schemeTableau10 } from 'd3-scale-chromatic';
import useDownloadCard from "hooks/useDownloadCard";
import { API_BASE_URL } from '../../../config';

const TODOS_COLOR = '#64748b';
const HL = (h) => h === 0 ? "00:00" : `${String(h).padStart(2, "0")}:00`;
const horaRango = (h) => `${HL(h)} - ${HL(h === 23 ? 0 : h + 1)}`;

function SalesPerHour({ id_store }) {
  const { data, loading, error } = useAxios(
    `${API_BASE_URL}/dashboard/sales_by_hour_and_product?store_id=${id_store}`
  );

  const cardRef = useRef();
  const { downloadCard } = useDownloadCard();
  const [selProd, setSelProd] = useState(null);

  const products = useMemo(() => {
    if (!data?.sales_by_hour_and_product) return [];
    return [...new Set(data.sales_by_hour_and_product.map((d) => d.producto))];
  }, [data]);

  const hours = useMemo(() => {
    if (!data?.sales_by_hour_and_product) return [];
    return [...new Set(data.sales_by_hour_and_product.map((d) => d.hora))]
      .sort((a, b) => a - b);
  }, [data]);

  const chart = useMemo(() => {
    if (!data?.sales_by_hour_and_product) return { labels: [], datasets: [] };
    const raw = data.sales_by_hour_and_product;
    const color = selProd
      ? schemeTableau10[products.indexOf(selProd) % schemeTableau10.length]
      : TODOS_COLOR;

    if (!selProd) {
      const byHour = hours.map((h) => ({
        hora: h,
        total: raw.filter((d) => d.hora === h).reduce((acc, d) => acc + d.total_ventas, 0),
      }));
      return {
        labels: byHour.map((d) => HL(d.hora)),
        datasets: [{
          label: "Ingresos totales ($)",
          data: byHour.map((d) => d.total),
          borderColor: color,
          pointBackgroundColor: color,
          borderWidth: 4,
          pointRadius: 5,
          datalabels: { anchor: "end", align: "top", offset: 4, font: { size: 11, weight: "500" } },
        }],
      };
    }

    const filtered = raw
      .filter((d) => d.producto === selProd)
      .sort((a, b) => a.hora - b.hora);

    return {
      labels: filtered.map((d) => HL(d.hora)),
      datasets: [{
        label: `Ingresos ${selProd} ($)`,
        data: filtered.map((d) => d.total_ventas),
        borderColor: color,
        pointBackgroundColor: color,
        borderWidth: 4,
        pointRadius: 5,
        datalabels: { anchor: "end", align: "top", offset: 4, font: { size: 11, weight: "500" } },
      }],
    };
  }, [data, selProd, hours, products]);

  const prodStats = useMemo(() => {
    if (!selProd || !data?.sales_by_hour_and_product) return null;
    const filtered = data.sales_by_hour_and_product.filter((d) => d.producto === selProd);
    const totalIngresos = filtered.reduce((acc, d) => acc + d.total_ventas, 0).toFixed(2);
    const pico = filtered.reduce((a, b) => a.total_ventas > b.total_ventas ? a : b, { total_ventas: 0, hora: 0 });
    const horasActivas = filtered.filter((d) => d.total_ventas > 0).length;
    return [
      { label: "Total ingresos", value: `$${totalIngresos}` },
      { label: "Hora pico", value: horaRango(pico.hora) },
      { label: "Ingresos en pico", value: `$${pico.total_ventas.toFixed(2)}` },
      { label: "Horas activas", value: horasActivas },
    ];
  }, [data, selProd]);

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.sales_by_hour_and_product) return <div>Sin datos disponibles</div>;

  const total = data.sales_by_hour_and_product
    .reduce((acc, d) => acc + d.total_ventas, 0)
    .toFixed(2);

  return (
    <MDBox p={2} ref={cardRef}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <MDTypography variant="h6">Ingresos por hora y producto</MDTypography>
        <Tooltip title="Descargar imagen">
          <IconButton
            size="small"
            onClick={() => downloadCard(cardRef, `Ingresos_hora_${selProd || 'todos'}`)}
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
          sx={!selProd ? {
            backgroundColor: TODOS_COLOR, color: "#fff",
            "&:hover": { backgroundColor: TODOS_COLOR }
          } : {}}
          variant={!selProd ? "filled" : "outlined"}
        />
        {products.map((p, i) => (
          <Chip
            key={p} label={p} size="small"
            onClick={() => setSelProd(p)}
            sx={selProd === p ? {
              backgroundColor: schemeTableau10[i % schemeTableau10.length],
              color: "#fff",
              "&:hover": { backgroundColor: schemeTableau10[i % schemeTableau10.length] }
            } : {}}
            variant={selProd === p ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {prodStats && (
        <MDBox display="flex" gap={3} flexWrap="wrap" sx={{ mb: 2 }}>
          {prodStats.map((s) => (
            <MDBox key={s.label}>
              <MDTypography variant="caption" color="text" display="block">{s.label}</MDTypography>
              <MDTypography variant="h5" fontWeight="medium">{s.value}</MDTypography>
            </MDBox>
          ))}
        </MDBox>
      )}

      <DefaultLineChart
        title={selProd ? `Ingresos por hora — ${selProd}` : "Ingresos por hora"}
        description={`$${total} total`}
        chart={chart}
        height="250px"
      />
    </MDBox>
  );
}

export default SalesPerHour;
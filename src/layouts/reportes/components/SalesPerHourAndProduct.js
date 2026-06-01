import React, { useState, useMemo, useRef } from "react";
import useAxios from "hooks/useAxios";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import HorizontalBarChart from "examples/Charts/BarCharts/HorizontalBarChart";
import { Chip, Stack, Divider, IconButton, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { schemeTableau10 } from 'd3-scale-chromatic';
import useDownloadCard from "hooks/useDownloadCard";
import { API_BASE_URL } from '../../../config';

const TODOS_COLOR = '#64748b';
const HL = (h) => h === 0 ? "00:00" : `${String(h).padStart(2, "0")}:00`;
const horaRango = (h) => `${HL(h)} - ${HL(h === 23 ? 0 : h + 1)}`;

function SalesPerHourAndProduct({ id_store }) {
  const { data, loading, error } = useAxios(
    `${API_BASE_URL}/dashboard/sales_by_hour_and_product?store_id=${id_store}`
  );

  const lineRef = useRef();
  const barRef  = useRef();
  const { downloadCard } = useDownloadCard();

  const [selProd, setSelProd] = useState(null);
  const [selHour, setSelHour] = useState(null);

  const products = useMemo(() => {
    if (!data?.sales_by_hour_and_product) return [];
    return [...new Set(data.sales_by_hour_and_product.map((d) => d.producto))];
  }, [data]);

  const hours = useMemo(() => {
    if (!data?.sales_by_hour_and_product) return [];
    return [...new Set(data.sales_by_hour_and_product.map((d) => d.hora))]
      .sort((a, b) => a - b);
  }, [data]);

  const lineChart = useMemo(() => {
    if (!data?.sales_by_hour_and_product) return { labels: [], datasets: [] };
    const raw = data.sales_by_hour_and_product;
    const color = selProd
      ? schemeTableau10[products.indexOf(selProd) % schemeTableau10.length]
      : TODOS_COLOR;

    if (!selProd) {
      const byHour = hours.map((h) => ({
        hora: h,
        total: raw.filter((d) => d.hora === h).reduce((acc, d) => acc + d.num_ordenes, 0),
      }));
      return {
        labels: byHour.map((d) => HL(d.hora)),
        datasets: [{
          label: "Unidades totales",
          data: byHour.map((d) => d.total),
          borderColor: color, pointBackgroundColor: color,
          borderWidth: 4, pointRadius: 5,
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
        label: selProd,
        data: filtered.map((d) => d.num_ordenes),
        borderColor: color, pointBackgroundColor: color,
        borderWidth: 4, pointRadius: 5,
        datalabels: { anchor: "end", align: "top", offset: 4, font: { size: 11, weight: "500" } },
      }],
    };
  }, [data, selProd, hours, products]);

  const barChart = useMemo(() => {
    if (!data?.sales_by_hour_and_product || hours.length === 0)
      return { labels: [], datasets: [] };
    const raw = data.sales_by_hour_and_product;
    const h = selHour ?? hours[0];
    const filtered = raw
      .filter((d) => d.hora === h)
      .sort((a, b) => b.num_ordenes - a.num_ordenes);

    return {
      labels: filtered.map((d) => d.producto),
      datasets: [{
        label: `Unidades a las ${HL(h)}`,
        data: filtered.map((d) => d.num_ordenes),
        backgroundColor: filtered.map((d) =>
          schemeTableau10[products.indexOf(d.producto) % schemeTableau10.length]
        ),
        borderRadius: 4,
        datalabels: {
          color: "#ffffff", anchor: "center", align: "center",
          font: { size: 11, weight: "500" },
          formatter: (v, ctx) => {
            const max = Math.max(...ctx.dataset.data);
            return v / max < 0.15 ? "" : v;
          },
        },
      }],
    };
  }, [data, selHour, hours, products]);

  const prodStats = useMemo(() => {
    if (!selProd || !data?.sales_by_hour_and_product) return null;
    const filtered = data.sales_by_hour_and_product.filter((d) => d.producto === selProd);
    const totalUds = filtered.reduce((acc, d) => acc + d.num_ordenes, 0);
    const pico = filtered.reduce((a, b) => a.num_ordenes > b.num_ordenes ? a : b, { num_ordenes: 0, hora: 0 });
    const horasActivas = filtered.filter((d) => d.num_ordenes > 0).length;
    return [
      { label: "Total uds", value: totalUds },
      { label: "Hora pico", value: horaRango(pico.hora) },
      { label: "Uds en pico", value: pico.num_ordenes },
      { label: "Horas activas", value: horasActivas },
    ];
  }, [data, selProd]);

  const hourStats = useMemo(() => {
    if (!data?.sales_by_hour_and_product || hours.length === 0) return null;
    const raw = data.sales_by_hour_and_product;
    const h = selHour ?? hours[0];
    const filtered = raw.filter((d) => d.hora === h);
    const totalUds = filtered.reduce((acc, d) => acc + d.num_ordenes, 0);
    const top = filtered.reduce((a, b) => a.num_ordenes > b.num_ordenes ? a : b, { num_ordenes: 0, producto: '-' });
    const activos = filtered.filter((d) => d.num_ordenes > 0).length;
    return [
      { label: "Total uds", value: totalUds },
      { label: "Top producto", value: top.producto },
      { label: "Uds top", value: top.num_ordenes },
      { label: "Activos", value: activos },
    ];
  }, [data, selHour, hours]);

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.sales_by_hour_and_product) return <div>Sin datos disponibles</div>;

  return (
    <MDBox>

      {/* ── Serie de tiempo por producto ── */}
      <MDBox p={2} ref={lineRef}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <MDTypography variant="h6">Unidades por hora y producto</MDTypography>
          <Tooltip title="Descargar imagen">
            <IconButton
              size="small"
              onClick={() => downloadCard(lineRef, `Unidades_hora_${selProd || 'todos'}`)}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>

        <Stack direction="row" flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
          <Chip
            label="Todos" size="small"
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
          title={selProd ? `Unidades por hora — ${selProd}` : "Unidades por hora"}
          description={selProd ? "Unidades vendidas por hora" : "Total de unidades por hora"}
          chart={lineChart}
          height="250px"
        />
      </MDBox>

      <Divider />

      {/* ── Productos por hora ── */}
      <MDBox p={2} ref={barRef}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <MDTypography variant="h6">Productos vendidos por hora</MDTypography>
          <Tooltip title="Descargar imagen">
            <IconButton
              size="small"
              onClick={() => downloadCard(barRef, `Productos_hora_${HL(selHour ?? hours[0])}`)}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>

        <Stack direction="row" flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
          {hours.map((h) => (
            <Chip
              key={h} label={HL(h)} size="small"
              onClick={() => setSelHour(h)}
              sx={selHour === h || (!selHour && h === hours[0]) ? {
                backgroundColor: TODOS_COLOR, color: "#fff",
                "&:hover": { backgroundColor: TODOS_COLOR }
              } : {}}
              variant={selHour === h || (!selHour && h === hours[0]) ? "filled" : "outlined"}
            />
          ))}
        </Stack>

        {hourStats && (
          <MDBox display="flex" gap={3} flexWrap="wrap" sx={{ mb: 2 }}>
            {hourStats.map((s) => (
              <MDBox key={s.label}>
                <MDTypography variant="caption" color="text" display="block">{s.label}</MDTypography>
                <MDTypography variant="h5" fontWeight="medium">{s.value}</MDTypography>
              </MDBox>
            ))}
          </MDBox>
        )}

        <HorizontalBarChart
          title={`Productos a las ${HL(selHour ?? hours[0])}`}
          description=""
          chart={barChart}
          height="300px"
        />
      </MDBox>

    </MDBox>
  );
}

export default SalesPerHourAndProduct;
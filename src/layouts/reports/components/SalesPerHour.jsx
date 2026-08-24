import { useState, useMemo, useRef, useEffect } from "react";
import useAxios from "hooks/useAxios";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import { Chip, Stack, IconButton, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import MDBox from "components/MDBox";
import StateMessage from "examples/StateMessage";
import MDTypography from "components/MDTypography";
import useDownloadCard from "hooks/useDownloadCard";
import { API_BASE_URL } from '../../../config';
import { CHART_PRIMARY } from "utils/chartColors";

const TODOS_COLOR = '#64748b';
const HL = (h) => h === 0 ? "00:00" : `${String(h).padStart(2, "0")}:00`;
const hourRange = (h) => `${HL(h)} - ${HL(h === 23 ? 0 : h + 1)}`;

function SalesPerHour({ id_store, refreshToken = 0 }) {
  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/sales_by_hour_and_product?store_id=${id_store}`
  );

  // El botón "Actualizar" de la cabecera incrementa refreshToken; refetch ignora
  // la caché de 10 minutos y trae datos frescos.
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
    return [...new Set(data.sales_by_hour_and_product.map((d) => d.hora))]
      .sort((a, b) => a - b);
  }, [data]);

  const chart = useMemo(() => {
    if (!data?.sales_by_hour_and_product) return { labels: [], datasets: [] };
    const raw = data.sales_by_hour_and_product;
    // El color no codifica identidad: siempre es la serie única de marca.
    const color = CHART_PRIMARY;

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
    const peak = filtered.reduce((a, b) => a.total_ventas > b.total_ventas ? a : b, { total_ventas: 0, hora: 0 });
    const activeHours = filtered.filter((d) => d.total_ventas > 0).length;
    return [
      { label: "Total ingresos", value: `$${totalIngresos}` },
      { label: "Hora pico", value: hourRange(peak.hora) },
      { label: "Ingresos en pico", value: `$${peak.total_ventas.toFixed(2)}` },
      { label: "Horas activas", value: activeHours },
    ];
  }, [data, selProd]);

  if (loading) return <StateMessage state="loading" message="Cargando ventas por hora…" />;
  if (error) return <StateMessage state="error" />;

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
              backgroundColor: CHART_PRIMARY,
              color: "#fff",
              "&:hover": { backgroundColor: CHART_PRIMARY }
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
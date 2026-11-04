import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import moment from "moment";

import Card from "@mui/material/Card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import SegmentedToggle from "layouts/summary/components/SegmentedToggle";
import { HL, hourRange, peakBy, dayPrefix } from "layouts/summary/utils";
import { CHART_PRIMARY, CHART_PRIMARY_SOFT } from "utils/chartColors";
import { formatCurrency, formatNumber } from "utils/format";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const METRICS = [
  { value: "total", label: "Ingresos" },
  { value: "orders", label: "Órdenes" },
];

// Eje Y sin decimales: "$13.018" se lee mejor que "$13.017,91" en una marca.
const currencyTick = (v) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

/** Ingresos u órdenes por hora de todas las tiendas, con detalle al pasar el mouse. */
function HourlySalesChart({ hours }) {
  const [metric, setMetric] = useState("total");

  const peakTotal = useMemo(() => peakBy(hours, "total"), [hours]);
  const peakOrders = useMemo(() => peakBy(hours, "orders"), [hours]);

  const data = useMemo(
    () => ({
      // Solo la hora: la fecha va en el tooltip, para no repetirla en cada marca.
      labels: hours.map((h) => HL(h.hour)),
      datasets: [
        {
          label: metric === "total" ? "Ingresos" : "Órdenes",
          data: hours.map((h) => h[metric]),
          borderColor: CHART_PRIMARY,
          backgroundColor: CHART_PRIMARY_SOFT,
          pointBackgroundColor: CHART_PRIMARY,
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    [hours, metric]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        datalabels: { display: false },
        tooltip: {
          backgroundColor: "#152c5b",
          padding: 10,
          titleFont: { size: 12, weight: "600" },
          bodyFont: { size: 12 },
          displayColors: false,
          callbacks: {
            title: (items) => {
              const h = hours[items[0].dataIndex];
              return `${moment(h.date).format("DD/MM")} · ${hourRange(h.hour)}`;
            },
            label: (ctx) => {
              const h = hours[ctx.dataIndex];
              return [
                `Ingresos: ${formatCurrency(h.total)}`,
                `Órdenes: ${formatNumber(h.orders)}`,
                `Ticket promedio: ${formatCurrency(h.orders ? h.total / h.orders : 0)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#7b809a", font: { size: 12 }, maxRotation: 0, autoSkip: true },
        },
        y: {
          beginAtZero: true,
          grid: { color: "#eef0f4" },
          border: { display: false },
          ticks: {
            color: "#7b809a",
            font: { size: 12 },
            callback: (v) => (metric === "total" ? currencyTick(v) : formatNumber(v)),
          },
        },
      },
    }),
    [hours, metric]
  );

  const firstDate = hours.length ? hours[0].date : null;
  const when = (h) => `${dayPrefix(h, firstDate)}${HL(h.hour)}`;

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
          <MDBox minWidth={0}>
            <MDTypography variant="h6" color="dark">
              {metric === "total" ? "Ingresos por hora" : "Órdenes por hora"}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              Todas las tiendas
              {peakTotal && ` · Hora pico ${when(peakTotal)} (${formatCurrency(peakTotal.total)})`}
              {peakOrders && ` · Más órdenes ${when(peakOrders)} (${formatNumber(peakOrders.orders)})`}
            </MDTypography>
          </MDBox>
          <SegmentedToggle value={metric} onChange={setMetric} options={METRICS} label="Métrica por hora" />
        </MDBox>
        <MDBox height="320px">
          <Line data={data} options={options} />
        </MDBox>
      </MDBox>
    </Card>
  );
}

HourlySalesChart.propTypes = {
  hours: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      hour: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
      orders: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default HourlySalesChart;

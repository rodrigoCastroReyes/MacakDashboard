import React, { useState, useEffect, useCallback } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Charts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Dashboard components
import "./style.css";
import axios from "axios";
import SalesPerTicket from "./SalesPerTicket";
import QuantitySoldByTicket from "./QuantitySoldByTicket";
import PurchaseTicketsTransactions from "./PurchaseTicketTransactions";

// URL
import { API_BASE_URL } from "../../config";

// ─── Helpers ────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEKS = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"];
const COLORS = ["#1A73E8", "#34A853", "#FBBC04", "#EA4335", "#9C27B0", "#00BCD4"];

function getHour(ts) {
  return new Date(ts).getHours();
}
function getDayOfWeek(ts) {
  return new Date(ts).getDay();
}
function getWeekOfYear(ts) {
  const d = new Date(ts);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
}
function formatHour(h) {
  return `${String(h).padStart(2, "0")}:00`;
}
// "DD/MM/YYYY" key used to group by calendar day
function getDayKey(ts) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}
// "Sem NN/YYYY" label for grouping by ISO week
function getWeekKey(ts) {
  const w = getWeekOfYear(ts);
  const year = new Date(ts).getFullYear();
  return `Sem ${String(w).padStart(2, "0")}/${year}`;
}
function formatCurrency(v) {
  return `$${Number(v).toLocaleString("es-EC", { minimumFractionDigits: 2 })}`;
}

// ─── Cache helpers (localStorage, TTL 30 min) ───────────────────────────────
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function cacheSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch (_) {}
}

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (_) {
    return null;
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

const SectionTitle = ({ icon, title, subtitle }) => (
  <MDBox mb={2} display="flex" alignItems="center" gap={1}>
    <span className="material-icons" style={{ color: "#1A73E8", fontSize: 22 }}>{icon}</span>
    <MDBox display="flex" flexDirection="column">
      <MDTypography fontWeight="bold" fontFamily="montserrat-semibold" color="#344767">
        {title}
      </MDTypography>
      {subtitle && (
        <MDTypography variant="caption" color="secondary">
          {subtitle}
        </MDTypography>
      )}
    </MDBox>
  </MDBox>
);

const ChartCard = ({ children, title, icon, subtitle, action }) => (
  <MDBox
    bgColor="white"
    borderRadius="lg"
    shadow="sm"
    p={3}
    mb={3}
    sx={{ border: "1px solid rgba(0,0,0,0.06)" }}
  >
    <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
      <SectionTitle icon={icon} title={title} subtitle={subtitle} />
      {action}
    </MDBox>
    {children}
  </MDBox>
);

const FilterTabs = ({ value, onChange, options }) => (
  <Tabs
    value={value}
    onChange={(_, v) => onChange(v)}
    sx={{
      minHeight: 32,
      "& .MuiTab-root": { minHeight: 32, fontSize: 12, py: 0.5 },
      "& .MuiTabs-indicator": { backgroundColor: "#1A73E8", color: "#7b809a" },
    }}
  >
    {options.map((o) => (
      <Tab key={o.value} label={o.label} value={o.value} />
    ))}
  </Tabs>
);

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <MDBox
      bgColor="white"
      shadow="md"
      borderRadius="md"
      p={1.5}
      sx={{ border: "1px solid rgba(0,0,0,0.1)", minWidth: 140 }}
    >
      <MDTypography variant="caption" fontWeight="bold" color="text" display="block" mb={0.5}>
        {label}
      </MDTypography>
      {payload.map((p, i) => (
        <MDBox key={i} display="flex" alignItems="center" gap={1}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <MDTypography variant="caption" color="text">
            {p.name}: {currency ? formatCurrency(p.value) : p.value}
          </MDTypography>
        </MDBox>
      ))}
    </MDBox>
  );
};

// ─── Heatmap ─────────────────────────────────────────────────────────────────

// Interpolate between #EBF5FB (lightest) → #1A5276 (darkest) using blue palette
function heatColor(value, max) {
  if (value === 0) return "#F4F6F7";
  const ratio = Math.min(value / max, 1);
  // 5-stop palette: very light → light → medium → strong → deep blue
  const stops = [
    { r: 214, g: 234, b: 248 }, // #D6EAF8
    { r: 133, g: 193, b: 233 }, // #85C1E9
    { r: 52,  g: 152, b: 219 }, // #3498DB
    { r: 31,  g: 97,  b: 141 }, // #1F618D
    { r: 21,  g: 67,  b: 96  }, // #154360
  ];
  const seg = (stops.length - 1) * ratio;
  const lo = Math.floor(seg);
  const hi = Math.min(lo + 1, stops.length - 1);
  const t = seg - lo;
  const lerp = (a, b) => Math.round(a + (b - a) * t);
  const { r, g, b } = {
    r: lerp(stops[lo].r, stops[hi].r),
    g: lerp(stops[lo].g, stops[hi].g),
    b: lerp(stops[lo].b, stops[hi].b),
  };
  return `rgb(${r},${g},${b})`;
}

const DAYS_FULL = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const HeatmapChart = ({ matrix, max }) => {
  const [tooltip, setTooltip] = useState(null);

  if (!matrix.length) return null;

  const CELL_H = 28;
  const LABEL_W = 52;
  const DAY_W = `calc((100% - ${LABEL_W}px) / 7)`;

  return (
    <MDBox sx={{ overflowX: "auto" }}>
      {/* Column headers – days of week */}
      <MDBox display="flex" ml={`${LABEL_W}px`} mb={0.5}>
        {DAYS_FULL.map((d) => (
          <MDBox
            key={d}
            sx={{ width: DAY_W, minWidth: 52, textAlign: "center" }}
          >
            <MDTypography variant="caption" fontWeight="bold" color="text" sx={{ fontSize: 11 }}>
              {d}
            </MDTypography>
          </MDBox>
        ))}
      </MDBox>

      {/* Rows – hours */}
      {matrix.map((row, h) => (
        <MDBox key={h} display="flex" alignItems="center" mb="2px">
          {/* Hour label */}
          <MDBox
            sx={{
              width: LABEL_W,
              minWidth: LABEL_W,
              textAlign: "right",
              pr: 1,
              flexShrink: 0,
            }}
          >
            <MDTypography variant="caption" color="text" sx={{ fontSize: 10, whiteSpace: "nowrap" }}>
              {formatHour(h)}
            </MDTypography>
          </MDBox>

          {/* 7 day cells */}
          {row.map((val, d) => {
            const bg = heatColor(val, max);
            const isLight = val / max < 0.45;
            return (
              <MDBox
                key={d}
                onMouseEnter={(e) =>
                  setTooltip({
                    val,
                    day: DAYS_FULL[d],
                    hour: formatHour(h),
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onMouseMove={(e) =>
                  setTooltip((prev) =>
                    prev ? { ...prev, x: e.clientX, y: e.clientY } : prev
                  )
                }
                onMouseLeave={() => setTooltip(null)}
                sx={{
                  width: DAY_W,
                  minWidth: 52,
                  height: CELL_H,
                  backgroundColor: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "1px",
                  borderRadius: "4px",
                  cursor: "default",
                  transition: "filter 0.15s",
                  "&:hover": { filter: "brightness(1.12)" },
                }}
              >
                {val > 0 && (
                  <MDTypography
                    variant="caption"
                    sx={{
                      fontSize: 10,
                      fontWeight: "bold",
                      color: isLight ? "#1A2F45" : "#ffffff",
                      lineHeight: 1,
                    }}
                  >
                    {val}
                  </MDTypography>
                )}
              </MDBox>
            );
          })}
        </MDBox>
      ))}

      {/* Legend */}
      <MDBox display="flex" alignItems="center" justifyContent="flex-end" mt={2} gap={1}>
        <MDTypography variant="caption" color="text" sx={{ fontSize: 10 }}>
          Menos
        </MDTypography>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((r) => (
          <MDBox
            key={r}
            sx={{
              width: 22,
              height: 14,
              borderRadius: "3px",
              backgroundColor: r === 0 ? "#F4F6F7" : heatColor(r * max, max),
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
        ))}
        <MDTypography variant="caption" color="text" sx={{ fontSize: 10 }}>
          Más
        </MDTypography>
      </MDBox>

      {/* Floating tooltip */}
      {tooltip && (
        <MDBox
          sx={{
            position: "fixed",
            top: tooltip.y + 14,
            left: tooltip.x + 14,
            zIndex: 9999,
            pointerEvents: "none",
            background: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: "8px",
            p: 1.5,
            border: "1px solid rgba(0,0,0,0.1)",
            minWidth: 160,
          }}
        >
          <MDTypography variant="caption" fontWeight="bold" color="text" display="block">
            {tooltip.day} · {tooltip.hour}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            🎟️ {tooltip.val} ticket{tooltip.val !== 1 ? "s" : ""} vendido{tooltip.val !== 1 ? "s" : ""}
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const Boleteria = () => {
  const [jwtToken, setJwtToken] = useState(null);
  const [ticketSummary, setTicketSummary] = useState({
    ticketsCapacity: 0,
    ticketsSold: 0,
    ticketsAvailable: 0,
  });
  const [tickets, setTickets] = useState([]);

  // Purchase data
  const [purchases, setPurchases] = useState([]);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // Analytics state
  const [readStats, setReadStats] = useState({ read: 0, unread: 0 });
  const [readByHourData, setReadByHourData] = useState([]);
  const [timeSeriesFilter, setTimeSeriesFilter] = useState("day");
  const [trafficFilter, setTrafficFilter] = useState("hour");
  const [salesFilter, setSalesFilter] = useState("hour");
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]); // 24 rows × 7 cols matrix
  const [heatmapMax, setHeatmapMax] = useState(1);

  const eventId = localStorage.getItem("eventId");

  // ── Auth ──
  useEffect(() => {
    async function checkAuthentication() {
      const token = await localStorage.getItem("authToken");
      setJwtToken(token);
    }
    checkAuthentication();
  }, []);

  // ── Fetch ticket types ──
  useEffect(() => {
    const fetch_data = async () => {
      try {
        if (jwtToken && eventId) {
          const eventResponse = await axios.get(
            `${API_BASE_URL}/ticket/event?id=${eventId}`,
            { headers: { Authorization: jwtToken } }
          );
          setTickets(eventResponse.data);

          const ticketsCapacity = eventResponse.data.reduce((acc, s) => acc + s.max_quantity, 0);
          const ticketsSolds = eventResponse.data.reduce((acc, s) => acc + s.sold_quantity, 0);
          setTicketSummary({
            ticketsCapacity,
            ticketsSold: ticketsSolds,
            ticketsAvailable: ticketsCapacity - ticketsSolds,
          });
        }
      } catch (error) {
        console.error("Error en la solicitud de datos:", error);
      }
    };
    fetch_data();
  }, [jwtToken, eventId]);

  // ── Fetch purchases + items ──
  useEffect(() => {
    const fetchPurchaseData = async () => {
      if (!jwtToken || !eventId) return;

      // ── Try cache first ──
      const cacheKeyPurchases = `purchases_${eventId}`;
      const cacheKeyItems = `purchaseItems_${eventId}`;
      const cachedPurchases = cacheGet(cacheKeyPurchases);
      const cachedItems = cacheGet(cacheKeyItems);
      if (cachedPurchases && cachedItems) {
        setPurchases(cachedPurchases);
        setPurchaseItems(cachedItems);
        return;
      }

      setLoadingPurchases(true);
      try {
        const purchaseRes = await axios.get(
          `${API_BASE_URL}/purchase_ticket/event?id=${eventId}`,
          { headers: { Authorization: jwtToken } }
        );
        const purchaseList = purchaseRes.data;
        setPurchases(purchaseList);
        cacheSet(cacheKeyPurchases, purchaseList);

        // Fetch detail items for each purchase in parallel (cap at 20 concurrent)
        const CHUNK = 20;
        let allItems = [];
        for (let i = 0; i < purchaseList.length; i += CHUNK) {
          const chunk = purchaseList.slice(i, i + CHUNK);
          const results = await Promise.allSettled(
            chunk.map((p) =>
              axios.get(
                `${API_BASE_URL}/purchase_ticket_item/purchase_ticket_info/?id=${p.purchase_ticket._id}`,
                { headers: { Authorization: jwtToken } }
              )
            )
          );
          results.forEach((r) => {
            if (r.status === "fulfilled") allItems = allItems.concat(r.value.data);
          });
        }
        setPurchaseItems(allItems);
        cacheSet(cacheKeyItems, allItems);
      } catch (err) {
        console.error("Error al obtener compras:", err);
      } finally {
        setLoadingPurchases(false);
      }
    };
    fetchPurchaseData();
  }, [jwtToken, eventId]);

  // ── Derive analytics from purchaseItems ──
  useEffect(() => {
    if (!purchaseItems.length) return;

    // 1) Read / Unread totals
    const read = purchaseItems.filter((i) => i.is_read).length;
    const unread = purchaseItems.filter((i) => !i.is_read).length;
    setReadStats({ read, unread });

    // 2) Read items by hour
    const readByHour = Array.from({ length: 24 }, (_, h) => ({
      hora: formatHour(h),
      leidos: 0,
    }));
    purchaseItems
      .filter((i) => i.is_read)
      .forEach((i) => {
        const h = getHour(i.__updatedtime__);
        readByHour[h].leidos += 1;
      });
    setReadByHourData(readByHour);
  }, [purchaseItems]);

  // ── Time series: sold tickets grouped by calendar day or ISO week ──
  useEffect(() => {
    if (!purchases.length) return;

    const buildSeries = (filter) => {
      // Accumulate into a sorted map keyed by day or week label
      const map = {};
      purchases.forEach((p) => {
        const ts = p.purchase_ticket.__createdtime__;
        const key = filter === "day" ? getDayKey(ts) : getWeekKey(ts);
        const qty = p.purchase_ticket_items?.length || 0;
        map[key] = (map[key] || 0) + qty;
      });

      // Sort chronologically: keys are DD/MM/YYYY or "Sem NN/YYYY"
      const sorted = Object.keys(map).sort((a, b) => {
        if (filter === "day") {
          // parse DD/MM/YYYY → comparable date
          const [da, ma, ya] = a.split("/");
          const [db, mb, yb] = b.split("/");
          return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
        }
        // "Sem NN/YYYY" → sort by year then week number
        const [wa, ya] = a.replace("Sem ", "").split("/");
        const [wb, yb] = b.replace("Sem ", "").split("/");
        return ya !== yb ? Number(ya) - Number(yb) : Number(wa) - Number(wb);
      });

      return sorted.map((k) => ({ label: k, cantidad: map[k] }));
    };

    setTimeSeriesData(buildSeries(timeSeriesFilter));
  }, [purchases, timeSeriesFilter]);

  // ── Traffic: purchase count grouped by filter ──
  useEffect(() => {
    if (!purchases.length) return;

    const build = (filter) => {
      if (filter === "hour") {
        const map = Array.from({ length: 24 }, (_, h) => ({ label: formatHour(h), transacciones: 0 }));
        purchases.forEach((p) => {
          map[getHour(p.purchase_ticket.__createdtime__)].transacciones += 1;
        });
        return map;
      }
      if (filter === "day") {
        const map = DAYS_ES.map((d) => ({ label: d, transacciones: 0 }));
        purchases.forEach((p) => {
          map[getDayOfWeek(p.purchase_ticket.__createdtime__)].transacciones += 1;
        });
        return map;
      }
      // weekend vs weekday
      const map = [
        { label: "Lun-Vie", transacciones: 0 },
        { label: "Sáb-Dom", transacciones: 0 },
      ];
      purchases.forEach((p) => {
        const d = getDayOfWeek(p.purchase_ticket.__createdtime__);
        const idx = d === 0 || d === 6 ? 1 : 0;
        map[idx].transacciones += 1;
      });
      return map;
    };

    setTrafficData(build(trafficFilter));
  }, [purchases, trafficFilter]);

  // ── Sales amount grouped by filter ──
  useEffect(() => {
    if (!purchases.length) return;

    const build = (filter) => {
      if (filter === "hour") {
        const map = Array.from({ length: 24 }, (_, h) => ({ label: formatHour(h), ventas: 0 }));
        purchases.forEach((p) => {
          map[getHour(p.purchase_ticket.__createdtime__)].ventas += p.purchase_ticket.total_amount || 0;
        });
        return map;
      }
      if (filter === "day") {
        const map = DAYS_ES.map((d) => ({ label: d, ventas: 0 }));
        purchases.forEach((p) => {
          map[getDayOfWeek(p.purchase_ticket.__createdtime__)].ventas += p.purchase_ticket.total_amount || 0;
        });
        return map;
      }
      const map = [
        { label: "Lun-Vie", ventas: 0 },
        { label: "Sáb-Dom", ventas: 0 },
      ];
      purchases.forEach((p) => {
        const d = getDayOfWeek(p.purchase_ticket.__createdtime__);
        const idx = d === 0 || d === 6 ? 1 : 0;
        map[idx].ventas += p.purchase_ticket.total_amount || 0;
      });
      return map;
    };

    setSalesData(build(salesFilter));
  }, [purchases, salesFilter]);

  // ── Heatmap: tickets sold per hour × day-of-week ──
  useEffect(() => {
    if (!purchases.length) return;

    // Build 24×7 matrix (rows=hours, cols=days 0=Dom..6=Sáb)
    const matrix = Array.from({ length: 24 }, () => Array(7).fill(0));
    purchases.forEach((p) => {
      const ts = p.purchase_ticket.__createdtime__;
      const h = getHour(ts);
      const d = getDayOfWeek(ts);
      const qty = p.purchase_ticket_items?.length || 0;
      matrix[h][d] += qty;
    });

    const max = Math.max(1, ...matrix.flat());
    setHeatmapMax(max);
    setHeatmapData(matrix);
  }, [purchases]);

  // ── Derived: total sold/revenue from purchases ──
  const totalRevenue = purchases.reduce((acc, p) => acc + (p.purchase_ticket.total_amount || 0), 0);
  const readPct = readStats.read + readStats.unread > 0
    ? Math.round((readStats.read / (readStats.read + readStats.unread)) * 100)
    : 0;

  const filterOpts = [
    { label: "Por día", value: "day" },
    { label: "Por semana", value: "week" },
  ];

  const trafficOpts = [
    { label: "Por hora", value: "hour" },
    { label: "Por día", value: "day" },
    { label: "Fin de semana", value: "weekend" },
  ];

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Boleteria" />

      {/* ── Header ── */}
      <MDTypography className="event-summary-title">
        Estadísticas de la boletería
      </MDTypography>

      {/* ── KPI Cards – Ticket types ── */}
      <MDBox py={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="confirmation_number"
                title="Boletos"
                count={ticketSummary.ticketsCapacity}
                url=""
                to_url={false}
                percentage={{ color: "info", amount: "", label: "Capacidad total" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="point_of_sale"
                title="Boletos vendidos"
                count={ticketSummary.ticketsSold}
                url=""
                to_url={false}
                percentage={{ color: "success", amount: "", label: "Número de boletos vendidos" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="warning"
                icon="nfc"
                title="Boletos disponibles"
                count={ticketSummary.ticketsAvailable}
                url=""
                to_url={false}
                percentage={{ color: "warning", amount: "", label: "Número de boletos disponibles" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="attach_money"
                title="Ingresos totales"
                count={formatCurrency(totalRevenue)}
                url=""
                to_url={false}
                percentage={{ color: "info", amount: "", label: "Total recaudado" }}
              />
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>

      {/* ── Existing charts ── */}

      <MDBox pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <SalesPerTicket data={tickets} />
          </Grid>
          {/*
          <Grid item xs={12} md={6}>
            <QuantitySoldByTicket data={tickets} />
          </Grid>*/}
        </Grid>
      </MDBox>

      {/* ══════════════════════════════════════════════════
          SECCIÓN 1: Tickets leídos / no leídos
      ══════════════════════════════════════════════════ */}
      {loadingPurchases ? (
        <MDBox display="flex" justifyContent="center" alignItems="center" py={6}>
          <CircularProgress size={40} />
          <MDTypography variant="body2" color="secondary" ml={2}>
            Cargando análisis de tickets…
          </MDTypography>
        </MDBox>
      ) : (
        <>
          <ChartCard
            icon="qr_code_scanner"
            title="Estado de escaneo de boletos"
            subtitle="Proporción de boletos leídos vs. no leídos"
          >
            <Grid container spacing={3} alignItems="center">
              {/* KPI chips */}
              <Grid item xs={12} md={6}>
                <MDBox display="flex" flexDirection="column" gap={2}>
                  <MDBox
                    bgColor="success"
                    borderRadius="lg"
                    p={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <MDBox>
                      <MDTypography variant="caption" color="white" fontWeight="medium">
                        LEÍDOS
                      </MDTypography>
                      <MDTypography variant="h4" color="white" fontWeight="bold">
                        {readStats.read}
                      </MDTypography>
                    </MDBox>
                    <span className="material-icons" style={{ color: "white", fontSize: 36 }}>
                      check_circle
                    </span>
                  </MDBox>
                  <MDBox
                    bgColor="info"
                    borderRadius="lg"
                    p={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <MDBox>
                      <MDTypography variant="caption" color="white" fontWeight="medium">
                        NO LEÍDOS
                      </MDTypography>
                      <MDTypography variant="h4" color="white" fontWeight="bold">
                        {readStats.unread}
                      </MDTypography>
                    </MDBox>
                    <span className="material-icons" style={{ color: "white", fontSize: 36 }}>
                      cancel
                    </span>
                  </MDBox>
                </MDBox>
              </Grid>

              {/* Pie chart */}
              <Grid item xs={12} md={6}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Leídos", value: readStats.read },
                        { name: "No leídos", value: readStats.unread },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill="#bfdf14" />
                      <Cell fill="#1A73E8" />
                    </Pie>
                    <Tooltip formatter={(v) => [v, "Tickets"]} />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </ChartCard>

          {/* ══════════════════════════════════════════════════
              SECCIÓN 2: Tickets leídos por hora
          ══════════════════════════════════════════════════ */}
          <ChartCard
            icon="schedule"
            title="Volumen de escaneos por hora"
            subtitle="Análisis temporal de tickets leídos durante el evento"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={readByHourData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis
                  dataKey="hora"
                  tick={{ fontSize: 11 }}
                  interval={1}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="leidos" name="Tickets leídos" fill="#bfdf14" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ══════════════════════════════════════════════════
              SECCIÓN 3: Serie de tiempo de tickets vendidos
          ══════════════════════════════════════════════════ */}
          <ChartCard
            icon="show_chart"
            title="Serie de tiempo – Tickets vendidos"
            subtitle={
              timeSeriesFilter === "day"
                ? "Boletos vendidos por día calendario (DD/MM/YYYY)"
                : "Boletos vendidos por semana del año"
            }
            action={
              <FilterTabs
                value={timeSeriesFilter}
                onChange={setTimeSeriesFilter}
                options={filterOpts}
              />
            }
          >
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 20, left: 0, bottom: timeSeriesFilter === "day" ? 70 : 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  interval={timeSeriesFilter === "day" ? "preserveStartEnd" : 0}
                  height={timeSeriesFilter === "day" ? 70 : 50}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  name="Tickets vendidos"
                  stroke="#1A73E8"
                  strokeWidth={2.5}
                  dot={{ r: timeSeriesData.length > 30 ? 2 : 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ══════════════════════════════════════════════════
              SECCIÓN 4: Tráfico de transacciones
          ══════════════════════════════════════════════════ */}
          <ChartCard
            icon="bar_chart"
            title="Tráfico de transacciones"
            subtitle="Número de órdenes de compra por franja temporal"
            action={
              <FilterTabs
                value={trafficFilter}
                onChange={setTrafficFilter}
                options={trafficOpts}
              />
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trafficData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="transacciones"
                  name="Transacciones"
                  fill="#1A73E8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ══════════════════════════════════════════════════
              SECCIÓN 5: Análisis de ventas (monto)
          ══════════════════════════════════════════════════ */}
          <ChartCard
            icon="payments"
            title="Análisis de ingresos por ventas"
            subtitle="Monto total recaudado por franja temporal"
            action={
              <FilterTabs
                value={salesFilter}
                onChange={setSalesFilter}
                options={trafficOpts}
              />
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip currency />} />
                <Bar
                  dataKey="ventas"
                  name="Ingresos ($)"
                  fill="#bfdf14"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          {/* ══════════════════════════════════════════════════
              SECCIÓN 6: Mapa de calor – hora × día de semana
          ══════════════════════════════════════════════════ */}
          <ChartCard
            icon="grid_on"
            title="Mapa de calor – Tickets vendidos"
            subtitle="Intensidad de ventas por hora del día y día de la semana"
          >
            <HeatmapChart matrix={heatmapData} max={heatmapMax} />
          </ChartCard>
        </>
      )}

      {/* ── Existing transactions table ── */}
      <MDBox mb={2}>
        <PurchaseTicketsTransactions id_event={eventId} />
      </MDBox>
    </DashboardLayout>
  );
};

export default Boleteria;
import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import StateMessage from "examples/StateMessage";

import useAxios from "hooks/useAxios";
import { formatCurrency, formatNumber } from "utils/format";
import { API_BASE_URL } from "config";

const HL = (h) => `${String(h).padStart(2, "0")}:00`;

/**
 * Las dos lecturas del mismo dato. Cambiarlas altera el análisis por completo:
 * un producto barato puede dominar en unidades y no aparecer en ingresos.
 */
const METRICS = {
  units: {
    field: "num_ordenes",
    format: (v) => formatNumber(v),
    unit: "u",
    totalLabel: "Total unidades",
    topLabel: "Uds. del top",
  },
  revenue: {
    field: "total_ventas",
    format: (v) => formatCurrency(v),
    unit: "",
    totalLabel: "Ventas totales",
    topLabel: "Ventas del top",
  },
};
const hourRange = (h) => `${HL(h)} – ${HL(h === 23 ? 0 : h + 1)}`;

/**
 * La intensidad es relativa al máximo de CADA producto, no al global: así una
 * fila de bajo volumen sigue mostrando en qué hora concentra sus ventas.
 * Un solo hue (el azul de marca): el color codifica magnitud, no identidad.
 */
const intensity = (value, rowMax) =>
  value === 0 ? 0 : 0.16 + 0.84 * (value / (rowMax || 1));

function Heatmap({ products, hours, matrix, rowMax, selected, onSelect, metric }) {
  return (
    <MDBox
      display="grid"
      gap={0.75}
      sx={{ overflowX: "auto", pb: 0.5 }}
      role="grid"
      aria-label="Ventas por producto y hora"
    >
      {/* Cabecera: una columna por hora, clicable */}
      <MDBox
        display="grid"
        gap={0.75}
        alignItems="center"
        sx={{ gridTemplateColumns: `minmax(110px, 140px) repeat(${hours.length}, minmax(28px, 1fr))` }}
      >
        <MDBox />
        {hours.map((h, i) => {
          const isSel = i === selected;
          return (
            <MDBox
              key={h}
              component="button"
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={isSel}
              aria-label={`Ver detalle de las ${HL(h)}`}
              sx={({ palette, borders, typography }) => ({
                border: "none",
                cursor: "pointer",
                py: 0.25,
                borderRadius: `${borders.borderRadius.md} ${borders.borderRadius.md} 0 0`,
                fontFamily: typography.fontFamily,
                fontSize: "11px",
                fontVariantNumeric: "tabular-nums",
                fontWeight: isSel ? 600 : 500,
                color: isSel ? palette.info.focus : palette.text.main,
                backgroundColor: isSel ? palette.badgeColors.info.background : "transparent",
                transition: "background-color .12s, color .12s",
                "&:hover": { backgroundColor: palette.grey[200] },
              })}
            >
              {String(h).padStart(2, "0")}
            </MDBox>
          );
        })}
      </MDBox>

      {/* Una fila por producto */}
      {products.map((name) => (
        <MDBox
          key={name}
          display="grid"
          gap={0.75}
          alignItems="center"
          sx={{ gridTemplateColumns: `minmax(110px, 140px) repeat(${hours.length}, minmax(28px, 1fr))` }}
        >
          <MDTypography
            variant="caption"
            color="text"
            sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            title={name}
          >
            {name}
          </MDTypography>

          {hours.map((h, i) => {
            const v = matrix[name]?.[h] || 0;
            const a = intensity(v, rowMax[name]);
            return (
              <Tooltip key={h} title={`${name} · ${HL(h)} — ${metric.format(v)}${metric.unit ? " " + metric.unit : ""}`} arrow>
                <MDBox
                  onClick={() => onSelect(i)}
                  sx={({ palette, borders }) => ({
                    height: 30,
                    borderRadius: borders.borderRadius.md,
                    cursor: "pointer",
                    backgroundColor: v === 0 ? palette.grey[200] : `rgba(0, 83, 209, ${a})`,
                    boxShadow:
                      i === selected ? `inset 0 0 0 2px ${palette.info.main}` : "inset 0 0 0 1px transparent",
                    transition: "transform .1s, box-shadow .12s",
                    "&:hover": { transform: "scale(1.06)" },
                  })}
                />
              </Tooltip>
            );
          })}
        </MDBox>
      ))}
    </MDBox>
  );
}

Heatmap.propTypes = {
  products: PropTypes.array.isRequired,
  hours: PropTypes.array.isRequired,
  matrix: PropTypes.object.isRequired,
  rowMax: PropTypes.object.isRequired,
  selected: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  metric: PropTypes.object.isRequired,
};

function StatTile({ label, value, small }) {
  return (
    <MDBox
      px={1.5}
      py={1.25}
      sx={({ palette, borders }) => ({
        backgroundColor: palette.grey[100],
        borderRadius: borders.borderRadius.lg,
      })}
    >
      <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
        {label}
      </MDTypography>
      <MDTypography
        variant={small ? "button" : "h5"}
        fontWeight="bold"
        color="dark"
        sx={{ lineHeight: 1.2, display: "block", mt: 0.25, wordBreak: "break-word" }}
      >
        {value}
      </MDTypography>
    </MDBox>
  );
}

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  small: PropTypes.bool,
};

function SalesByHourAndProductHeatmap({ id_store, refreshToken = 0 }) {
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

  const [metricKey, setMetricKey] = useState("units");
  const metric = METRICS[metricKey];

  const { products, hours, matrix, rowMax } = useMemo(() => {
    const raw = data?.sales_by_hour_and_product || [];
    const p = [...new Set(raw.map((d) => d.producto))];
    const h = [...new Set(raw.map((d) => d.hora))].sort((a, b) => a - b);
    const m = {};
    const max = {};
    p.forEach((name) => {
      m[name] = {};
      max[name] = 0;
    });
    raw.forEach((d) => {
      const v = (m[d.producto][d.hora] || 0) + (d[metric.field] || 0);
      m[d.producto][d.hora] = v;
      if (v > max[d.producto]) max[d.producto] = v;
    });
    return { products: p, hours: h, matrix: m, rowMax: max };
  }, [data, metric.field]);

  const [selected, setSelected] = useState(0);

  // Al cambiar de tienda se arranca en la hora de mayor volumen, no en la primera.
  useEffect(() => {
    if (!hours.length) return;
    let best = 0;
    let bestTotal = -1;
    hours.forEach((h, i) => {
      const t = products.reduce((acc, p) => acc + (matrix[p]?.[h] || 0), 0);
      if (t > bestTotal) {
        bestTotal = t;
        best = i;
      }
    });
    setSelected(best);
  }, [hours, products, matrix]);

  if (loading) return <StateMessage state="loading" message="Cargando ventas por hora…" />;
  if (error) return <StateMessage state="error" />;
  if (!products.length || !hours.length) {
    return <StateMessage state="empty" message="Sin ventas registradas por hora" />;
  }

  const hour = hours[selected];
  const detail = products
    .map((name) => ({ name, value: matrix[name]?.[hour] || 0 }))
    .sort((a, b) => b.value - a.value);
  const totalUnits = detail.reduce((acc, d) => acc + d.value, 0);
  const activeCount = detail.filter((d) => d.value > 0).length;
  const top = detail[0];
  const scale = Math.max(...detail.map((d) => d.value), 1);

  return (
    <MDBox p={3}>
      <MDBox display="flex" alignItems="baseline" justifyContent="space-between" gap={2} mb={0.5}>
        <MDTypography variant="h6" fontWeight="semiBold" color="dark">
          Ventas por producto y hora
        </MDTypography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={metricKey}
          onChange={(_, v) => v && setMetricKey(v)}
          aria-label="Métrica del análisis"
          sx={({ palette, borders }) => ({
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontSize: "12px",
              fontWeight: 600,
              px: 1.5,
              py: 0.5,
              color: palette.text.main,
              borderColor: palette.grey[300],
              borderRadius: borders.borderRadius.lg,
              "&.Mui-selected": {
                color: palette.white.main,
                backgroundColor: palette.info.main,
                "&:hover": { backgroundColor: palette.info.focus },
              },
            },
          })}
        >
          <ToggleButton value="units">Unidades vendidas</ToggleButton>
          <ToggleButton value="revenue">Ventas totales</ToggleButton>
        </ToggleButtonGroup>
      </MDBox>
      <MDTypography variant="caption" color="text" display="block" mb={2}>
        La intensidad muestra cuándo se vende más cada producto, relativa a su propio máximo.
        Toca una hora para ver el desglose.
      </MDTypography>

      <Heatmap
        products={products}
        hours={hours}
        matrix={matrix}
        rowMax={rowMax}
        selected={selected}
        onSelect={setSelected}
        metric={metric}
      />

      {/* Leyenda */}
      <MDBox display="flex" alignItems="center" gap={0.75} mt={2}>
        <MDTypography variant="caption" color="text">
          menos
        </MDTypography>
        {[0.16, 0.45, 0.72, 1].map((a) => (
          <MDBox
            key={a}
            sx={{ width: 20, height: 12, borderRadius: "3px", backgroundColor: `rgba(0, 83, 209, ${a})` }}
          />
        ))}
        <MDTypography variant="caption" color="text">
          más
        </MDTypography>
      </MDBox>

      <Divider sx={{ my: 2.5 }} />

      {/* Detalle de la hora seleccionada */}
      <MDBox display="flex" alignItems="baseline" gap={1.25} mb={2}>
        <MDTypography variant="h6" fontWeight="semiBold" color="dark">
          Detalle
        </MDTypography>
        <MDBox
          px={1.25}
          py={0.25}
          sx={({ palette }) => ({
            backgroundColor: palette.badgeColors.info.background,
            color: palette.badgeColors.info.text,
            borderRadius: "999px",
          })}
        >
          <MDTypography variant="caption" fontWeight="semiBold" color="inherit">
            {hourRange(hour)}
          </MDTypography>
        </MDBox>
      </MDBox>

      <MDBox
        display="grid"
        gap={1.5}
        mb={2.5}
        sx={{ gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" } }}
      >
        <StatTile label={metric.totalLabel} value={metric.format(totalUnits)} />
        <StatTile label="Top producto" value={top.value > 0 ? top.name : "—"} small />
        <StatTile label={metric.topLabel} value={metric.format(top.value)} />
        <StatTile label="Productos activos" value={formatNumber(activeCount)} />
      </MDBox>

      <MDBox display="flex" flexDirection="column" gap={1.25}>
        {detail.map((d) => {
          const empty = d.value === 0;
          const width = empty ? 100 : Math.max((d.value / scale) * 100, 6);
          return (
            <MDBox
              key={d.name}
              display="grid"
              gap={1.5}
              alignItems="center"
              sx={{ gridTemplateColumns: "minmax(96px, 140px) 1fr" }}
            >
              <MDTypography
                variant="caption"
                color="text"
                sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                title={d.name}
              >
                {d.name}
              </MDTypography>
              <MDBox position="relative" height={28}>
                <MDBox
                  display="flex"
                  alignItems="center"
                  justifyContent={empty ? "flex-start" : "flex-end"}
                  px={1.25}
                  sx={({ palette, borders }) => ({
                    height: "100%",
                    width: `${width}%`,
                    minWidth: 2,
                    borderRadius: borders.borderRadius.lg,
                    backgroundColor: empty ? palette.grey[200] : palette.info.main,
                    transition: "width .32s cubic-bezier(.4,0,.2,1)",
                  })}
                >
                  <MDTypography
                    variant="caption"
                    fontWeight="semiBold"
                    color={empty ? "text" : "white"}
                  >
                    {empty ? "sin ventas" : metric.format(d.value)}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          );
        })}
      </MDBox>
    </MDBox>
  );
}

SalesByHourAndProductHeatmap.propTypes = {
  id_store: PropTypes.string.isRequired,
  refreshToken: PropTypes.number,
};

export default SalesByHourAndProductHeatmap;

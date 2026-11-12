import PropTypes from "prop-types";

import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { hourRange, peakBy, dayPrefix } from "layouts/summary/utils";
import { formatCurrency, formatNumber, formatPercent } from "utils/format";

const GRID = "minmax(0, 1.4fr) repeat(4, minmax(0, 1fr))";
const numberSx = { textAlign: "right", fontVariantNumeric: "tabular-nums" };

function Row({ cells, header = false, highlight = false, total = false }) {
  return (
    <MDBox
      display="grid"
      gap={2}
      alignItems="center"
      px={3}
      py={header ? 1.25 : 1}
      sx={({ palette }) => ({
        gridTemplateColumns: GRID,
        borderBottom: total ? "none" : `1px solid ${palette.grey[200]}`,
        borderTop: total ? `2px solid ${palette.grey[300]}` : "none",
        backgroundColor: highlight
          ? "rgba(0, 83, 209, 0.06)"
          : total
            ? palette.grey[100]
            : "transparent",
      })}
    >
      {cells.map((cell, i) => (
        <MDTypography
          key={i}
          variant="caption"
          color={header ? "text" : "dark"}
          fontWeight={header || total || highlight ? "bold" : "regular"}
          textTransform={header ? "uppercase" : "none"}
          sx={{
            ...(i > 0 ? numberSx : {}),
            ...(header ? { letterSpacing: "0.04em" } : {}),
          }}
        >
          {cell}
        </MDTypography>
      ))}
    </MDBox>
  );
}

Row.propTypes = {
  cells: PropTypes.arrayOf(PropTypes.node).isRequired,
  header: PropTypes.bool,
  highlight: PropTypes.bool,
  total: PropTypes.bool,
};

/** Detalle hora por hora de todas las tiendas, con la hora pico resaltada. */
function HourlyTable({ hours, multiDay, total, orders }) {
  const peak = peakBy(hours, "total");
  const firstDate = hours.length ? hours[0].date : null;
  const shareLabel = multiDay ? "% del total" : "% del día";

  return (
    <Card>
      <MDBox px={3} pt={3} pb={1.5}>
        <MDTypography variant="h6" color="dark">
          Detalle por hora
        </MDTypography>
        <MDTypography variant="caption" color="text" display="block">
          Todas las tiendas · hora pico resaltada
        </MDTypography>
      </MDBox>
      <Row header cells={["Hora", "Órdenes", "Ingresos", "Ticket promedio", shareLabel]} />
      {hours.map((h) => (
        <Row
          key={`${h.date}-${h.hour}`}
          highlight={h === peak}
          cells={[
            `${dayPrefix(h, firstDate)}${hourRange(h.hour)}${h === peak ? " · pico" : ""}`,
            formatNumber(h.orders),
            formatCurrency(h.total),
            h.orders ? formatCurrency(h.total / h.orders) : "—",
            formatPercent(total ? (h.total / total) * 100 : 0),
          ]}
        />
      ))}
      <Row
        total
        cells={[
          "Total",
          formatNumber(orders),
          formatCurrency(total),
          orders ? formatCurrency(total / orders) : "—",
          formatPercent(100),
        ]}
      />
    </Card>
  );
}

HourlyTable.propTypes = {
  hours: PropTypes.arrayOf(PropTypes.object).isRequired,
  multiDay: PropTypes.bool,
  total: PropTypes.number.isRequired,
  orders: PropTypes.number.isRequired,
};

export default HourlyTable;

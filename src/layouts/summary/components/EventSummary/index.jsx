import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";

import StatCard from "examples/Cards/StatisticsCards/StatCard";
import { formatCurrency, formatNumber } from "utils/format";

import "./style.css";

const EventSummary = ({ totalSales, totalIncome, activatedTokens, salesPoints }) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <StatCard
        icon="attach_money"
        label="Ventas"
        value={formatCurrency(totalSales)}
        caption="Suma total de ventas"
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <StatCard
        icon="credit_card"
        label="Recargas"
        value={formatCurrency(totalIncome)}
        caption="Suma de todas las recargas"
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <StatCard
        icon="nfc"
        label="Activaciones"
        value={formatNumber(activatedTokens)}
        caption="Tokens registrados al evento"
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <StatCard
        icon="store"
        label="Tiendas"
        value={formatNumber(salesPoints)}
        caption="Puntos de venta registrados"
      />
    </Grid>
  </Grid>
);

// La API devuelve las cifras como string en unos casos y number en otros.
const numberLike = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

EventSummary.propTypes = {
  totalSales: numberLike,
  totalIncome: numberLike,
  activatedTokens: numberLike,
  salesPoints: numberLike,
};

export default EventSummary;

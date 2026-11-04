import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";

import StatCard from "examples/Cards/StatisticsCards/StatCard";
import { formatCurrency, formatNumber, formatPercent } from "utils/format";

import "./style.css";

/**
 * Indicadores del evento en una sola fila. Ventas va resaltada: es la cifra que
 * se mira primero. Las tiendas con ventas van como texto secundario de Ventas.
 */
const EventSummary = ({ totalSales, totalRecharges, orders, items, storesWithSales, activatedTokens }) => {
  // Dinero cargado en pulseras que todavía no se gastó en ninguna tienda.
  const unspent = totalRecharges - totalSales;
  const unspentShare = totalRecharges ? (unspent / totalRecharges) * 100 : 0;
  const cell = { xs: 12, sm: 6, md: 4, xl: 2 };

  return (
    <Grid container spacing={2}>
      <Grid size={cell}>
        <StatCard
          icon="attach_money"
          label="Ventas"
          value={formatCurrency(totalSales)}
          valueColor="info"
          valueVariant="h4"
          caption={`${formatNumber(storesWithSales)} tiendas con ventas`}
          highlight
        />
      </Grid>
      <Grid size={cell}>
        <StatCard
          icon="credit_card"
          label="Recargas"
          value={formatCurrency(totalRecharges)}
          valueVariant="h4"
          caption="Cargado en pulseras"
        />
      </Grid>
      <Grid size={cell}>
        <StatCard
          icon="account_balance_wallet"
          label="Sin consumir"
          value={formatCurrency(unspent)}
          valueVariant="h4"
          caption={`Saldo en pulseras · ${formatPercent(unspentShare)} de lo recargado`}
        />
      </Grid>
      <Grid size={cell}>
        <StatCard
          icon="receipt_long"
          label="Órdenes"
          value={formatNumber(orders)}
          valueVariant="h4"
          caption={`${formatNumber(items)} productos vendidos`}
        />
      </Grid>
      <Grid size={cell}>
        <StatCard
          icon="sell"
          label="Ticket promedio"
          value={formatCurrency(orders ? totalSales / orders : 0)}
          valueVariant="h4"
          caption="Ventas ÷ órdenes"
        />
      </Grid>
      <Grid size={cell}>
        <StatCard
          icon="nfc"
          label="Activaciones"
          value={formatNumber(activatedTokens)}
          valueVariant="h4"
          caption="Pulseras registradas"
        />
      </Grid>
    </Grid>
  );
};

EventSummary.propTypes = {
  totalSales: PropTypes.number.isRequired,
  totalRecharges: PropTypes.number.isRequired,
  orders: PropTypes.number.isRequired,
  items: PropTypes.number.isRequired,
  storesWithSales: PropTypes.number.isRequired,
  activatedTokens: PropTypes.number,
};

export default EventSummary;

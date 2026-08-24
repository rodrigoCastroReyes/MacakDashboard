import { useMemo, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import StateMessage from "examples/StateMessage";
import StatCard from "examples/Cards/StatisticsCards/StatCard";

import useAxios from "hooks/useAxios";
import { formatCurrency, formatNumber } from "utils/format";
import { API_BASE_URL } from "config";

const HL = (h) => `${String(h).padStart(2, "0")}:00`;

/** Píldora verde con el detalle de la hora punta. */
function PeakPill({ amount, orders }) {
  return (
    <MDBox
      display="inline-flex"
      alignItems="center"
      gap={0.5}
      px={1}
      py={0.25}
      sx={({ palette, borders }) => ({
        backgroundColor: palette.badgeColors.success.background,
        color: palette.badgeColors.success.text,
        borderRadius: borders.borderRadius.lg,
      })}
    >
      <Icon sx={{ fontSize: "14px !important" }}>trending_up</Icon>
      <MDTypography variant="caption" fontWeight="semiBold" color="inherit">
        {formatCurrency(amount)} · {formatNumber(orders)} órd
      </MDTypography>
    </MDBox>
  );
}

PeakPill.propTypes = {
  amount: PropTypes.number.isRequired,
  orders: PropTypes.number.isRequired,
};

function StoreHero({ id_store, refreshToken = 0 }) {
  const { data, loading, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/sales_by_hour?store_id=${id_store}`
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


  const stats = useMemo(() => {
    const raw = data?.sales_by_hour;
    if (!raw?.length) return null;

    const hours = [...raw].sort((a, b) => a.hora - b.hora);
    const total = hours.reduce((acc, d) => acc + d.total_ventas, 0);
    const orders = hours.reduce((acc, d) => acc + d.num_ordenes, 0);
    const peak = hours.reduce((a, b) => (a.total_ventas > b.total_ventas ? a : b));

    return {
      total,
      orders,
      // Métrica derivada: cuánto deja cada orden de media.
      avgTicket: orders ? total / orders : 0,
      peak,
      peakRange: `${HL(peak.hora)} – ${peak.hora === 23 ? "00:00" : HL(peak.hora + 1)}`,
      activeRange: `${HL(hours[0].hora)} – ${HL(hours[hours.length - 1].hora)}`,
    };
  }, [data]);

  if (loading) {
    return (
      <StateMessage state="loading" message="Cargando resumen…" />
    );
  }

  if (!stats) {
    return (
      <MDBox py={2}>
        <MDTypography variant="button" color="text">
          Sin ventas registradas en esta tienda
        </MDTypography>
      </MDBox>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          label="Ingresos totales"
          value={formatCurrency(stats.total)}
          valueColor="info"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Órdenes" value={formatNumber(stats.orders)} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          label="Ticket promedio"
          value={formatCurrency(stats.avgTicket)}
          caption="ingreso ÷ orden"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          label="Hora pico"
          value={stats.peakRange}
          caption={
            <MDBox display="flex" flexDirection="column" gap={0.75} alignItems="flex-start">
              <PeakPill amount={stats.peak.total_ventas} orders={stats.peak.num_ordenes} />
              <MDTypography variant="caption" color="text">
                actividad {stats.activeRange}
              </MDTypography>
            </MDBox>
          }
        />
      </Grid>
    </Grid>
  );
}

StoreHero.propTypes = {
  id_store: PropTypes.string.isRequired,
  refreshToken: PropTypes.number,
};

export default StoreHero;

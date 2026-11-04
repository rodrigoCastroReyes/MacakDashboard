/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SectionHeader from "examples/SectionHeader";
import StateMessage from "examples/StateMessage";

import EventSummary from "layouts/summary/components/EventSummary";
import SalesSummary from "layouts/summary/components/SalesSummary";
import LiveIndicator from "layouts/summary/components/LiveIndicator";
import HourlySalesChart from "layouts/summary/components/HourlySalesChart";
import TopProducts from "layouts/summary/components/TopProducts";
import HourlyTable from "layouts/summary/components/HourlyTable";
// El resumen de precargas no se muestra por ahora en esta vista, pero se
// conserva para usarlo en otra. Para volver a mostrarlo, descomentar este
// import y su bloque en el render.
// import PrechargesSummary from "layouts/summary/components/PrechargesSummary";
import { fillHours } from "layouts/summary/utils";

import useAxios from "hooks/useAxios";
import { API_BASE_URL } from "config";
import { readCache, writeCache } from "utils/apiCache";

import "./style.css";

const Summary = () => {
  const [jwtToken, setJwtToken] = useState(null);
  const [event, setEvent] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const eventId = localStorage.getItem("eventId");

  useEffect(() => {
    setJwtToken(localStorage.getItem("authToken"));
  }, []);

  // Ventas, recargas, órdenes, horas y top de productos salen de un solo
  // endpoint, sin la caché de 10 minutos del panel: al abrir la vista o pulsar
  // actualizar se ven las cifras del momento. No hay refresco automático.
  const {
    data: overview,
    loading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useAxios(
    eventId ? `${API_BASE_URL}/dashboard/event_sales_overview?event_id=${eventId}` : null,
    { cache: false }
  );

  // El evento solo aporta las activaciones; con la caché basta.
  const fetchEvent = useCallback(
    async ({ force = false } = {}) => {
      if (!jwtToken || !eventId) return;
      const eventUrl = `${API_BASE_URL}/event?id=${eventId}`;
      const cached = !force && readCache(eventUrl);
      if (cached) {
        setEvent(cached);
        return;
      }
      try {
        const response = await axios.get(eventUrl, { headers: { Authorization: jwtToken } });
        writeCache(eventUrl, response.data);
        setEvent(response.data);
      } catch (error) {
        console.error("Error al obtener el evento:", error);
      }
    },
    [jwtToken, eventId]
  );

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleReload = () => {
    refetchOverview();
    fetchEvent({ force: true });
    setRefreshToken((n) => n + 1); // propaga el refresco forzado al ranking
  };

  const hours = useMemo(() => fillHours(overview?.by_hour || []), [overview]);
  const multiDay = useMemo(() => new Set(hours.map((h) => h.date)).size > 1, [hours]);

  const renderOverview = () => {
    if (!eventId) return <StateMessage state="empty" message="Selecciona un evento" />;
    if (!overview) {
      return overviewLoading ? (
        <StateMessage state="loading" message="Cargando ventas…" />
      ) : (
        <StateMessage state="error" />
      );
    }

    return (
      <>
        <EventSummary
          totalSales={overview.total}
          totalRecharges={overview.recharges_total}
          orders={overview.orders}
          items={overview.items}
          storesWithSales={overview.stores_with_sales}
          activatedTokens={event?.amount_token_registered}
        />

        {overview.orders > 0 && (
          <>
            {/* El gráfico fija el alto de la fila; el top 10 se ajusta a ese alto
                y desplaza su lista por dentro (ver TopProducts). */}
            <Grid container spacing={2} mt={1}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <HourlySalesChart hours={hours} />
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }} sx={{ position: "relative" }}>
                <TopProducts
                  byQuantity={overview.top_products_by_quantity}
                  byValue={overview.top_products_by_value}
                />
              </Grid>
            </Grid>

            <MDBox mt={2}>
              <HourlyTable
                hours={hours}
                multiDay={multiDay}
                total={overview.total}
                orders={overview.orders}
              />
            </MDBox>
          </>
        )}
      </>
    );
  };

  return (
    <DashboardLayout>
      {/* El nombre del evento ya lo muestra el navbar, no hace falta repetirlo aquí. */}
      <DashboardNavbar main_title="Resumen" />

      <MDBox py={3}>
        <SectionHeader title="Indicadores del evento">
          <LiveIndicator
            updatedAt={overview?.generated_at}
            loading={overviewLoading}
            error={Boolean(overviewError)}
            onRefresh={handleReload}
          />
        </SectionHeader>

        {renderOverview()}

        <SectionHeader title="Ranking de ventas por tienda" mt={4} />
        <SalesSummary refreshToken={refreshToken} />

        {/* <SectionHeader title="Resumen de precargas" mt={4} />
        <PrechargesSummary refreshToken={refreshToken} /> */}
      </MDBox>
    </DashboardLayout>
  );
};

export default Summary;

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

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import EventSummary from "layouts/summary/components/EventSummary";
import SalesSummary from "layouts/summary/components/SalesSummary";
import SectionHeader from "examples/SectionHeader";

import { useAuth } from "context/authProvider";
import { API_BASE_URL } from "config";
import { readCache, writeCache } from "utils/apiCache";

import "./style.css";

const Summary = () => {
  const [ jwtToken, setJwtToken ] = useState(null);
  const { authToken, userId } = useAuth(); // Usar la función useAuth para acceder al token JWT
  //const [jwtToken, setJwtToken ] = useState(null);
  const [event, setEvent ] = useState({
    amount_token_registered: 0,
    stores : []
  });
  const [ eventSummary, setEventSummary ] = useState({
    totalSales : 0,
    totalRecharge : 0
  });
  const [ loading, setLoading ] = useState(false); // Estado para manejar la carga/recarga
  const [ refreshToken, setRefreshToken ] = useState(0);

  useEffect(() => {
    async function checkAuthentication(){
      let token = await localStorage.getItem('authToken');
      setJwtToken(token);
    };
    checkAuthentication();
  },[setJwtToken]);

  /**
   * `force` salta la caché de 10 minutos; es lo que hace el botón "Actualizar".
   * Sin él, una recarga de la página reutiliza lo ya descargado.
   */
  const fetch_data = useCallback(
    async ({ force = false } = {}) => {
      const eventId = localStorage.getItem("eventId");
      if (!jwtToken || !eventId) return;

      const eventUrl = `${API_BASE_URL}/event?id=${eventId}`;
      const salesUrl = `${API_BASE_URL}/dashboard/summary?event_id=${eventId}&type=order`;
      const rechargesUrl = `${API_BASE_URL}/dashboard/summary?event_id=${eventId}&type=recharge`;

      if (!force) {
        const cachedEvent = readCache(eventUrl);
        const cachedSales = readCache(salesUrl);
        const cachedRecharges = readCache(rechargesUrl);
        if (cachedEvent && cachedSales && cachedRecharges) {
          setEvent(cachedEvent);
          setEventSummary({
            totalSales: cachedSales.total_value,
            totalRecharge: cachedRecharges.total_value,
          });
          return;
        }
      }

      setLoading(true);
      try {
        const [eventResponse, salesResponse, rechargesResponse] = await Promise.all([
          axios.get(eventUrl, { headers: { Authorization: jwtToken } }),
          axios.get(salesUrl),
          axios.get(rechargesUrl),
        ]);

        writeCache(eventUrl, eventResponse.data);
        writeCache(salesUrl, salesResponse.data);
        writeCache(rechargesUrl, rechargesResponse.data);

        setEvent(eventResponse.data);
        setEventSummary({
          totalSales: salesResponse.data.total_value,
          totalRecharge: rechargesResponse.data.total_value,
        });
      } catch (error) {
        console.error("Error en la solicitud de datos:", error);
      } finally {
        setLoading(false);
      }
    },
    [jwtToken]
  );

  useEffect(() => {
    if (jwtToken) {
      fetch_data();
    }
  }, [jwtToken, fetch_data]);

  const handleReload = () => {
    setRefreshToken((n) => n + 1); // propaga el refresco forzado al ranking
    fetch_data({ force: true });
  };

  return (
    <DashboardLayout>
      {/* El nombre del evento ya lo muestra el navbar, no hace falta repetirlo aquí. */}
      <DashboardNavbar main_title="Resumen" />

      <MDBox py={3}>
        <SectionHeader title="Estadísticas del evento">
          <MDButton
            variant="outlined"
            color="info"
            size="small"
            onClick={handleReload}
            disabled={loading}
            startIcon={<Icon>refresh</Icon>}
          >
            {loading ? "Cargando…" : "Actualizar"}
          </MDButton>
        </SectionHeader>

        <EventSummary
          totalSales={eventSummary.totalSales}
          totalIncome={eventSummary.totalRecharge}
          activatedTokens={event.amount_token_registered}
          salesPoints={event.stores.length}
        />

        <SectionHeader title="Resumen por puntos de venta" mt={4} />

        <SalesSummary refreshToken={refreshToken} />
      </MDBox>
    </DashboardLayout>
  );
}

export default Summary;
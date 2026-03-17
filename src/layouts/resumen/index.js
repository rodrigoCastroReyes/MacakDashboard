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

import React, { useState, useEffect, useCallback } from "react"; // Importamos 'useCallback'

// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon"; // Importamos Icon para el botón

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton"; // Importamos MDButton

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
//import Footer from "examples/Footer";

// Dashboard components
import EventSummary from "layouts/resumen/components/EventSumary";
import SalesSummary from "layouts/resumen/components/SalesSumary";
import TransactionHistory from "layouts/transacciones/TransactionHistory";
import { Card } from "@mui/material";
import './style.css'
//import usePostAxios from "hooks/usePostAxios";
//import useGetAuthAxios from "hooks/useGetAuthAxios";
import axios from "axios";
import { useAuth } from 'context/authProvider';

// URL
import { API_BASE_URL } from '../../config';

const Resumen = () => {
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

  useEffect(() => {
    async function checkAuthentication(){
      let token = await localStorage.getItem('authToken');
      setJwtToken(token);
    };
    checkAuthentication();
  },[setJwtToken]);

  // Utilizamos 'useCallback' para memorizar la función y evitar que se recree innecesariamente
  const fetch_data = useCallback(async () => {
    const eventId = localStorage.getItem("eventId");
    if (!jwtToken || !eventId) return; // Asegurarse de que tenemos el token y el ID del evento

    setLoading(true); // Iniciar la carga
    try {
      // Realizar solicitudes utilizando el token JWT
      const eventResponse = await axios.get( `${API_BASE_URL}/event?id=${eventId}`, {
        headers: {
          'Authorization': jwtToken
        }
      });
      // Actualizar el estado con la respuesta del evento
      setEvent(eventResponse.data);
      
      // Realizar otras solicitudes después del inicio de sesión
      const salesResponse = await axios.get(`${API_BASE_URL}/dashboard/summary?event_id=${eventId}&type=order`);
      const rechargesResponse = await axios.get(`${API_BASE_URL}/dashboard/summary?event_id=${eventId}&type=recharge`);
      if (salesResponse && rechargesResponse) {
        setEventSummary({
          totalSales: parseFloat(salesResponse.data.total_value).toFixed(2),
          totalRecharge: parseFloat(rechargesResponse.data.total_value).toFixed(2)
        });
      }
    } catch (error) {
      console.error('Error en la solicitud de datos:', error);
      // Opcional: Mostrar una notificación de error al usuario
    } finally {
      setLoading(false); // Finalizar la carga
    }
  }, [jwtToken]); // La función solo cambia si jwtToken cambia

  useEffect(() => {
    // La primera carga de datos se realiza cuando jwtToken está disponible
    if (jwtToken) {
      fetch_data();
    }
  }, [jwtToken, fetch_data]);
  
  // Función para manejar el click del botón de recarga
  const handleReload = () => {
    fetch_data();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar main_title={`Resumen ${event.name}`} />
      <MDBox py={3}>
        {/* Nuevo botón de recarga */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <MDButton 
              variant="gradient" 
              color="info" 
              onClick={handleReload}
              disabled={loading} // Desactivar durante la carga
              startIcon={<Icon>refresh</Icon>}
            >
              {loading ? "Cargando..." : "Recargar Consultas"}
            </MDButton>
          </Grid>
        </Grid>
        {/* Fin del botón de recarga */}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <MDBox mb={1}>
              <EventSummary
                totalSales={eventSummary.totalSales}
                totalIncome={eventSummary.totalRecharge}
                activatedTokens={event.amount_token_registered}
                salesPoints={event.stores.length}
              />
            </MDBox>
          </Grid>
          
          <Grid item xs={12} sm={12}>
            <SalesSummary />
          </Grid>
          {/*
          <Grid item xs={12} sm={12}>
            <Card>
              <MDBox pt={1}>
                <TransactionHistory numRows={10} />
              </MDBox>
            </Card>
          </Grid>*/}
        </Grid>
      </MDBox>
      {/*<Footer />*/}
    </DashboardLayout>
  );
}

export default Resumen;
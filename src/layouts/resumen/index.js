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

import React, { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

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

  useEffect(() => {
    async function checkAuthentication(){
      let token = await localStorage.getItem('authToken');
      setJwtToken(token);
    };
    checkAuthentication();
  },[setJwtToken]);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        if (jwtToken) {
          // Realizar solicitudes utilizando el token JWT
          const eventResponse = await axios.get("https://biodynamics.tech/api_tokens/event?id=f9b857ac-16f2-4852-8981-b72831e7f67c", {
            headers: {
              'Authorization': jwtToken
            }
          });
          // Actualizar el estado con la respuesta del evento
          setEvent(eventResponse.data);
          
          // Realizar otras solicitudes después del inicio de sesión
          const salesResponse = await axios.get("https://biodynamics.tech/api_tokens/dashboard/summary?event_id=f9b857ac-16f2-4852-8981-b72831e7f67c&type=order");
          const rechargesResponse = await axios.get("https://biodynamics.tech/api_tokens/dashboard/summary?event_id=f9b857ac-16f2-4852-8981-b72831e7f67c&type=recharge");
          if (salesResponse && rechargesResponse) {
            setEventSummary({
              totalSales: salesResponse.data.total_value,
              totalRecharge: rechargesResponse.data.total_value
            });
          }
        }
      } catch (error) {
        console.error('Error en la solicitud de datos:', error);
      }
    };
    fetch_data();
  }, [jwtToken,userId]);
  
  return (
    <DashboardLayout>
      <DashboardNavbar main_title={`Resumen ${event.name}`} />
        <MDBox py={3}>
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
            <Grid item xs={12} sm={12}>
              <Card>
                <MDBox pt={1}>
                  <TransactionHistory numRows={10} />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      {/*<Footer />*/}
    </DashboardLayout>
  );
}

export default Resumen;

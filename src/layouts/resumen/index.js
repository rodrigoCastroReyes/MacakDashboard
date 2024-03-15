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

  {/*const { data, loading, error } =  usePostAxios("https://biodynamics.tech/api_tokens/user/login",{
    username : 'event_123',
    password : 'abcd'
  });
  useEffect(()=>{
    if(data){
      setJwtToken(data.jwtoken);
    }
  }, [data]);

  useEffect(() => {
    async function fetch_data(){
      if (jwtToken) {
        const response = await axios.get("https://biodynamics.tech/api_tokens/event?id=f9b857ac-16f2-4852-8981-b72831e7f67c",{
          headers: {
            'Authorization': jwtToken
          }
        });
        setEvent(response.data);
      }
    }
    fetch_data()
  }, [jwtToken]);*/}


  useEffect(() => {
    const fetch_data = async () => {
      try {
        if (authToken) {
          // Realizar solicitudes utilizando el token JWT
          const eventResponse = await axios.get("https://biodynamics.tech/api_tokens/event?id=f9b857ac-16f2-4852-8981-b72831e7f67c", {
            headers: {
              'Authorization': authToken
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
  }, [authToken,userId]);

  {/*useEffect(()=>{
    async function fetch_data(){
      const sales_response = await axios.get("https://biodynamics.tech/api_tokens/dashboard/summary?event_id=f9b857ac-16f2-4852-8981-b72831e7f67c&type=order");
      const recharges_response = await axios.get("https://biodynamics.tech/api_tokens/dashboard/summary?event_id=f9b857ac-16f2-4852-8981-b72831e7f67c&type=recharge");
      if(sales_response && recharges_response){
        setEventSummary({
          totalSales : sales_response.data.total_value,
          totalRecharge : recharges_response.data.total_value
        });
      }
    }
    fetch_data();
  })

  if (loading) return <div>Cargando...</div>;
if (error || data == null) return <div>Error al obtener los datos</div>;*/}

  return (
    <DashboardLayout>
      <DashboardNavbar />
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
                  <MDBox
                mx={2}
                mt={0}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography
                  fontWeight="regular"
                  fontFamily="montserrat-semibold"
                  fontSize="22px"
                  component="div" align="center"
                  variant="h6" color="white">
                  Transacciones recientes
                </MDTypography>
              </MDBox>
                <MDBox pt={3}>
                  <TransactionHistory numRows="10" />
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

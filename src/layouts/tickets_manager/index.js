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
import { Typography } from "@mui/material";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Dashboard components
import './style.css'
//import usePostAxios from "hooks/usePostAxios";
//import useGetAuthAxios from "hooks/useGetAuthAxios";
import axios from "axios";
import { useAuth } from 'context/authProvider';
import SalesPerTicket from "./SalesPerTicket";
import QuantitySoldByTicket from "./QuantitySoldByTicket";
import PurchaseTicketsTransactions from "./PurchaseTicketTransactions";

const Boleteria = () => {
  const [ jwtToken, setJwtToken ] = useState(null);
  const { authToken, userId } = useAuth(); // Usar la función useAuth para acceder al token JWT
  //const [jwtToken, setJwtToken ] = useState(null);
  const [event, setEvent ] = useState({
    amount_token_registered: 0,
    stores : []
  });
  const [ ticketSummary, setTicketSummary ] = useState({
    ticketsCapacity : 0 ,
    ticketsSold : 0,
    ticketsAvailable : 0
  });

  const [ tickets, setTickets ] = useState( [] );
  const id_event = "f4812f9a-a9ec-45c4-a0a8-17e5fbf1a2fb";

  useEffect(() => {
    async function checkAuthentication(){
      let token = await localStorage.getItem('authToken');
      setJwtToken(token);
    };
    checkAuthentication();
  },[setJwtToken]);

  useEffect(() => {
    const eventId = localStorage.getItem("eventId");
    const fetch_data = async () => {
      try { 
        if (jwtToken) {
          // Realizar solicitudes utilizando el token JWT
          const eventResponse = await axios.get(//"https://biodynamics.tech/macak_dev/ticket/event?id=f4812f9a-a9ec-45c4-a0a8-17e5fbf1a2fb"
            `https://biodynamics.tech/macak_dev/ticket/event?id=${eventId}`, {
            headers: {
              'Authorization': jwtToken
            }
          });
          // Actualizar el estado con la respuesta del evento
          setTickets(eventResponse.data);
          // Sumar el campo max_quantity de cada tipo de tickets
          const ticketsCapacity = eventResponse.data.reduce((acc, store) => acc + store.max_quantity, 0);
          const ticketsSolds = eventResponse.data.reduce((acc, store) => acc + store.sold_quantity, 0);

          setTicketSummary({
            ticketsCapacity : ticketsCapacity,
            ticketsSold : ticketsSolds,
            ticketsAvailable : ticketsCapacity - ticketsSolds
          });
          
        }
      } catch (error) {
        console.error('Error en la solicitud de datos:', error);
      }
    };
    fetch_data();
  }, [jwtToken]);
  
  return (
    <DashboardLayout>
      <DashboardNavbar main_title={`Boleteria`} />
        <Typography className="event-summary-title">
          Estadísticas de la boletería
        </Typography>
        <MDBox py={3}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="info"
                  icon="attach_money"
                  title="Boletos"
                  count={  ticketSummary.ticketsCapacity}
                  url=""
                  to_url={false}
                  percentage={{
                    color: "info",
                    amount: "",
                    label: "Número de boletos",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="point_of_sale"
                  title="Boletos vendidos"
                  count={ ticketSummary.ticketsSold }
                  url=""
                  to_url={false}
                  percentage={{
                    color: "info",
                    amount: "",
                    label: "Número de boletos vendidos",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="nfc"
                  title="Boletos disponibles"
                  count={ ticketSummary.ticketsAvailable}
                  url=""
                  to_url={false}
                  percentage={{
                    color: "info",
                    amount: "",
                    label: "Número de Boletos disponibles",
                  }}
                />
              </MDBox>
            </Grid>

          </Grid>
        </MDBox>
        <MDBox>
          <Grid item xs={12} md={6} lg={3}>
            <SalesPerTicket data={tickets} />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <QuantitySoldByTicket data={tickets} />
          </Grid>
        </MDBox>
        <MDBox>
          <Grid item xs={12} md={6} lg={3}>
            <PurchaseTicketsTransactions id_event={id_event} />
          </Grid>
        </MDBox>
    </DashboardLayout>
  );
}

export default Boleteria;

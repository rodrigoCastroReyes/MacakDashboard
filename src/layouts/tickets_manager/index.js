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

import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Dashboard components
import './style.css'
//import usePostAxios from "hooks/usePostAxios";
//import useGetAuthAxios from "hooks/useGetAuthAxios";
import axios from "axios";
import SalesPerTicket from "./SalesPerTicket";
import QuantitySoldByTicket from "./QuantitySoldByTicket";
import PurchaseTicketsTransactions from "./PurchaseTicketTransactions";

// URL
import { API_BASE_URL } from '../../config';

const Boleteria = () => {
  const [jwtToken, setJwtToken] = useState(null);

  const [ticketSummary, setTicketSummary] = useState({
    ticketsCapacity: 0,
    ticketsSold: 0,
    ticketsAvailable: 0
  });
  const [tickets, setTickets] = useState([]);

  const eventId = localStorage.getItem("eventId");

  useEffect(() => {
    async function checkAuthentication() {
      const token = await localStorage.getItem('authToken');
      setJwtToken(token);
    }
    checkAuthentication();
  }, []);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        if (jwtToken && eventId) {
          const eventResponse = await axios.get(
            `${API_BASE_URL}/ticket/event?id=${eventId}`, {
              headers: {
                'Authorization': jwtToken
              }
            }
          );

          setTickets(eventResponse.data);

          const ticketsCapacity = eventResponse.data.reduce((acc, store) => acc + store.max_quantity, 0);
          const ticketsSolds = eventResponse.data.reduce((acc, store) => acc + store.sold_quantity, 0);

          setTicketSummary({
            ticketsCapacity,
            ticketsSold: ticketsSolds,
            ticketsAvailable: ticketsCapacity - ticketsSolds
          });
        }
      } catch (error) {
        console.error('Error en la solicitud de datos:', error);
      }
    };

    fetch_data();
  }, [jwtToken, eventId]);

  return (
    <DashboardLayout>
      <DashboardNavbar main_title={`Boleteria`} />
      <MDTypography className="event-summary-title">
        Estadísticas de la boletería
      </MDTypography>
      <MDBox py={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="attach_money"
                title="Boletos"
                count={ticketSummary.ticketsCapacity}
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
                count={ticketSummary.ticketsSold}
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
                count={ticketSummary.ticketsAvailable}
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
          <PurchaseTicketsTransactions id_event={eventId} />
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Boleteria;

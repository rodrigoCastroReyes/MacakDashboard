import React, { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Dashboard components
import "./style.css";
import axios from "axios";
import SalesPerTicket from "./SalesPerTicket";
import QuantitySoldByTicket from "./QuantitySoldByTicket";
import PurchaseTicketsTransactions from "./PurchaseTicketTransactions";

// URL
import { API_BASE_URL } from "../../config";
import { countSoldByTicketName } from "utils/purchaseStatus";

const Ticketing = () => {
  const [jwtToken, setJwtToken] = useState(null);

  const [ticketSummary, setTicketSummary] = useState({
    ticketsCapacity: 0,
    ticketsSold: 0,
    ticketsAvailable: 0,
  });
  const [tickets, setTickets] = useState([]);

  const eventId = localStorage.getItem("eventId");

  useEffect(() => {
    async function checkAuthentication() {
      const token = await localStorage.getItem("authToken");
      setJwtToken(token);
    }
    checkAuthentication();
  }, []);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        if (jwtToken && eventId) {
          const [eventResponse, purchasesResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/ticket/event?id=${eventId}`, {
              headers: {
                Authorization: jwtToken,
              },
            }),
            axios.get(`${API_BASE_URL}/purchase_ticket/event?id=${eventId}`),
          ]);

          // Los vendidos se cuentan desde las órdenes pagadas y no desde
          // `sold_quantity` de la localidad, que hasta la versión 1.2.0 del
          // backend sumaba también las compras que nunca se pagaron.
          const soldByName = countSoldByTicketName(purchasesResponse.data);
          const ticketsWithPaidSales = eventResponse.data.map((ticket) => ({
            ...ticket,
            sold_quantity: soldByName[ticket.name] || 0,
          }));

          setTickets(ticketsWithPaidSales);

          const ticketsCapacity = ticketsWithPaidSales.reduce(
            (acc, ticket) => acc + ticket.max_quantity,
            0
          );
          const ticketsSolds = ticketsWithPaidSales.reduce(
            (acc, ticket) => acc + ticket.sold_quantity,
            0
          );

          setTicketSummary({
            ticketsCapacity,
            ticketsSold: ticketsSolds,
            ticketsAvailable: ticketsCapacity - ticketsSolds,
          });
        }
      } catch (error) {
        console.error("Error en la solicitud de datos:", error);
      }
    };

    fetch_data();
  }, [jwtToken, eventId]);

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Boleteria" />
      <MDTypography className="event-summary-title">
        Estadísticas de la boletería
      </MDTypography>
      <MDBox py={3}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
        <MDBox mb={2}>
          <SalesPerTicket data={tickets} />
        </MDBox>
        <MDBox mb={2}>
          <QuantitySoldByTicket data={tickets} />
        </MDBox>
        <MDBox mb={2}>
          <PurchaseTicketsTransactions id_event={eventId} />
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};

export default Ticketing;

//      <MDBox>
//        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
//          <SalesPerTicket data={tickets} />
//        </Grid>
//        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
//          <QuantitySoldByTicket data={tickets} />
//        </Grid>
//      </MDBox>
//      <MDBox>
//        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
//         <PurchaseTicketsTransactions id_event={eventId} />
//        </Grid>
//      </MDBox>

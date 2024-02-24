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

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Dashboard components
import EventSummary from "layouts/resumen/components/EventSumary";
import SalesSummary from "layouts/resumen/components/SalesSumary";
import TransactionHistory from "layouts/transacciones/TransactionHistory";
import { Card, Typography } from "@mui/material";
import './style.css'
import usePostAxios from "hooks/usePostAxios";
import useGetAuthAxios from "hooks/useGetAuthAxios";
import axios from "axios";

const Resumen = () => {
  const [dashboardData, setDashboardData] = useState({
    eventSummary: {
      totalSales: 0,
      totalIncome: 0,
      transactions: 0,
    },
    salesSummary: {
      salesByPos: [],
    },
    recentTransactions: [],
    posStatistics: [],
  });

  const [jwtToken, setJwtToken ] = useState(null);
  const [event, setEvent ] = useState({
    amount_token_registered: 0,
    stores : []
  });
  const [ eventSummary, setEventSummary ] = useState({
    totalSales : 0,
    totalRecharge : 0
  })
  const { data, loading, error } =  usePostAxios("https://biodynamics.tech/api_tokens/user/login",{
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
  }, [jwtToken]);

  useEffect(()=>{
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
  if (error || data == null) return <div>Error al obtener los datos</div>;

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
                  transactions={dashboardData.eventSummary.transactions}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} sm={12}>
              <SalesSummary />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Card>
                <Typography 
                  className="event-title"
                >
                Transacciones recientes
                </Typography>
                <MDBox pt={3}>
                  <TransactionHistory numRows="10" />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Resumen;

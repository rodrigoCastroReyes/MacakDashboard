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
import RecentTransactions from "layouts/resumen/components/RecentTransactions";
import StaticsPOS from "layouts/resumen/components/StaticsPOS";

function Resumen() {
  const [dashboardData, setDashboardData] = useState({
    eventSummary: {
      eventCount: 0,
      totalIncome: 0,
      activatedTokens: 0,
      salesPoints: 0,
      transactions: 0,
    },
    salesSummary: {
      salesByPos: [],
    },
    recentTransactions: [],
    posStatistics: [],
  });

  // Simular carga de datos
  useEffect(() => {
    // Aquí puedes hacer una llamada a una API o cargar datos de algún lugar
    // Por ahora, simularemos datos estáticos
    setTimeout(() => {
      setDashboardData({
        eventSummary: {
          eventCount: 10,
          totalIncome: 1000,
          activatedTokens: 100,
          salesPoints: 12,
          transactions: 200,
        },
        salesSummary: {
          salesByPos: [
            { pos: "Punto de venta 1", sales: 1500 },
            { pos: "Punto de venta 2", sales: 2000 },
            { pos: "Punto de venta 3", sales: 1800 },
            { pos: "Punto de venta 4", sales: 1200 },
            { pos: "Punto de venta 5", sales: 2200 },
            { pos: "Punto de venta 6", sales: 1700 },
            { pos: "Punto de venta 7", sales: 1900 },
            { pos: "Punto de venta 8", sales: 1400 },
            { pos: "Punto de venta 9", sales: 1600 },
            { pos: "Punto de venta 10", sales: 2100 },
            { pos: "Punto de venta 11", sales: 1300 },
            { pos: "Punto de venta 12", sales: 1800 },
          ],
        },
        recentTransactions: [
          { date: "2024-02-05", pos: "Punto de venta 1", amount: 100, type: "exitosa" },
          { date: "2024-02-04", pos: "Punto de venta 2", amount: 200, type: "fallida" },
          { date: "2024-02-03", pos: "Punto de venta 3", amount: 150, type: "exitosa" },
          { date: "2024-02-02", pos: "Punto de venta 4", amount: 120, type: "exitosa" },
          { date: "2024-02-01", pos: "Punto de venta 5", amount: 180, type: "fallida" },
          { date: "2024-01-24", pos: "Punto de venta 5", amount: 160, type: "exitosa" },
          { date: "2024-01-23", pos: "Punto de venta 5", amount: 140, type: "fallida" },
          { date: "2024-01-22", pos: "Punto de venta 5", amount: 200, type: "exitosa" },
        ],
        posStatistics: [
          { pos: "Punto de venta 1", percentage: 25 },
          { pos: "Punto de venta 2", percentage: 50 },
          { pos: "Punto de venta 3", percentage: 75 },
          { pos: "Punto de venta 4", percentage: 50 },
          { pos: "Punto de venta 5", percentage: 25 },
          { pos: "Punto de venta 6", percentage: 75 },
          { pos: "Punto de venta 7", percentage: 10 },
          { pos: "Punto de venta 8", percentage: 75 },
          { pos: "Punto de venta 9", percentage: 25 },
          { pos: "Punto de venta 10", percentage: 50 },
          { pos: "Punto de venta 11", percentage: 75 },
          { pos: "Punto de venta 12", percentage: 50 },
        ],
      });
    }, 1000);
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <MDBox mb={1.5}>
              <EventSummary
                eventCount={dashboardData.eventSummary.eventCount}
                totalIncome={dashboardData.eventSummary.totalIncome}
                activatedTokens={dashboardData.eventSummary.activatedTokens}
                salesPoints={dashboardData.eventSummary.salesPoints}
                transactions={dashboardData.eventSummary.transactions}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SalesSummary salesByPos={dashboardData.salesSummary.salesByPos} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDBox mb={1.5}>
              <RecentTransactions
                transactions={dashboardData.recentTransactions}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDBox mb={1.5}>
              <StaticsPOS statistics={dashboardData.posStatistics} />
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Resumen;

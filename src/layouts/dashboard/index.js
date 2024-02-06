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
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import EventSummary from "layouts/dashboard/components/EventSumary";
import SalesSummary from "./components/SalesSumary";
import RecentTransactions from "./components/RecentTransactions";
import StaticsPOS from "./components/StaticsPOS";

function Dashboard() {
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
            { pos: "Tienda A", sales: 1500 },
            { pos: "Tienda B", sales: 2000 },
            { pos: "Tienda C", sales: 1800 },
            { pos: "Tienda D", sales: 1200 },
            { pos: "Tienda E", sales: 2200 },
            { pos: "Tienda F", sales: 1700 },
            { pos: "Tienda G", sales: 1900 },
            { pos: "Tienda H", sales: 1400 },
            { pos: "Tienda I", sales: 1600 },
            { pos: "Tienda J", sales: 2100 },
            { pos: "Tienda K", sales: 1300 },
            { pos: "Tienda L", sales: 1800 },
          ],
        },
        recentTransactions: [
          { date: "2024-02-05", pos: "Tienda A", amount: 100, type: "exitosa" },
          { date: "2024-02-04", pos: "Tienda B", amount: 200, type: "fallida" },
          { date: "2024-02-03", pos: "Tienda C", amount: 150, type: "exitosa" },
          { date: "2024-02-02", pos: "Tienda D", amount: 120, type: "exitosa" },
          { date: "2024-02-01", pos: "Tienda E", amount: 180, type: "fallida" },
          { date: "2024-01-24", pos: "Tienda E", amount: 160, type: "exitosa" },
          { date: "2024-01-23", pos: "Tienda E", amount: 140, type: "fallida" },
          { date: "2024-01-22", pos: "Tienda E", amount: 200, type: "exitosa" },
        ],
        posStatistics: [
          { pos: "Tienda A", percentage: 25 },
          { pos: "Tienda B", percentage: 50 },
          { pos: "Tienda C", percentage: 75 },
          { pos: "Tienda D", percentage: 50 },
          { pos: "Tienda E", percentage: 25 },
          { pos: "Tienda F", percentage: 75 },
          { pos: "Tienda G", percentage: 10 },
          { pos: "Tienda H", percentage: 75 },
          { pos: "Tienda I", percentage: 25 },
          { pos: "Tienda J", percentage: 50 },
          { pos: "Tienda K", percentage: 75 },
          { pos: "Tienda L", percentage: 50 },
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

export default Dashboard;

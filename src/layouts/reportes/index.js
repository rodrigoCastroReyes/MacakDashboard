import React from "react";
import { Grid, Card } from "@mui/material";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SalesPerProduct from "./components/SalesPerProduct";
import QuantitySoldByProduct from "./components/QuantitySoldByProduct";
import SalesPerHour from "./components/SalesPerHour";
import SalesPerHourAndProduct from "./components/SalesPerHourAndProduct";

function Reports() {
  return (
    <DashboardLayout>
      <DashboardNavbar main_title="" />
      <MDBox py={3}>
        <Grid container spacing={2}>

          <Grid item xs={12} sm={6}>
            <Card>
              <SalesPerProduct />
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <QuantitySoldByProduct />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <SalesPerHour />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <SalesPerHourAndProduct />
            </Card>
          </Grid>

        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Reports;
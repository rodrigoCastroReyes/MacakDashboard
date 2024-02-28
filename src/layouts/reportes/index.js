import React from "react";
import { Grid, Card } from "@mui/material";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import SalesPerProduct from "./components/SalesPerProduct";
import QuantitySoldByProduct from "./components/QuantitySoldByProduct";

function Reports() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <Card>
              <SalesPerProduct />
            </Card>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Card>
              <QuantitySoldByProduct />
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Reports;

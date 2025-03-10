import React from "react";
import { Link } from "react-router-dom";
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const ClientList = () => {
  const clients = [
    { id: 1, name: "Cliente 1", email: "cliente1@example.com" },
    { id: 2, name: "Cliente 2", email: "cliente2@example.com" },
    { id: 3, name: "Cliente 3", email: "cliente3@example.com" },
    { id: 4, name: "Cliente 4", email: "cliente4@example.com" },
    { id: 5, name: "Cliente 5", email: "cliente5@example.com" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Lista de Clientes" />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <Link to={`/client/${client.id}`} style={{ textDecoration: "none" }}>
                <Card sx={{ cursor: "pointer", p: 3 }}>
                  <MDBox>
                    <MDTypography variant="h6">{client.name}</MDTypography>
                    <MDTypography variant="body2">{client.email}</MDTypography>
                  </MDBox>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default ClientList;

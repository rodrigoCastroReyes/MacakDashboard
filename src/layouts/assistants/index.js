import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Grid, Card, TextField, Box } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import RefreshIcon from '@mui/icons-material/Refresh';

// Importar el archivo JSON con la lista de clientes
import clientsData from 'layouts/assistants/clients.json';

const ClientList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Función para filtrar clientes por nombre o token
  const filterClients = () => {
    return clientsData.filter((client) => {
      const nameMatch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
      const tokensMatch = client.tokens.some((token) =>
        token.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return nameMatch || tokensMatch;
    });
  };

  // Función para reiniciar la búsqueda
  const resetSearch = () => {
    setSearchTerm(""); // Restablece el término de búsqueda a una cadena vacía
  };

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Lista de Clientes" />
      <MDBox pt={3} pr={2} pl={2} pb={3}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <TextField
            label="Buscar"
            placeholder="Buscar por nombre o token..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Actualiza el término de búsqueda
            sx={{ width: "100%" }}
          />
          <Box sx={{ marginLeft: 2, display: "flex", alignItems: "center" }}>
            <RefreshIcon 
              onClick={resetSearch} 
              fontSize="medium" 
              sx={{ cursor: "pointer" }} 
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {filterClients().map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <Link to={`/client/${client.id}`} style={{ textDecoration: "none" }}>
                <Card sx={{ cursor: "pointer", p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                  <AccountBoxIcon fontSize="large" color="secondary" />
                  <MDBox>
                    <MDTypography variant="h6">{client.name}</MDTypography>
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

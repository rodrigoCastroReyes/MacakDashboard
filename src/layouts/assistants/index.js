import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Grid, Card, TextField, Button, Box } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import RefreshIcon from '@mui/icons-material/Refresh';

const ClientList = () => {
  const clients = [
    { id: 1, name: "Maria", tokens: ["AB12CD34", "EF56GH78"] },
    { id: 2, name: "Jose", tokens: ["IJ90KL12", "MN34OP56"] },
    { id: 3, name: "Pamela", tokens: ["28EJTS96", "UV12WX34", "YZ56AB78"] },
    { id: 4, name: "Roberta", tokens: ["CD12EF34"] },
    { id: 5, name: "Karen", tokens: ["GH56IJ78", "KL90MN12", "OP34QR56"] },
    { id: 6, name: "Ricardo", tokens: ["RS12TU34", "VW56XY78"] },
    { id: 7, name: "Pedro", tokens: ["YZ34AB56"] },
    { id: 8, name: "Isaac", tokens: ["CD78EF90", "GH12IJ34", "KL56MN78"] },
    { id: 9, name: "Thiago", tokens: ["OP34QR56", "ST78UV90"] },
    { id: 10, name: "Martin", tokens: ["WX12YZ34", "AB56CD78", "EF90GH12"] },
    { id: 11, name: "Ana", tokens: ["LM12OP34", "PQ56RS78"] },
    { id: 12, name: "Luis", tokens: ["TU12VW34", "XY56ZA78"] },
    { id: 13, name: "Sofia", tokens: ["GH34IJ56", "KL78MN90"] },
    { id: 14, name: "Carlos", tokens: ["AB34CD56"] },
    { id: 15, name: "Gabriela", tokens: ["IJ12KL34", "MN56OP78"] },
    { id: 16, name: "Marifer", tokens: ["ST12UV34", "WX56YZ78"] },
    { id: 17, name: "Valentina", tokens: ["PQ12RS34"] },
    { id: 18, name: "Jorge", tokens: ["AB78CD90", "EF12GH34"] },
    { id: 19, name: "Emilia", tokens: ["IJ90KL12", "MN34OP56", "TU56VW78"] },
    { id: 20, name: "Hector", tokens: ["QR12ST34", "UV56WX78"] },
    { id: 21, name: "Julia", tokens: ["YZ12AB34", "CD56EF78"] },
    { id: 22, name: "Raul", tokens: ["GH34IJ56", "KL78MN90", "EF78GH90"] }
  ];

  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Función para filtrar clientes por nombre o token
  const filterClients = () => {
    return clients.filter((client) => {
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
        {/* Contenedor flex para la barra de búsqueda y el botón */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          {/* Barra de búsqueda con tamaño por defecto */}
          <TextField
            label="Buscar"
            placeholder="Buscar por nombre o token..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Actualiza el término de búsqueda
            sx={{ width: "100%" }} // Barra de búsqueda a su tamaño completo
          />

          {/* Botón para reiniciar la búsqueda */}
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

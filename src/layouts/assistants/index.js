import React, { useState, useMemo } from "react";
import { Grid, Card, TextField, Box, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import RefreshIcon from '@mui/icons-material/Refresh';

// Importar datos de asistentes
import attendeesData from 'layouts/assistants/clients.json';

const ClientList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Convertir el JSON en una lista de asistentes
  const attendeesList = useMemo(() => {
    return attendeesData.map((data) => data.attender);
  }, []);

  // Filtrar asistentes por id_document o full_name
  const filteredAttendees = useMemo(() => {
    return attendeesList.filter((attender) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        attender.full_name.toLowerCase().includes(lowerSearch) ||
        attender.id_document.includes(lowerSearch)
      );
    });
  }, [searchTerm, attendeesList]);

  // Reiniciar búsqueda
  const resetSearch = () => setSearchTerm("");

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Asistentes al Evento" />
      <MDBox pt={3} pr={2} pl={2} pb={3}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <TextField
            label="Buscar"
            placeholder="Buscar por nombre o ID..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
          />
          <IconButton onClick={resetSearch} sx={{ ml: 2 }} title="Reiniciar búsqueda">
            <RefreshIcon fontSize="medium" />
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          {filteredAttendees.map((attender) => (
            <Grid item xs={12} sm={6} md={4} key={attender.id}>
              <Link to={`/attender/${attender.id}`} style={{ textDecoration: "none" }}>
                <Card 
                  sx={{ 
                    cursor: "pointer", 
                    p: 3, 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 2,
                    "&:hover": { boxShadow: 6 }
                  }}
                >
                  <AccountBoxIcon fontSize="large" color="secondary" />
                  <MDBox>
                    <MDTypography variant="h6">{attender.full_name}</MDTypography>
                    <MDTypography variant="body2">ID: {attender.id_document}</MDTypography>
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

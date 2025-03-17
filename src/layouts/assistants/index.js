// layouts/assistants/ClientList.js
import React, { useState, useMemo } from "react";
import { Grid, Card, TextField, Box, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import AccountBoxIcon from '@mui/icons-material/AccountBox';
import RefreshIcon from '@mui/icons-material/Refresh';

import attendeesData from 'layouts/assistants/purchase-attender-event.json';

const ClientList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Extrae la lista de asistentes desde el JSON
  const attendeesList = useMemo(() => {
    return attendeesData.attenders || [];
  }, []);

  // Filtro de asistentes por full_name y id_document
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
      <DashboardNavbar main_title="Asistentes" />
      <MDBox pt={3} pr={2} pl={2} pb={3}>
        <Box sx={{ mb: 2 }}>
          {/* Barra de búsqueda y botón de reiniciar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <TextField
              label="Buscar"
              placeholder="Buscar por nombre o ID"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
            />
            <IconButton onClick={resetSearch} sx={{ ml: 2 }} title="Reiniciar búsqueda">
              <RefreshIcon fontSize="medium" />
            </IconButton>
          </Box>

          {/* Contador de asistentes */}
          <MDTypography variant="body2" sx={{ marginTop: 1, fontSize: '0.7rem' }}>
            {filteredAttendees.length === 1 ? "asistente encontrado: " : "asistentes encontrados: "}
            {filteredAttendees.length}
          </MDTypography>
        </Box>

        <Grid container spacing={3}>
          {filteredAttendees.map((attender) => (
            <Grid item xs={12} sm={6} md={3} key={attender.id}>
              <Link to={`/attender-details/${attender.id}`} style={{ textDecoration: 'none' }}>
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

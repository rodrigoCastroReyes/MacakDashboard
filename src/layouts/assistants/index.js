// layouts/assistants/ClientList.js
import React, { useState, useMemo } from "react";
import {
  Grid,
  Card,
  TextField,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import AccountBoxIcon from "@mui/icons-material/AccountBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

import useAxios from "hooks/useAxios";

import { downloadAttendeesAsCSV } from "./utils/AttendeesList";

// URL
import { API_BASE_URL } from "config";

const ClientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const eventId = localStorage.getItem("eventId");
  const { data, loading, error } = useAxios(
    `${API_BASE_URL}/purchase_ticket/attender_event?id=${eventId}`
  );

  const attendeesList = useMemo(() => data || [], [data]);

  const filteredAttendees = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return attendeesList.filter(
      (attender) =>
        attender.full_name.toLowerCase().includes(lowerSearch) ||
        attender.id_document.includes(lowerSearch)
    );
  }, [searchTerm, attendeesList]);

  const resetSearch = () => setSearchTerm("");

  if (loading || error) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Asistentes" />
        <MDBox pt={6} pb={3} display="flex" minHeight="50vh">
          <div variant="h6">
            {error ? "Error al obtener los datos" : "Cargando..."}
            <CircularProgress size={24} color="secondary" />
          </div>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Asistentes" />
      <MDBox pt={3} pr={2} pl={2} pb={3}>
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextField
              label="Buscar"
              placeholder="Buscar por nombre o Cédula"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
            />
            <IconButton
              onClick={resetSearch}
              sx={{ ml: 2 }}
              title="Reiniciar búsqueda"
            >
              <RefreshIcon fontSize="medium" />
            </IconButton>
            <IconButton
              onClick={() => downloadAttendeesAsCSV(eventId)}
              sx={{ ml: 2 }}
              title="Descargar Lista de Asistentes"
            >
              <DownloadIcon fontSize="medium" />
            </IconButton>
          </Box>

          <MDTypography variant="caption" sx={{ fontSize: "1rem" }}>
            {filteredAttendees.length === 1
              ? "1 asistente encontrado"
              : `${filteredAttendees.length} asistentes encontrados`}
          </MDTypography>
        </Box>

        <Grid container spacing={3}>
          {filteredAttendees.map((attender) => (
            <Grid item xs={12} sm={6} md={3} key={attender._id}>
              <Link
                to={`/attender-details/${attender._id}`}
                style={{ textDecoration: "none" }}
              >
                <Card
                  sx={{
                    cursor: "pointer",
                    p: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <AccountBoxIcon fontSize="large" color="secondary" />
                  <MDBox>
                    <MDTypography variant="h6">
                      {attender.full_name}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>

        {filteredAttendees.length === 0 && (
          <MDTypography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            No se encontraron asistentes con ese criterio.
          </MDTypography>
        )}
      </MDBox>
    </DashboardLayout>
  );
};

export default ClientList;

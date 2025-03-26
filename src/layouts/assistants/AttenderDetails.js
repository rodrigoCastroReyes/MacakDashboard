import React from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Card, Typography, IconButton } from "@mui/material";

import AccountBoxIcon from '@mui/icons-material/AccountBox';
import VisibilityIcon from '@mui/icons-material/Visibility';

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import moment from "moment";
import "moment/locale/es";

import useAxios from "hooks/useAxios";

moment.locale("es");

const eventId = "f4812f9a-a9ec-45c4-a0a8-17e5fbf1a2fb"; // ID de evento fijo por ahora

const AttenderDetails = () => {
  const { id: attenderId } = useParams();

  const {
    data: attenderData,
    loading: loadingAttender,
    error: errorAttender
  } = useAxios(
    `https://biodynamics.tech/macak_dev/purchase_ticket/by_attender_event?attender_id=${attenderId}&event_id=${eventId}`
  );

  const {
    data: tokensData,
    loading: loadingTokens,
    error: errorTokens
  } = useAxios(
    `https://biodynamics.tech/macak_dev/token/by_attender_event?attender_id=${attenderId}&event_id=${eventId}`
  );

  if (loadingAttender || loadingTokens) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Detalles del Asistente" />
        <Box sx={{ p: 3 }}>
          <Typography variant="body1">Cargando detalles del asistente...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (errorAttender || !attenderData || !attenderData.attender) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Detalles del Asistente" />
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" color="error">
            Asistente no encontrado.
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const { attender, purchase_tickets = [] } = attenderData;

  const orderHistoryTable = {
    columns: [
      { Header: "Fecha", accessor: "date", align: "center" },
      { Header: "Descripción de Orden", accessor: "detail", align: "center" },
      { Header: "Monto de la Orden", accessor: "amount", align: "center" },
      { Header: "Acciones", accessor: "actions", align: "center" }
    ],
    rows: purchase_tickets.flatMap((ticket) =>
      ticket.purchase_ticket_items
        .filter(item => item.quantity > 0)
        .map((item) => ({
          date: (
            <MDTypography fontSize="12px" variant="button" color="text" fontWeight="medium" align="center">
              {moment(ticket.created_time).format("DD [de] MMMM YYYY HH:mm:ss A")}
            </MDTypography>
          ),
          detail: (
            <MDTypography fontSize="12px" variant="caption" color="text" align="center">
              {`${item.ticket} ${item.quantity}x`}
            </MDTypography>
          ),
          amount: (
            <MDTypography fontSize="12px" variant="caption" color="success" fontWeight="bold" align="center">
              ${ (item.quantity * item.price).toFixed(2) }
            </MDTypography>
          ),
          actions: (
            <IconButton color="primary" title="Ver detalles">
              <VisibilityIcon />
            </IconButton>
          )
        }))
    )
  };

  const tokensTable = {
    columns: [
      { Header: "Nombre", accessor: "name", align: "center" },
      { Header: "Código", accessor: "code", align: "center" },
      { Header: "Estado", accessor: "status", align: "center" },
      { Header: "Saldo", accessor: "balance", align: "center" }
    ],
    rows: (tokensData || []).map((token) => ({
      name: (
        <MDTypography fontSize="12px" variant="caption" color="text" align="center">
          {token.name}
        </MDTypography>
      ),
      code: (
        <MDTypography fontSize="12px" variant="caption" color="text" align="center">
          {token.code}
        </MDTypography>
      ),
      status: (
        <MDBadge
          fontSize="12px"
          badgeContent={token.status}
          color={token.status === "registered" ? "success" : "warning"}
          variant="gradient"
        />
      ),
      balance: (
        <MDTypography fontSize="12px" variant="caption" color="success" fontWeight="bold" align="center">
          ${token.balance.toFixed(2)}
        </MDTypography>
      )
    }))
  };

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Detalles del Asistente" />
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2}>
          {/* INFO usuario IZQ */}
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <Box sx={{
                width: 100,
                height: 100,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}>
                <AccountBoxIcon fontSize="large" color="secondary" />
              </Box>
            </Card>
          </Grid>

          {/* INFO usuario DRC */}
          <Grid item xs={12} md={9}>
            <Card sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {attender.full_name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Cédula: {attender.id_document}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Email: {attender.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Fecha de Registro: {moment(attender.created_time).format("DD/MM/YYYY")}
              </Typography>
            </Card>
          </Grid>

          {/* Historial de Órdenes */}
          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>Historial de Órdenes</Typography>
              {orderHistoryTable.rows.length > 0 ? (
                <DataTable
                  table={orderHistoryTable}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No hay órdenes registradas.
                </Typography>
              )}
            </Card>
          </Grid>

          {/* Tokens Activados */}
          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>Tokens Activados</Typography>
              {tokensTable.rows.length > 0 ? (
                <DataTable
                  table={tokensTable}
                  isSorted={false}
                  entriesPerPage={false}  
                  showTotalEntries={false}
                  noEndBorder
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No hay tokens activados.
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default AttenderDetails;

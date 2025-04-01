import React from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Card, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";

import AccountBoxIcon from '@mui/icons-material/AccountBox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import moment from "moment";
import "moment/locale/es";

import useAxios from "hooks/useAxios";

// URL
import { API_BASE_URL } from '../../config';

const AttenderDetails = () => {
  moment.locale("es");
  const { id: attenderId } = useParams();
  const eventId = localStorage.getItem("eventId");

  const {
    data: attenderData,
    loading: loadingAttender,
    error: errorAttender,
    refetch: refetchAttender
  } = useAxios(
    `${API_BASE_URL}/purchase_ticket/by_attender_event?attender_id=${attenderId}&event_id=${eventId}`
  );

  const {
    data: tokensData,
    loading: loadingTokens,
    error: errorTokens,
    refetch: refetchTokens
  } = useAxios(
    `${API_BASE_URL}/token/by_attender_event?attender_id=${attenderId}&event_id=${eventId}`
  );

  const handleRefresh = () => {
    refetchAttender();
    refetchTokens();
  };

  if (loadingAttender || loadingTokens) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Detalles del Asistente" />
        <Box sx={{ p: 3 }}>
          <Typography variant="body1">Cargando panel del asistente...</Typography>
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
    rows: purchase_tickets.flatMap((ticket) => {
      const grouped = ticket.purchase_ticket_items.reduce((acc, item) => {
        if (!acc[item.ticket_id]) {
          acc[item.ticket_id] = {
            ticket_name: item.ticket_name,
            ticket_id: item.ticket_id,
            price: item.price,
            quantity: 1
          };
        } else {
          acc[item.ticket_id].quantity += 1;
        }
        return acc;
      }, {});

      return Object.values(grouped).map((item) => ({
        date: (
          <MDTypography fontSize="12px" variant="button" color="text" fontWeight="medium" align="center">
            {moment(ticket.created_time).format("DD [de] MMMM YYYY HH:mm:ss A")}
          </MDTypography>
        ),
        detail: (
          <MDTypography fontSize="12px" variant="caption" color="text" align="center">
            {`${item.ticket_name} ${item.quantity}x`}
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
      }));
    })
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
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5">Historial de Órdenes</Typography>
                <IconButton title="Refrescar" onClick={handleRefresh}>
                  <RefreshIcon fontSize="medium" />
                </IconButton>
              </Box>
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
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5">Tokens Activados</Typography>
                <IconButton title="Refrescar" onClick={handleRefresh}>
                  <RefreshIcon fontSize="medium" />
                </IconButton>
              </Box>
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

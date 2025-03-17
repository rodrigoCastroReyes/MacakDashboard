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

import attendeesData from "layouts/assistants/purchase-attender-event.json";
import tokensData from "layouts/assistants/tokens.json"; 

moment.locale("es");

const AttenderDetails = () => {
  const { id } = useParams();
  const attender = attendeesData.attenders.find((a) => a.id === id);

  if (!attender) {
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

  // tokens del id de usuario actual
  const userTokens = tokensData.tokens.find((tokenData) => tokenData.user_id === attender.id)?.tokens || [];

  const orderHistoryTable = {
    columns: [
      { Header: "Fecha", accessor: "date", align: "center" },
      { Header: "Descripción de Orden", accessor: "detail", align: "center" },
      { Header: "Monto de la Orden ($)", accessor: "amount", align: "center" },
      { Header: "Acciones", accessor: "actions", align: "center" }
    ],
    rows: attender.purchase_tickets?.flatMap((ticket) =>
      ticket.purchase_ticket_items
        .filter(item => item.quantity > 0)
        .map((item) => ({
          date: (
            <MDTypography fontSize="12px" variant="button" color="text" fontWeight="medium" align="center">
              {moment(ticket.__createdtime__).format("DD [de] MMMM YYYY HH:mm:ss A")}
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
    ) ?? []
  };

  const tokensTable = {
    columns: [
      { Header: "Identificador de Token", accessor: "id", align: "center" },
      { Header: "Estado", accessor: "status", align: "center" },
      { Header: "Fecha de Registro", accessor: "date", align: "center" },
      { Header: "Monto ($)", accessor: "amount", align: "center" }
    ],
    rows: userTokens.map((token) => ({
      id: (
        <MDTypography fontSize="12px" variant="caption" color="text" align="center">
          {token.id}
        </MDTypography>
      ),
      status: (
        <MDBadge
          fontSize="12px"
          badgeContent={token.status}
          color={token.status === "active" ? "success" : "warning"}
          variant="gradient"
        />
      ),
      date: (
        <MDTypography fontSize="12px" variant="caption" color="text" align="center">
          {moment(token.created_at).format("DD/MM/YYYY")}
        </MDTypography>
      ),
      amount: (
        <MDTypography fontSize="12px" variant="caption" color="success" fontWeight="bold" align="center">
          ${token.amount.toFixed(2)}
        </MDTypography>
      )
    }))
  };

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Detalles del Asistente" />
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          
          {/* Información del usuario */}
          <Grid item xs={12}>
            <Card sx={{ p: 3, display: "flex"}}>
              <Box 
                sx={{ 
                  width: 80, height: 80, 
                  display: "flex", justifyContent: "center", alignItems: "center", 
                  bgcolor: "primary.main", borderRadius: "10px", mr: 3 
                }}
              >
                <AccountBoxIcon fontSize="large" sx={{ color: "white" }} />
              </Box>
              <Box>
                <Typography variant="subtitle1">
                  Usuario : {attender.full_name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Cédula : {attender.id_document}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Email: {attender.email}
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Historial de Órdenes */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
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
            <Card sx={{ p: 3 }}>
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

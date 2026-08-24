import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { styled } from "@mui/system";

import moment from "moment";
import "moment/dist/locale/es"; // without this line it didn't work
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import MDBadge from "components/MDBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/styles.css";
import { Typography } from "@mui/material";

import { API_BASE_URL } from '../../config';
import StateMessage from "examples/StateMessage";

function OrderTicketManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/purchase_ticket_item/purchase_ticket_info/?id=${id}`
  );
  //0a7e8544-ad2e-468a-a5f2-b7b440c24426

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  moment().locale('es');
  if (loading) return <StateMessage state="loading" message="Cargando la orden…" />;
  if (error ) return <div>Error al obtener los datos</div>;
  
  //const order_ticket_items = data.filter(item => item.quantity > 0);
  const order_ticket_items = data;
  const total_amount = order_ticket_items?.reduce((acc, x) => acc + x.ticket_price, 0)
  const total_tickets = order_ticket_items?.length;

  const RefreshButtonContainer = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: theme.spacing(2), // Agrega margen inferior para separar del campo de búsqueda
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
      justifyContent: "center",
    },
  }));

  const columns = [
    { Header: "Localidad", accessor: "ticket_name", align: "left" },
    { Header: "Tipo de boleto", accessor: "type", align: "center" },
    { Header: "Precio", accessor: "quantity", align: "center" },
  ];
  
  const rows = order_ticket_items.map((ticket_item) => ({
    ticket_name: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {ticket_item.ticket_name}
      </MDTypography>
    ),
    type: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        <MDBadge
          className="customBadge"
          fontSize="12px"
          badgeContent={ticket_item.is_read ? "Leido" : "No leido"}
          color="primary"
          variant="gradient"
        />
      </MDTypography>
    ),
    quantity: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {ticket_item.ticket_price}
      </MDTypography>
    )
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Historial de transacciones por token" />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <Grid size={12}>
            <Card>
              <MDBox pt={3} pr={2} pl={2}>
                <div style={{ display: "flex", alignItems: "center", justifyContent:"space-between" }}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={() => navigate("/boleteria")}
                    startIcon={<Icon>arrow_back</Icon>}
                  >
                    Volver
                  </MDButton>
                  <RefreshButtonContainer>
                    <MDButton
                      variant="gradient"
                      color="info"
                      size="small"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      startIcon={<Icon>refresh</Icon>}
                    >
                      {refreshing ? "Actualizando…" : "Actualizar"}
                    </MDButton>
                  </RefreshButtonContainer>
                </div>
                <Typography pr={2} pl={2} fontSize="22px" className="event-summary-title">
                  Historial de la orden 
                </Typography>
                <MDBox pr={2} pl={2} style={{ display: "flex", justifyContent: "flex-start" }}>
                  <MDTypography
                    fontWeight="regular"
                    variant="body1"
                    style={{ position: "realtive", marginRight: "1rem" }}
                  >
                  Monto total ${total_amount}
                 </MDTypography>
                </MDBox>
                <MDBox pr={2} pl={2} style={{ display: "flex", justifyContent: "flex-start" }}>
                  <MDTypography
                    fontWeight="regular"
                    variant="body1"
                    style={{ position: "realtive", marginRight: "1rem" }}
                  >
                  Tickets {total_tickets}
                 </MDTypography>
                 </MDBox>
                <DataTable
                  pb={2}
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
                
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      {/*<Footer />*/}
    </DashboardLayout>
  );
}

export default OrderTicketManager;

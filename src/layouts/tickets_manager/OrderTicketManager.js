import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { styled } from "@mui/system";

import moment from "moment";
import 'moment/locale/es'; // without this line it didn't work
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import MDBadge from "components/MDBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
//import Footer from "examples/Footer";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/styles.css";
import { Typography } from "@mui/material";

import { API_BASE_URL } from '../../config';

function OrderTicketManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/purchase_ticket_item/purchase_ticket/?id=${id}`
  );
  //0a7e8544-ad2e-468a-a5f2-b7b440c24426

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  moment().locale('es');
  if (loading  ) return <div>Cargando...</div>;
  if (error ) return <div>Error al obtener los datos</div>;
  
  const order_ticket_items = data.filter(item => item.quantity > 0);
  const total_amount = order_ticket_items.reduce((acc, x) => acc + x.total, 0);

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
    { Header: "Cantidad de boletos", accessor: "quantity", align: "center" },
    { Header: "Costo total", accessor: "total", align: "center" },
  ];
  
  const rows = order_ticket_items.map((ticket_item) => ({
    ticket_name: (
      <MDTypography fontFamily='poppins' variant="button" color="text" fontWeight="medium">
        {ticket_item.ticket_name}
      </MDTypography>
    ),
    type: (
      <MDTypography fontFamily='poppins' variant="button" color="text" fontWeight="medium">
        <MDBadge
          className="customBadge"
          fontFamily="poppins"
          fontSize="12px"
          badgeContent={ticket_item.ticket_is_numered ? "Numerado" : "No numerado"}
          color="primary"
          variant="gradient"
        />
      </MDTypography>
    ),
    quantity: (
      <MDTypography fontFamily='poppins' variant="button" color="text" fontWeight="medium">
        {ticket_item.quantity}
      </MDTypography>
    ),
    total: (
      <MDTypography fontFamily='poppins' variant="button" color="text" fontWeight="medium">
        {ticket_item.total}
      </MDTypography>
    )
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Historial de transacciones por token" />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} pr={2} pl={2}>
                <div style={{ display: "flex", alignItems: "center", justifyContent:"space-between" }}>
                  <button className="return-button"onClick={() => navigate("/boleteria")}>
                    Volver
                  </button>
                  <RefreshButtonContainer>
                    <button
                      className="refresh-button"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing ? "Refrescando..." : "Actualizar"}
                    </button>
                  </RefreshButtonContainer>
                </div>
                <Typography pr={2} pl={2} fontFamily='montserrat-semibold' fontSize="22px" className="event-summary-title">
                  Historial de la orden 
                </Typography>
                <MDBox pr={2} pl={2} style={{ display: "flex", justifyContent: "flex-start" }}>
                  <MDTypography
                    fontFamily='poppins'
                    fontWeight="regular"
                    variant="body1"
                    style={{ position: "realtive", marginRight: "1rem" }}
                  >
                  Monto total ${total_amount}
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

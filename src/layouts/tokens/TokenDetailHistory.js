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
import TokenAnulledHistory from "./TokenAnnulledHistory";
// URL
import { API_BASE_URL } from '../../config' ;

function TokenDetailHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/token?token_id=${id}`
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  moment().locale('es');
  if (loading  ) return <div>Cargando...</div>;
  if (error || !data?.token || !data?.transactions ) return <div>Error al obtener los datos</div>;
  const transactions = data?.transactions;
  const getTranslateTypes = (transaction) =>{
    if (transaction.type === "order") {
      return "Compra";
    } else if (transaction.type === "recharge") {
      return "Carga";
    } else if (transaction.type === "refund") {
      return "Reembolso";
    }else{
      return "";
    }
  };

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

  const getBalanceChangeDisplay = (transaction) => {
    if (transaction.status === "rejected") {
      return `$${Math.abs(transaction.token_last_balance - transaction.token_new_balance)}`;
    }

    if (transaction.status === "success") {
      if (transaction.type === "order") {
        return `-$${Math.abs(transaction.token_last_balance - transaction.token_new_balance)}`;
      } else if (transaction.type === "charge" || transaction.type === "refund") {
        return `+$${Math.abs(transaction.token_last_balance - transaction.token_new_balance)}`;
      }
    }

    return `$${Math.abs(transaction.token_last_balance - transaction.token_new_balance)}`;
  };

  const columns = [
    {
      Header: "Fecha",
      accessor: "registrationDate",
      align: "center",
    },
    { Header: "Tipo", accessor: "type", align: "left" },
    { Header: "Estado", accessor: "status", align: "left" },
    { Header: "Detalle", accessor: "detail", align: "left" },
    { Header: "Monto", accessor: "balance", align: "center" },
  ];
  
  const rows = transactions.map((transaction) => ({
    registrationDate: (
      <MDTypography fontFamily='poppins' variant="caption" color="text" fontWeight="medium">
        {moment(transaction.__updatedtime__).format("DD [de] MMMM YYYY HH:mm:ss A")}
      </MDTypography>
    ),
    type: (
      <MDBox ml={-1}>
        <MDBadge fontFamily="poppins" badgeContent= {getTranslateTypes(transaction)}  color= {transaction.type === "order" ? "error" : "success"} variant="gradient" size="medium"/>
      </MDBox>
    ),
    status: (
      <MDTypography  fontFamily='poppins' variant="button" color="text" fontWeight="medium">
        {transaction.status === "success" ? "Exitosa" : "Rechazada"}
      </MDTypography>
    ),
    detail: (
      <MDTypography fontFamily='poppins' variant="button" color="text" fontWeight="medium">
        {transaction.description}
      </MDTypography>
    ),
    balance: (
      <MDTypography
       fontFamily='poppins'
        variant="caption"
        fontWeight="bold"
        color={transaction.type === "recharge" ? "success" : "error" }
      >
        {getBalanceChangeDisplay(transaction)}
      </MDTypography>
    ),
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
                  <button className="return-button"onClick={() => navigate("/tokens")}>
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
                  Historial de transacciones del Token {data.token.code}
                </Typography>
                <MDBox pr={2} pl={2} style={{ display: "flex", justifyContent: "flex-start" }}>
                  <MDTypography
                    fontFamily='poppins'
                    fontWeight="regular"
                    variant="body1"
                    style={{ position: "realtive", marginRight: "1rem" }}
                  >
                  Saldo disponible: ${data.token.balance}
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
                <Typography pt={4} pr={2} pl={2} fontFamily='montserrat-semibold' fontSize="22px" className="event-summary-title">
                  Historial de transacciones anuladas
                </Typography>
                <TokenAnulledHistory id={id}/>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      {/*<Footer />*/}
    </DashboardLayout>
  );
}

export default TokenDetailHistory;

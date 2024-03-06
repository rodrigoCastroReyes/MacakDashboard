import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function TokenDetailHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useAxios(
    `https://biodynamics.tech/api_tokens/dashboard/token?token_id=${id}`
  );

  moment().locale('es');
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.token || !data?.transactions) return <div>Error al obtener los datos</div>;

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
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography fontFamily='montserrat-semibold' fontSize="22px" component="div" align="center" variant="h6" color="white">
                  Historial de transacciones de Token {data.token.code}
                </MDTypography>
              </MDBox>
              <MDBox
                pt={3}
                px={2}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <MDTypography
                  fontFamily='poppins'
                  fontWeight="regular"
                  variant="body1"
                  style={{ position: "realtive", marginRight: "1rem" }}
                >
                  Saldo disponible: ${data.token.balance}
                  {/* Aquí va el saldo disponible */}
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <div style={{ marginBottom: "2rem" }}>
                  <button
                    className="return-button"
                    onClick={() => navigate("/tokens")}
                  >
                    Volver
                  </button>
                  <button
                    className="refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? "Refrescando..." : "Actualizar"}
                  </button>
                </div>
                <DataTable
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

export default TokenDetailHistory;

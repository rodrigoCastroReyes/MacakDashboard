import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import { useParams } from "react-router-dom";
import "css/styles.css";

function PointOfSaleTransactionHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useAxios(
    `https://biodynamics.tech/api_tokens/dashboard/store?store_id=${id}`
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.store || !data?.transactions)
    return <div>Error al obtener los datos</div>;

  const transactions = data?.transactions;

  const getTranslateTypes = (transaction) => {
    if (transaction.type === "order") {
      return "Compra";
    } else if (transaction.type === "charge") {
      return "Carga";
    } else if (transaction.type === "refund") {
      return "Reembolso";
    }
  };

  const columns = [
    {
      Header: "Fecha",
      accessor: "date",
      width: "30%",
      align: "left",
    },
    { Header: "Tipo", accessor: "type", align: "left" },
    {
      Header: "Estado",
      accessor: "status",
      align: "center",
    },
    { Header: "Detalle", accessor: "detail", align: "left" },
    { Header: "Monto", accessor: "amount", align: "center" },
  ];

  const rows = transactions.map((transaction) => ({
    date: (
      <MDTypography
        variant="caption"
        color="text"
        fontWeight="medium"
        style={{ color: transaction.type === "rejected" ? "red" : "inherit" }}
      >
        {moment(transaction.__createdtime__).format(
          "DD [de] MMMM YYYY HH:mm:ss A"
        )}
      </MDTypography>
    ),
    type: (
      <MDTypography
        variant="button"
        color="text"
        fontWeight="medium"
        style={{ color: transaction.type === "rejected" ? "red" : "inherit" }}
      >
        {getTranslateTypes(transaction)}
      </MDTypography>
    ),
    status: (
      <MDTypography
        variant="button"
        color="text"
        fontWeight="medium"
        style={{ color: transaction.type === "rejected" ? "red" : "inherit" }}
      >
        {transaction.status === "success" ? "Exitosa" : "Rechazada"}
      </MDTypography>
    ),
    detail: (
      <MDTypography
        variant="button"
        color="text"
        fontWeight="medium"
        style={{ color: transaction.type === "rejected" ? "red" : "inherit" }}
      >
        {transaction.description}
      </MDTypography>
    ),
    amount: (
      <MDTypography
        variant="caption"
        fontWeight="medium"
        style={{ color: transaction.type === "rejected" ? "red" : "inherit" }}
      >
        ${Math.abs(
          transaction.token_last_balance - transaction.token_new_balance
        )}
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
                <MDTypography variant="h6" color="white">
                  Historial de transacciones para {data.store.name}
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <div style={{ marginBottom: "2rem" }}>
                  <button
                    className="return-button"
                    onClick={() => navigate("/resumen")}
                  >
                    Volver a resumen
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
                  showTotalEntries={10}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PointOfSaleTransactionHistory;

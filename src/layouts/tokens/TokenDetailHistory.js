import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import "css/styles.css";

function TokenDetailHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useAxios(
    `https://biodynamics.tech/api_tokens/dashboard/token?token_id=${id}`
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.token || !data?.transactions) return <div>Error al obtener los datos</div>;

  const transactions = data?.transactions;

  //const [refreshing, setRefreshing] = useState(false);
  //const [tokens, setTokens] = useState([]);

{/*  useEffect(() => {
    // Simulando la obtención de datos
    const fetchData = async () => {
      // Aquí puedes realizar la lógica para obtener los detalles del token basado en el código
      // Por ejemplo, buscar en el objeto TokenDetailHistoryData
      const codeDetails = TokensData.tokens.find((item) => item.code === code);
      if (codeDetails) {
        setTokens(codeDetails.transactions);
        const initialBalance = calculateInitialBalance(
          codeDetails.transactions,
          codeDetails.balance
        );
        setBalance(initialBalance);
      }
    };

    fetchData();
  }, [code]);

  const calculateInitialBalance = (transactions, initialBalance) => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === "Compra" && transaction.status === "success") {
        return acc - transaction.amount;
      } else if (transaction.type === "Carga" && transaction.status === "success") {
        return acc + transaction.amount;
      }
      return acc;
    }, initialBalance);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular la recarga de datos
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };*/}

  const columns = [
    {
      Header: "Fecha",
      accessor: "registrationDate",
      align: "center",
    },
    { Header: "Tipo", accessor: "type", align: "left" },
    { Header: "Estado", accessor: "status", align: "left" },
    { Header: "Descripción", accessor: "detail", align: "left" },
    { Header: "Monto", accessor: "balance", align: "center" },
  ];

  const rows = transactions.map((transaction) => ({
    registrationDate: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {moment(transaction.__createdtime__).format("DD [de] MMMM YYYY HH:mm:ss A")}
      </MDTypography>
    ),
    type: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {transaction.type === "order" ? "Orden" : "Carga"}
      </MDTypography>
    ),
    status: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {transaction.status === "success" ? "Exitosa" : "Fallida"}
      </MDTypography>
    ),
    detail: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {transaction.description}
      </MDTypography>
    ),
    balance: (
      <MDTypography
        variant="caption"
        fontWeight="medium"
        style={{ color: transaction.type === "charge" ? "green" : "red" }}
      >
        {`${transaction.type === "charge" ? "+$" : "-$"}${transaction.token_last_balance - transaction.token_new_balance}`}
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
                  Historial de transacciones de Token {data.token.code}
                </MDTypography>
              </MDBox>
              <MDBox
                pt={3}
                px={2}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <MDTypography
                  variant="body1"
                  color="textPrimary"
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
                    Volver a Tokens
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

export default TokenDetailHistory;

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
//import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import { useParams } from "react-router-dom";
import "css/styles.css";
import PointOfSalesTransactionHistoryData from "layouts/transacciones/data/PointOfSalesTransactionHistoryData";

function PointOfSaleTransactionHistory() {
  /*const { code } = useParams();
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useAxios(
    `https://biodynamics.tech/api_tokens/event/tokens?id=${code}`
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    refetch();
  }, [code,refetch]);

  if (loading) return <div>Cargando...</div>;
  if (error || !data?._id || !data?.tokens) return <div>Error al obtener los datos</div>;

  const tokens = data?.tokens;*/

  const { pos } = useParams();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    console.log(pos);
    // Simulando la obtención de datos
    const fetchData = async () => {
      // Aquí puedes realizar la lógica para obtener los detalles del token basado en el código
      // Por ejemplo, buscar en el objeto TokenDetailHistoryData
      const posTransactions = PointOfSalesTransactionHistoryData.pos.find(
        (item) => item.pos === pos
      );
      if (posTransactions) {
        setTransactions(posTransactions.transactions);
      }
    };

    fetchData();
  }, [pos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular la recarga de datos
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

 const columns = [
    {
      Header: "Punto de venta",
      accessor: "pos",
      width: "30%",
      align: "left",
    },
    { Header: "Tipo", accessor: "type", align: "left" },
    {
      Header: "Fecha",
      accessor: "date",
      align: "center",
    },
    { Header: "Monto", accessor: "amount", align: "center" },
  ];

  const rows = transactions.map((transaction) => ({
    pos: (
      <MDTypography variant="caption" color="text" fontWeight="medium" style={{ color: transaction.type === 'failed' ? 'red' : 'inherit' }}>
        {pos.replace("_", " ")}
      </MDTypography>
    ),
    type: (
      <MDTypography variant="button" color="text" fontWeight="medium" style={{ color: transaction.type === 'failed' ? 'red' : 'inherit' }} >
        {transaction.type === "success" ? "Exitosa" : "Fallida"}
      </MDTypography>
    ),
    date: (
      <MDTypography variant="button" color="text" fontWeight="medium" style={{ color: transaction.type === 'failed' ? 'red' : 'inherit' }} >
        {moment(transaction.date).format("DD MMM YYYY")}
      </MDTypography>
    ),
    amount: (
      <MDTypography
        variant="caption"
        fontWeight="medium"
        style={{ color: transaction.type === 'failed' ? 'red' : 'inherit' }}
      >
        ${transaction.amount}
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
            Historial de transacciones para {pos}
          </MDTypography>
        </MDBox>
        <MDBox pt={3}>
          <div style={{ marginBottom: "2rem" }}>
            <button className="return-button" onClick={() => navigate("/transacciones")}>
              Volver a Transacciones
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

import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import 'moment/locale/es'; // without this line it didn't work
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
//import Footer from "examples/Footer";
import useAxios from "hooks/useAxios";
import MDBadge from "components/MDBadge";
import DataTable from "examples/Tables/DataTable";
import "./styles.css";
import SalesPerProduct from "layouts/reportes/components/SalesPerProduct";
import QuantitySoldByProduct from "layouts/reportes/components/QuantitySoldByProduct";

function PointOfSaleTransactionHistory() {
  moment.locale('es');
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [ saleResume , setSaleResume ] = useState({
    amount : 0 
  });
  const { data, loading, error, refetch } = useAxios(
    `https://biodynamics.tech/api_tokens/dashboard/store?store_id=${id}`
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const sortTransactions = data?.transactions.sort((trans1, trans2) => (trans2.__updatedtime__) - (trans1.__updatedtime__));
  let amountSales = sortTransactions?.reduce(function(prev, current) {
    return prev + ( Math.abs(current.token_last_balance - current.token_new_balance) )
  }, 0);

  const getTranslateTypes = (transaction) => {
    if (transaction.type === "order") {
      return "Orden";
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
      fontFamily:"montserrat-semibold",
      fontSize:"18px",
      width: "30%",
      align: "left",
    },
    { Header: "Tipo", accessor: "type",fontFamily:"montserrat-semibold",fontSize:"18px", align: "left" },
    {
      Header: "Estado",
      accessor: "status",
      fontFamily:"montserrat-semibold",
      fontSize:"18px",
      align: "center",
    },
    { Header: "Detalle", accessor: "detail",fontFamily:"montserrat-semibold",fontSize:"18px", align: "left" },
    { Header: "Monto", accessor: "amount",fontFamily:"montserrat-semibold", fontSize:"18px", align: "center" },
  ];

  if (loading) return <div>Cargando...</div>;

  if (error || !data?.store || !data?.transactions)
    return(
      <DashboardLayout>
        <DashboardNavbar main_title="" />
        <MDBox pt={6} pb={3}>
          <div>
            <MDTypography component="div" align="center" className="sale-transaction-title" color="white">
              Historial de {data.store.name}
            </MDTypography>
            <span display="flex" justifyContent="center">
              No hay transacciones
            </span>
          </div>
        </MDBox>
      </DashboardLayout>
    );

    
  const rows = sortTransactions.map((transaction) => ({
    date: (
      <MDTypography
        variant="caption"
        color="text"
        fontFamily="poppins"
        fontSize="16px"
        fontWeight="medium"
        style={{ color: transaction.status === "rejected" ? "red" : "inherit" }}
      >
        {moment(transaction.__createdtime__).format(
          "DD [de] MMMM YYYY HH:mm:ss A"
        )}
      </MDTypography>
    ),
    type: (
      <MDBox ml={-1}>
        <MDBadge fontFamily="poppins" badgeContent= {getTranslateTypes(transaction)}  color= {transaction.type === "order" ? "info" : "success"} variant="gradient" size="medium" />
      </MDBox>
    ),
    status: (
      <MDTypography
        fontFamily="poppins"
        fontSize="16px"
        variant="button"
        color="text"
        fontWeight="medium"
        style={{ color: transaction.status === "rejected" ? "red" : "inherit" }}
      >
        {transaction.status === "success" ? "Exitosa" : "Rechazada"}
      </MDTypography>
    ),
    detail: (
      <MDTypography
        fontFamily="poppins"
        fontSize="16px"
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
        fontFamily="poppins"
        fontSize="16px"
        variant="caption"
        color={ transaction.type === 'order' ? 'info' : 'success' }
        fontWeight="bold"
      >
        ${Math.abs(
          transaction.token_last_balance - transaction.token_new_balance
        )}
      </MDTypography>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar main_title={`Historial de ventas de ${data.store.name}`} />
      <MDBox pt={2} pb={2}>
        <Grid container>
          <Grid item xs={12} pt={1} pb={1}>
             
          </Grid>
          <Grid item xs={12} pt={1} pb={1}>
            <Card>
              <SalesPerProduct id_store={id}/>
            </Card>
          </Grid>
          <Grid item xs={12} pt={1} pb={1}>
            <Card>
              <QuantitySoldByProduct id_store={id}/>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <MDBox pt={2} pb={2}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={2}>
                <div style={{ marginBottom: "2rem", display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                  <MDTypography pt={2} pr={2} pl={2} component="div"
                    className="sale-transaction-title" color="text">
                    Historial de transacciones
                  </MDTypography>
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

export default PointOfSaleTransactionHistory;

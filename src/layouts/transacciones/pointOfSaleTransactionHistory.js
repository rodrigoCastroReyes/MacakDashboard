import React, { useState } from "react";
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
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from "@mui/system";

function PointOfSaleTransactionHistory() {
  moment.locale('es');
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [ saleResume , setSaleResume ] = useState({
    amount : 0 
  });
  const { data, loading, error, refetch } = useAxios(
    `https://biodynamics.tech/macak_dev/dashboard/store?store_id=${id}`
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

  const getTranslateStatus = (transaction) => {
    if (transaction.status === "success") {
      return "Exitosa";
    } else {
      return "Rechazada";
    }
  };

  const getTranslateTypes = (transaction) => {
    if (transaction.type === "order") {
      return "Orden";
    } else if (transaction.type === "charge") {
      return "Carga";
    } else if (transaction.type === "refund") {
      return "Reembolso";
    }
  };

  const RefreshButtonContainer = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: theme.spacing(3), // Agrega margen inferior para separar del campo de búsqueda
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
      justifyContent: "center",
    },
  }));

  const columns = [
    {
      Header: "Fecha",
      accessor: "date",
      fontFamily:"montserrat-semibold",
      fontSize:"14px",
      width: "30%",
      align: "center",
    },
    {
      Header: "Estado",
      accessor: "status",
      fontFamily:"montserrat-semibold",
      fontSize:"14px",
      align: "center",
    },
    { Header: "Monto", accessor: "amount",fontFamily:"montserrat-semibold", fontSize:"14px", align: "center" },
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
        fontSize="12px"
        fontWeight="medium"
        style={{ color: transaction.status === "rejected" ? "red" : "inherit" }}
      >
        {moment(transaction.__createdtime__).format(
          "DD [de] MMM YYYY HH:mm A"
        )}
      </MDTypography>
    ),
    status: (
      <MDBox ml={-1}>
        <MDBadge fontFamily="poppins" badgeContent= {getTranslateStatus(transaction)}  color= {transaction.status === "order" ? "info" : "success"} variant="gradient" size="medium" />
      </MDBox>
    ),
    amount: (
      <MDTypography
        fontFamily="poppins"
        fontSize="12px"
        variant="caption"
        color={ transaction.type === 'order' ? '#7b809a' : 'success' }
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
      <MDBox pt={1} pb={2}>
        <Grid container>
          <Grid item xs={12} pt={1} pb={1}>
            <Card>
              <SalesPerProduct id_store={id}/>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <MDBox pt={1} pb={2}>
        <Grid container spacing={6}>
          <Grid item xs={8}>
            <Card>
              <MDBox pt={2} pb={2}>
                <div style={{ marginBottom: "2rem", display: "flex", "justify-content": "space-between", "alignItems": "center" }}>
                  <MDTypography pr={2} pl={2} component="div"
                    className="event-title" color="text">
                    Historial de transacciones
                  </MDTypography>
                  <RefreshButtonContainer>
                    <div style={{ paddingTop: "10px", display: "flex", justifyContent: "center", alignItems: "center" }} >
                      <RefreshIcon className="custom-btn-icon"  onClick={handleRefresh} fontSize="medium" />
                    </div>
                  </RefreshButtonContainer>
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
          <Grid item xs={4}>
            <Card>
              <QuantitySoldByProduct id_store={id}/>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default PointOfSaleTransactionHistory;

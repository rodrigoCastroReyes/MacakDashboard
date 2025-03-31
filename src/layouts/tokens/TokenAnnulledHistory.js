import React, { useEffect, useMemo, useState } from "react";
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

function TokenAnulledHistory({id}) {
  const [refreshing, setRefreshing] = useState(false);
  const [ rows, setRows ] = useState(null);
  const { data, loading, err, refetch } = useAxios(
    `https://biodynamics.tech/macak_dev/transaction/get_anulled_transactions_of_token?token_id=${id}`
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  moment().locale('es');

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

  useEffect(() => {
    let result = data?.transactions.map((transaction) => ({
      registrationDate: (
        <MDTypography fontFamily='poppins' variant="caption" color="text" fontWeight="medium">
          {moment(transaction.__updatedtime__).format("DD [de] MMMM YYYY HH:mm:ss A")}
        </MDTypography>
      ),
      type: (
        <MDBox ml={-1}>
          <MDBadge
            className="customBadge"
            fontFamily="poppins"
            fontSize="14px"
            badgeContent={transaction.type === "order" ? "Compra anulada" : "Carga anulada"}
            color="primary"
            variant="gradient"
          />
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
          color="primary"
        >
          {getBalanceChangeDisplay(transaction)}
        </MDTypography>
      ),
    }));
    setRows(result)
  }, [data?.transactions]);

  if (loading ) return <div>Cargando...</div>;
  if(!data?.transactions) return <div>Error obteniendo datos</div>

  return (
    <>
      { rows && 
        <DataTable
        pb={2}
        table={{ columns, rows  }}
        isSorted={false}
        entriesPerPage={false}
        showTotalEntries={false}
        noEndBorder
       />
      }
    </>
  );
}

export default TokenAnulledHistory;

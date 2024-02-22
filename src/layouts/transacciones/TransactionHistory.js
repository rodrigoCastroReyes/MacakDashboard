import React, { useState } from "react";
import moment from "moment";
import MDTypography from "components/MDTypography";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/styles.css";
import MDBox from "components/MDBox";
import MDBadge from "components/MDBadge";

function TransactionHistory({numRows}) {
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useAxios(
    "https://biodynamics.tech/api_tokens/dashboard/event?event_id=f9b857ac-16f2-4852-8981-b72831e7f67c"
  );
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.event_id || !data?.transactions) return <div>Error al obtener los datos</div>;
  var transactions;
  if(numRows == -1){
    transactions = data?.transactions;
  }else{
    transactions = data?.transactions.slice(0,numRows);
  }

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
    { Header: "Token", accessor: "token", align: "left" },
    { Header: "Detalle", accessor: "detail", align: "left" },
    { Header: "Monto", accessor: "amount", align: "center" },
  ];

  const rows = transactions.map((transaction) => ({
    date: (
      <MDTypography fontFamily="poppins" variant="button" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'error' : 'inherit' }}>
        {moment(transaction.__createdtime__).format("DD [de] MMMM YYYY HH:mm:ss A")}
      </MDTypography>
    ),
    type: (
      <MDBox ml={-1}>
        <MDBadge fontFamily="poppins" badgeContent= {transaction.type === "order" ? "Orden" : "Carga"}  color= {transaction.type === "order" ? "info" : "success"} variant="gradient" size="sm" />
      </MDBox>
    ),
    status: (
      <MDTypography fontFamily="poppins" variant="caption" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'error' : 'inherit' }} >
        {transaction.status === 'success' ? 'Exitosa' : 'Fallida'}
      </MDTypography>
    ),
    detail: (
      <MDTypography fontFamily="poppins" variant="caption" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'error' : 'inherit' }} >
        {transaction.description}
      </MDTypography>
    ),
    token: (
      <MDTypography fontFamily="poppins" variant="caption" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'error' : 'inherit' }} >
        {transaction.token_id.code}
      </MDTypography>
    ),
    amount: (
      <MDTypography fontFamily="poppins" variant="caption" color={ transaction.type === 'order' ? 'info' : 'success' } fontWeight="bold" >
        ${Math.abs(transaction.token_last_balance - transaction.token_new_balance)}
      </MDTypography>
    ),
  }));

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <button  className="refresh-button" onClick={handleRefresh} disabled={refreshing}>
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
    </>
  );
}

export default TransactionHistory;


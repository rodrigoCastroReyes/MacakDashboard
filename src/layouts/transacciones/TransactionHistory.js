import React, { useState } from "react";
import moment from "moment";
import MDTypography from "components/MDTypography";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/styles.css";

function TransactionHistory() {
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

const transactions = data?.transactions;

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
      <MDTypography variant="button" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'red' : 'inherit' }}>
        {moment(transaction.__createdtime__).format("DD [de] MMMM YYYY HH:mm:ss A")}
      </MDTypography>
    ),
    type: (
      <MDTypography variant="button" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'red' : 'inherit' }} >
        {transaction.type === "order" ? "Orden" : "Carga"}
      </MDTypography>
    ),
    status: (
      <MDTypography variant="caption" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'red' : 'inherit' }} >
        {transaction.status === 'success' ? 'Exitosa' : 'Fallida'}
      </MDTypography>
    ),
    detail: (
      <MDTypography variant="caption" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'red' : 'inherit' }} >
        {transaction.description}
      </MDTypography>
    ),
    amount: (
      <MDTypography variant="caption" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'red' : 'inherit' }} >
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
        showTotalEntries={10}
        noEndBorder
      />
    </>
  );
}

export default TransactionHistory;


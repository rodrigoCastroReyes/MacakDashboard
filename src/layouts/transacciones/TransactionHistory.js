import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import MDTypography from "components/MDTypography";
//import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import TransactionsData from "layouts/transacciones/data/PointOfSalesTransactionHistoryData";
import "css/styles.css";

function TransactionHistory() {
  const [refreshing, setRefreshing] = useState(false);
 {/* const { data, loading, error, refetch } = useAxios(
    "https://biodynamics.tech/api_tokens/event/tokens?id=f9b857ac-16f2-4852-8981-b72831e7f67c"
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (error || !data?._id || !data?.tokens) return <div>Error al obtener los datos</div>;

const tokens = data?.tokens;*/}

  const [pos, setPos] = useState([]);


  useEffect(() => {
    // Simulando la obtención de datos
    const fetchData = async () => {
      const pos = TransactionsData.pos;
      if (pos) {
        setPos(pos);
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

  const rows = pos.map((sp) => ({
    pos: (
      <MDTypography variant="button" color="text" fontWeight="medium" style={{ color: sp.transactions[0].type === 'failed' ? 'red' : 'inherit' }}>
        <Link className='custom-link' to={`/transaccion/${sp.pos.replace(" ","_")}`}>{sp.pos}</Link>
      </MDTypography>
    ),
    type: (
      <MDTypography variant="button" color="text" fontWeight="medium" style={{ color: sp.transactions[0].type === 'failed' ? 'red' : 'inherit' }} >
        {sp.transactions[0].type === 'success' ? 'Exitosa' : 'Fallida'}
      </MDTypography>
    ),
    date: (
      <MDTypography variant="caption" color="text" fontWeight="medium" style={{ color: sp.transactions[0].type === 'failed' ? 'red' : 'inherit' }} >
        {moment(sp.transactions[0].date).format("DD MMM YYYY")}
      </MDTypography>
    ),
    amount: (
      <MDTypography variant="caption" color="text" fontWeight="medium" style={{ color: sp.transactions[0].type === 'failed' ? 'red' : 'inherit' }} >
        ${sp.transactions[0].amount}
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


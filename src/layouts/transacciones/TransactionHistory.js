import React, { useState, useMemo } from "react";
import moment from "moment";
import 'moment/locale/es'; // without this line it didn't work
import MDTypography from "components/MDTypography";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/styles.css";
import MDBox from "components/MDBox";
import MDBadge from "components/MDBadge";
import MDInput from "components/MDInput";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

moment.locale('es');

function TransactionHistory({ numRows }) {
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, refetch } = useAxios(
    "https://biodynamics.tech/api_tokens/dashboard/event?event_id=f9b857ac-16f2-4852-8981-b72831e7f67c"
  );
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filterByCode = (tokens, searchTerm) => {
    return tokens.filter(token => token.code.includes(searchTerm));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTokens = useMemo(() => {
    if (!searchTerm) {
      return data?.transactions || [];
    }
    return filterByCode(data?.transactions || [], searchTerm);
  }, [data?.transactions, searchTerm]);

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.event_id || !data?.transactions) return <div>Error al obtener los datos</div>;
  let transactions;
  if(numRows === -1){
    transactions = filteredTokens;
  }else{
    transactions = filteredTokens.slice(0,numRows);
  }

  const columns = [
    {
      Header: "Fecha",
      accessor: "date",
      fontFamily: "montserrat-semibold",
      fontSize:"14px",
      width: "30%",
      align: "left",
    },
    { Header: "Tipo", accessor: "type",fontFamily: "montserrat", fontSize:"14px", align: "left" },
    {
      Header: "Estado",
      accessor: "status",
      fontFamily: "montserrat-semibold",
      fontSize:"14px",
      align: "center",
    },
    { Header: "Token", accessor: "token",fontFamily: "montserrat-semibold", fontSize:"14px", align: "left" },
    { Header: "Detalle", accessor: "detail",fontFamily: "montserrat-semibold",fontSize:"14px", align: "left" },
    { Header: "Monto", accessor: "amount",fontFamily: "montserrat-semibold",fontSize:"14px", align: "center" },
  ];

  const rows = transactions.map((transaction) => ({
    date: (
      <MDTypography fontFamily="poppins" fontSize="14px" variant="button" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'error' : 'inherit' }}>
        {moment(transaction.__createdtime__).format("DD [de] MMMM YYYY HH:mm:ss A")}
      </MDTypography>
    ),
    type: (
      <MDBox ml={-1}>
        <MDBadge class="customBadge" fontFamily="poppins" fontSize="14px" badgeContent= {transaction.type === "order" ? "Compra" : "Carga"}  color= {transaction.type === "order" ? "info" : "success"} variant="gradient"/>
      </MDBox>
    ),
    status: (
      <MDTypography fontFamily="poppins"fontSize="14px" variant="caption" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'error' : 'inherit' }} >
        {transaction.status === 'success' ? 'Exitosa' : 'Fallida'}
      </MDTypography>
    ),
    detail: (
      <MDTypography fontFamily="poppins" fontSize="14px" variant="caption" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'error' : 'inherit' }} >
        {transaction.description}
      </MDTypography>
    ),
    token: (
      <MDTypography fontFamily="poppins" fontSize="14px" variant="caption" color="text" fontWeight="medium" style={{ color: transaction.status === 'failed' ? 'error' : 'inherit' }} >
        <Link className='custom-link' to={`/token/${transaction.token_id._id}`}> {transaction.token_id.code} </Link>
      </MDTypography>
    ),
    amount: (
      <MDTypography fontFamily="poppins" fontSize="14px" variant="caption" color={ transaction.type === 'order' ? 'info' : 'success' } fontWeight="bold" >
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

TransactionHistory.propTypes = {
  numRows: PropTypes.number,
};

export default TransactionHistory;


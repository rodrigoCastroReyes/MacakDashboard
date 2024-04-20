import React, { useState, useMemo } from "react";
import { styled } from "@mui/system";
import moment from "moment";
import "moment/locale/es"; // without this line it didn't work
import MDTypography from "components/MDTypography";
import { Typography } from "@mui/material";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/styles.css";
import MDBox from "components/MDBox";
import MDBadge from "components/MDBadge";
import MDInput from "components/MDInput";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

//Import del Filtro
import Filtro from "components/MDFilter/index"

moment.locale("es");

const SearchInput = styled(MDInput)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    width: "50%",
  },
  [theme.breakpoints.up("sm")]: {
    width: "auto", // Ajusta el ancho según tus necesidades
  },
}));

const RefreshButtonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: theme.spacing(2), // Agrega margen inferior para separar del campo de búsqueda
  marginBottom: theme.spacing(2), // Agrega margen inferior para separar del campo de búsqueda
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    justifyContent: "center",
  },
}));

function TransactionHistory({ numRows }) {
  const url = "https://biodynamics.tech/api_tokens/";
  const event_id = "f9b857ac-16f2-4852-8981-b72831e7f67c";
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading, error, refetch } = useAxios(
    `${url}dashboard/event?event_id=${event_id}`
  );
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filterByCode = (tokens, searchTerm) => {
  return tokens.filter((token) => {
    return token?.token_id?.code?.toLowerCase() && token.token_id.code.toLowerCase().includes(searchTerm.toLowerCase());
  });
  };

  const [filtro, setFiltro] = useState({ carga: false, compra: false });

  const parsePaymentMethod = (payment_method)=>{
    if(payment_method == "cash"){
      return "Efectivo";
    }else if(payment_method == "credit_card"){
      return "TC";
    }else{
      return "Efectivo";
    }
  }

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
  if (error || !data?.event_id || !data?.transactions)
    return <div>Error al obtener los datos</div>;
  let transactions;
  if (numRows === -1) {
    transactions = filteredTokens;
  } else {
    transactions = filteredTokens.slice(0, numRows);
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (!filtro.carga && !filtro.compra) {
      return false;
    }
    if (filtro.carga && transaction.type !== 'order') {
      return true;
    }
    if (filtro.compra && transaction.type === 'order') {
      return true;
    }
    return false;
  });

  const columns = [
    {
      Header: "Fecha",
      accessor: "date",
      fontFamily: "montserrat-semibold",
      fontSize: "14px",
      width: "30%",
      align: "left",
    },
    {
      Header: "Tipo",
      accessor: "type",
      fontFamily: "montserrat",
      fontSize: "14px",
      align: "left",
    },
    {
      Header: "Detalle",
      accessor: "detail",
      fontFamily: "montserrat-semibold",
      fontSize: "14px",
      align: "left",
    },
    {
      Header: "Estado",
      accessor: "status",
      fontFamily: "montserrat-semibold",
      fontSize: "14px",
      align: "center",
    },
    {
      Header: "Token",
      accessor: "token",
      fontFamily: "montserrat-semibold",
      fontSize: "14px",
      align: "left",
    },
    {
      Header: "Monto",
      accessor: "amount",
      fontFamily: "montserrat-semibold",
      fontSize: "14px",
      align: "center",
    },
  ];

  const rows = filteredTransactions.map((transaction) => ({
    date: (
      <MDTypography
        fontFamily="poppins"
        fontSize="12px"
        variant="button"
        color="text"
        fontWeight="medium"
        style={{ color: transaction.status === "failed" ? "error" : "inherit" }}
      >
        {moment(transaction.__createdtime__).format(
          "DD [de] MMMM YYYY HH:mm:ss A"
        )}
      </MDTypography>
    ),
    type: (
      <MDBox ml={-1}>
        <MDBadge
          className="customBadge"
          fontFamily="poppins"
          fontSize="12px"
          badgeContent={transaction.type === "order" ? "Compra" : "Carga"}
          color={transaction.type === "order" ? "info" : "success"}
          variant="gradient"
        />
      </MDBox>
    ),
    detail: (
      <MDTypography
        fontFamily="poppins"
        fontSize="12px"
        variant="caption"
        color="text"
        fontWeight="medium"
        style={{ color: transaction.payment_method === "cash" ? "info" : "success" }}
      >
        { parsePaymentMethod(transaction.payment_method)}
      </MDTypography>
    ),
    status: (
      <MDTypography
        fontFamily="poppins"
        fontSize="14px"
        variant="caption"
        color="text"
        fontWeight="medium"
        style={{ color: transaction.status === "failed" ? "error" : "inherit" }}
      >
        {transaction.status === "success" ? "Exitosa" : "Fallida"}
      </MDTypography>
    ),
    token: (
      <MDTypography
        fontFamily="poppins"
        fontSize="12px"
        variant="caption"
        color="text"
        fontWeight="medium"
        style={{ color: transaction.status === "failed" ? "error" : "inherit" }}
      >
        <Link className="custom-link" to={`/token/${transaction.token_id._id}`}>
          {" "}
          {transaction.token_id.code}{" "}
        </Link>
      </MDTypography>
    ),
    amount: (
      <MDTypography
        fontFamily="poppins"
        fontSize="12px"
        variant="caption"
        color={transaction.type === "order" ? "info" : "success"}
        fontWeight="bold"
      >
        $
        {Math.abs(
          transaction.token_last_balance - transaction.token_new_balance
        )}
      </MDTypography>
    ),
  }));

  return (
    <MDBox pt={3} pr={2} pl={2} pb={3}>
      <Typography pr={2} pl={2} className="event-title">
        Transacciones
      </Typography>
      <div style={{ margin: "1rem 1rem 0.5rem 1rem", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent:"space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <SearchInput
            fontFamily="poppins"
            type="search"
            label="Buscar"
            placeholder="Buscar por código..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
  
          <RefreshButtonContainer>
            <div>
              <RefreshIcon className="custom-btn-icon"  onClick={handleRefresh} fontSize="medium" />
            </div>
            <Link className='custom-btn-icon custom-link' to={`${url}report/generate_report_of_event?event_id=${event_id}`} target="_blank" download>
              <DownloadIcon style={{ margin: "0px 10px", cursor:"pointer"}} fontSize="medium"  />
            </Link>
          </RefreshButtonContainer>
        </div>

        <div style={{ margin: "0rem 0rem 0rem 0.2rem" }}>
        <Filtro onFilterChange={setFiltro} />
        </div>

      </div>
  
      <DataTable
        table={{ columns, rows }}
        isSorted={false}
        entriesPerPage={false}
        showTotalEntries={false}
        noEndBorder
      />
    </MDBox>
  );
}

TransactionHistory.propTypes = {
  numRows: PropTypes.number,
};

export default TransactionHistory;

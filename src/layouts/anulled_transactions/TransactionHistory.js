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
import RefreshIcon from '@mui/icons-material/Refresh';

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
  marginRight: theme.spacing(3), // Agrega margen inferior para separar del campo de búsqueda
  marginTop: theme.spacing(2), // Agrega margen inferior para separar del campo de búsqueda
  marginBottom: theme.spacing(2), // Agrega margen inferior para separar del campo de búsqueda
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    justifyContent: "center",
  },
}));

function TransactionHistory({ numRows }) {
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading, error, refetch } = useAxios(
    "https://biodynamics.tech/api_tokens/dashboard/recharge_anulled?event_id=f9b857ac-16f2-4852-8981-b72831e7f67c"
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTokens = useMemo(() => {
    if (!searchTerm) {
      return data?.transactions || [];
    }
    return filterByCode(data?.transactions || [], searchTerm);
  }, [data?.transactions, searchTerm]);

  console.log(data);
  if (loading) return <div>Cargando...</div>;
  if (error || !data?.transactions)
    return <div>Error al obtener los datos</div>;

  let transactions;
  if (numRows === -1) {
    transactions = filteredTokens;
  } else {
    transactions = filteredTokens.slice(0, numRows);
  }

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

  const rows = transactions.map((transaction) => ({
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
          badgeContent={transaction.type === "order" ? "Compra" : "Carga anulada"}
          color="primary"
          variant="gradient"
        />
      </MDBox>
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
        <Link className="custom-link" to={`/token/${transaction.token_id.code}`}>
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
        color="primary"
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
        Lista de transacciones
      </Typography>
      <div style={{ margin: "1rem 1rem 2rem 1rem", display: "flex", alignItems: "center", justifyContent:"space-between" }}>
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
  );
}

TransactionHistory.propTypes = {
  numRows: PropTypes.number,
};

export default TransactionHistory;

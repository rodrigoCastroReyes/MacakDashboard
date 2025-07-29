import React, { useState, useMemo } from "react";
import { styled } from "@mui/system";
import moment from "moment";
import "moment/locale/es";
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
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

// Filtro
import Filtro from "components/MDFilter/index";

// URL
import { API_BASE_URL } from "../../config";

moment.locale("es");

const SearchInput = styled(MDInput)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    width: "50%",
  },
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
}));

const RefreshButtonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    justifyContent: "center",
  },
}));

function TransactionHistory({ numRows }) {
  const event_id = localStorage.getItem("eventId");
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/event?event_id=${event_id}`
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filterByCode = (tokens, searchTerm) => {
    return tokens.filter((token) => {
      return token?.token_id?.code
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  };

  const [filtro, setFiltro] = useState({
    activacion: false,
    carga: false,
    compra: false,
  });

  const parseTypeOfTransaction = (transaction) => {
    switch (transaction.type) {
      case "activation":
        return "activación";
      case "order":
        return "compra";
      case "recharge":
      default:
        return "carga";
    }
  };

  const parsePaymentMethod = (payment_method) => {
    if (payment_method === "cash") return "Efectivo";
    if (payment_method === "credit_card") return "TC";
    return payment_method || "N/A";
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTokens = useMemo(() => {
    if (!searchTerm) return data?.transactions || [];
    return filterByCode(data?.transactions || [], searchTerm);
  }, [data?.transactions, searchTerm]);

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.event_id || !data?.transactions)
    return <div>Error al obtener los datos</div>;

  let transactions =
    numRows === -1 ? filteredTokens : filteredTokens.slice(0, numRows);

  const filteredTransactions = transactions.filter((transaction) => {
    const tipo = transaction.type;

    if (!filtro.activacion && !filtro.carga && !filtro.compra) return false;

    if (filtro.activacion && tipo === "activation") return true;
    if (filtro.carga && tipo === "recharge") return true;
    if (filtro.compra && tipo === "order") return true;

    return false;
  });

  const columns = [
    { Header: "Fecha", accessor: "date", align: "left" },
    { Header: "Tipo", accessor: "type", align: "left" },
    { Header: "Detalle", accessor: "detail", align: "left" },
    { Header: "Estado", accessor: "status", align: "center" },
    { Header: "Token", accessor: "token", align: "left" },
    { Header: "Monto", accessor: "amount", align: "center" },
  ];

  const rows = filteredTransactions.map((transaction) => ({
    date: (
      <MDTypography
        fontSize="12px"
        variant="button"
        color="text"
        fontWeight="medium"
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
          fontSize="12px"
          badgeContent={parseTypeOfTransaction(transaction)}
          color={
            transaction.type === "order" && transaction.status !== "success"
              ? "error"
              : transaction.type === "order"
              ? "warning"
              : transaction.type === "recharge"
              ? "success"
              : "info"
          }
          variant="gradient"
        />
      </MDBox>
    ),
    detail: (
      <MDTypography
        fontSize="12px"
        variant="caption"
        color="text"
        fontWeight="medium"
      >
        {parsePaymentMethod(transaction.payment_method)}
      </MDTypography>
    ),
    status: (
      <MDTypography
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
        fontSize="12px"
        variant="caption"
        color="text"
        fontWeight="medium"
      >
        <Link className="custom-link" to={`/token/${transaction.token_id._id}`}>
          {transaction.token_id.code}
        </Link>
      </MDTypography>
    ),
    amount: (
      <MDTypography
        fontSize="12px"
        variant="caption"
        color={
          transaction.type === "order"
            ? "warning"
            : transaction.type === "recharge"
            ? "success"
            : "info"
        }
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

      <div
        style={{
          margin: "1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <SearchInput
            type="search"
            label="Buscar"
            placeholder="Buscar por código..."
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <RefreshButtonContainer>
            <div>
              <RefreshIcon
                className="custom-btn-icon"
                onClick={handleRefresh}
                fontSize="medium"
              />
            </div>
            <Link
              className="custom-btn-icon custom-link"
              to={`${API_BASE_URL}/report/generate_report_of_event?event_id=${event_id}`}
              target="_blank"
              download
            >
              <DownloadIcon
                style={{ margin: "0px 10px", cursor: "pointer" }}
                fontSize="medium"
              />
            </Link>
          </RefreshButtonContainer>
        </div>

        <div style={{ margin: "0.5rem 0 0 0.2rem" }}>
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

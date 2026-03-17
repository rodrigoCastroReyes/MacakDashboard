import React, { useState, useMemo, useCallback } from "react";
import { styled, useTheme } from "@mui/system";
import moment from "moment";
import "moment/locale/es";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

// Componentes de la librería (asumo que MD son de Material Dashboard)
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import MDBadge from "components/MDBadge";
import MDInput from "components/MDInput";
import DataTable from "examples/Tables/DataTable";

// Filtro (asumo que este componente gestiona los estados del filtro)
import Filtro from "components/MDFilter/index";

// Hooks y Configuración
import useAxios from "hooks/useAxios";
import { API_BASE_URL } from "../../config";

// Estilos globales (asumo que están bien)
import "css/styles.css";

// Configuración de Moment
moment.locale("es");

// --- Estilos CSS en JS (Styled Components) ---

// Usamos useTheme para acceder a los breakpoints si se usa @mui/system/styled
// Se utiliza useTheme dentro del componente para evitar este uso en el styled
const SearchInput = styled(MDInput)(({ theme }) => ({
  width: "100%", // Por defecto en pantallas pequeñas
  maxWidth: "250px", // Limitar el ancho en pantallas grandes para que no ocupe todo
  marginBottom: theme.spacing(1),
  [theme.breakpoints.up("sm")]: {
    width: "auto",
    marginBottom: 0,
  },
}));

const ControlsContainer = styled(MDBox)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  margin: theme.spacing(1, 0),
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const ActionButtonsContainer = styled(MDBox)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
}));

// --- Componente Principal ---

function TransactionHistory({ numRows }) {
  const theme = useTheme(); // Para usar el theme en el componente si fuera necesario
  const event_id = localStorage.getItem("eventId");
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState({
    activacion: false,
    carga: false,
    compra: false,
  });

  const page = 1;
  const limit = 20;

  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/event?event_id=${event_id}&page=${page}&limit=${limit}`
  );

  // --- Handlers ---

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Agregamos un pequeño delay para que el indicador de carga se vea si la respuesta es muy rápida
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // --- Utils ---

  const parseTypeOfTransaction = (transaction) => {
    switch (transaction.type) {
      case "activation":
        return "activación";
      case "order":
        return "compra";
      case "recharge":
        return "carga";
      default:
        return "desconocido";
    }
  };

  const parsePaymentMethod = (payment_method) => {
    if (payment_method === "cash") return "Efectivo";
    if (payment_method === "credit_card") return "TC";
    if (payment_method === "transfer") return "Transferencia";
    return payment_method || "N/A";
  };

  // --- Lógica de Filtrado (useMemo) ---

  const transactions = useMemo(() => data?.transactions || [], [data?.transactions]);

  const filteredAndSearchedTransactions = useMemo(() => {
    let result = transactions;

    // 1. Filtrado por Tipo (Filtro)
    const hasActiveFilter = filtro.activacion || filtro.carga || filtro.compra;

    if (hasActiveFilter) {
      result = result.filter((transaction) => {
        const tipo = transaction.type;
        // Si ningún filtro está activo, no debería filtrar nada (pero la lógica original lo hace)
        // Corregido: si tiene filtro activo, aplicamos la lógica
        if (filtro.activacion && tipo === "activation") return true;
        if (filtro.carga && tipo === "recharge") return true;
        if (filtro.compra && tipo === "order") return true;
        return false;
      });
    }

    // 2. Búsqueda por Código (Search)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter((transaction) => {
        // Asegurarse de que `token_id` y `code` existen antes de acceder
        return transaction?.token_id?.code?.toLowerCase().includes(lowerCaseSearchTerm);
      });
    }

    // 3. Límite de Filas (numRows)
    if (numRows !== -1) {
      result = result.slice(0, numRows);
    }

    return result;
  }, [transactions, searchTerm, filtro, numRows]);

  // --- Manejo de Estados de Carga/Error ---

  if (loading && !refreshing) return <MDTypography>Cargando transacciones...</MDTypography>;
  if (error || !data?.event_id || !transactions) {
    return (
      <MDTypography color="error">
        Error al obtener los datos. Intente recargar.
      </MDTypography>
    );
  }

  // Si no hay transacciones después de cargar
  if (transactions.length === 0) {
    return <MDTypography>No hay transacciones registradas para este evento.</MDTypography>;
  }


  // --- Configuración de la Tabla ---

  const columns = [
    { Header: "Fecha", accessor: "date", align: "left" },
    { Header: "Tipo", accessor: "type", align: "left" },
    { Header: "Detalle", accessor: "detail", align: "left" },
    { Header: "Estado", accessor: "status", align: "center" },
    { Header: "Token", accessor: "token", align: "left" },
    { Header: "Monto", accessor: "amount", align: "center" },
  ];

  const rows = filteredAndSearchedTransactions.map((transaction) => ({
    date: (
      <MDTypography fontSize="12px" variant="button" color="text" fontWeight="medium">
        {moment(transaction.__createdtime__).format("DD [de] MMMM YYYY HH:mm:ss A")}
      </MDTypography>
    ),
    type: (
      <MDBox ml={-1}>
        <MDBadge
          // className="customBadge" // Si 'customBadge' solo define tamaño, usa la prop fontSize
          fontSize="12px"
          badgeContent={parseTypeOfTransaction(transaction)}
          color={
            transaction.type === "order"
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
      <MDTypography fontSize="12px" variant="caption" color="text" fontWeight="medium">
        {parsePaymentMethod(transaction.payment_method)}
      </MDTypography>
    ),
    status: (
      <MDTypography
        fontSize="14px"
        variant="caption"
        // Corregido: Usa la prop color de MDTypography si está disponible o el color directo
        color={transaction.status === "failed" ? "error" : "text"}
        fontWeight="medium"
      >
        {transaction.status === "success" ? "Exitosa" : "Fallida"}
      </MDTypography>
    ),
    token: (
      <MDTypography fontSize="12px" variant="caption" color="text" fontWeight="medium">
        {/* Agregada la validación para evitar errores si token_id no existe */}
        {transaction.token_id?.code ? (
          <Link className="custom-link" to={`/token/${transaction.token_id._id}`}>
            {transaction.token_id.code}
          </Link>
        ) : (
          "N/A"
        )}
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
        {/* Agregado formato a moneda y verificación de que las propiedades existen */}
        ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2 }).format(
            Math.abs(
              (transaction.token_last_balance || 0) - (transaction.token_new_balance || 0)
            )
          )}
      </MDTypography>
    ),
  }));

  // --- Renderizado del Componente ---

  return (
    <MDBox pt={3} pr={2} pl={2} pb={3}>
      <Typography variant="h5" mb={2} className="event-title">
        Historial de Transacciones
      </Typography>

      <ControlsContainer>
        <SearchInput
          type="search"
          label="Buscar"
          placeholder="Buscar por código de token..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <ActionButtonsContainer>
          <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <RefreshIcon
              className="custom-btn-icon"
              onClick={handleRefresh}
              fontSize="medium"
              // Indicador visual de refreshing
              style={{
                animation: refreshing ? "spin 1s linear infinite" : "none",
                color: refreshing ? theme.palette.info.main : theme.palette.text.primary,
              }}
            />
          </div>

          <Link
            className="custom-btn-icon custom-link"
            to={`${API_BASE_URL}/report/generate_report_of_event?event_id=${event_id}`}
            target="_blank"
            download
            style={{ display: "flex", alignItems: "center" }}
          >
            <DownloadIcon fontSize="medium" />
          </Link>
        </ActionButtonsContainer>
      </ControlsContainer>

      <MDBox my={1}>
        {/* Asegúrate de que el componente Filtro envía los cambios de estado a setFiltro */}
        <Filtro onFilterChange={setFiltro} />
      </MDBox>

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

// Agrega este CSS simple si usas la animación de spin para RefreshIcon
// Si usas un archivo CSS, ponlo en `css/styles.css`
/*
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
*/
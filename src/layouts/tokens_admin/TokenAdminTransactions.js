import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
// Importar la librería para Excel. Asegúrate de instalarla: npm install xlsx
import * as XLSX from 'xlsx'; 
// Bibliotecas y Componentes de Material UI / Externos
import moment from "moment";
import 'moment/locale/es'; 
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import MDBadge from "components/MDBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import FileDownloadIcon from '@mui/icons-material/FileDownload'; // 1. Nuevo ícono para descargar
import MDButton from "components/MDButton"; 
import { Typography } from "@mui/material";

// URL de Configuración
import { API_BASE_URL } from '../../config';
import { fontSize } from "@mui/system";

// Configura moment para usar el español
moment.locale('es'); 

function TokenAdminTransactions() {
  const { id_user } = useParams();
  const navigate = useNavigate(); 
  
  const event_id = localStorage.getItem("eventId"); 
  const [refreshing, setRefreshing] = useState(false);

  // Endpoint de la API
  const apiUrl = `${API_BASE_URL}/transaction/get_transaction_by_id_user?id_user=${id_user}&event_id=${event_id}`;
  console.log("API URL:", apiUrl);
  
  // Asumimos que `data` es el array de transacciones
  const { data: transactions, loading, error, refetch } = useAxios(apiUrl);
  console.log(transactions);

  // Función para volver a la página anterior
  const handleGoBack = () => {
    navigate(-1); 
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  /**
   * Helper para traducir el tipo de transacción.
   */
  const getTranslateTypes = (transaction) => {
    if (!transaction || !transaction.type) return "Otro";

    if(transaction.payment_method === "transfer")
      return "Transferencia";

    switch (transaction.type) {
      case "order":
        return "Compra";
      case "recharge":
        return "Carga";
      case "refund":
        return "Reembolso";
      default:
        return "Otro";
    }
  };

  /**
   * Helper para obtener la visualización del cambio de saldo (Monto).
   */
  const getBalanceChangeDisplay = (transaction) => {
    const { status, type, token_last_balance, token_new_balance } = transaction;

    const lastBalance = parseFloat(token_last_balance) || 0;
    const newBalance = parseFloat(token_new_balance) || 0;
    
    // Calcula la magnitud del cambio sin signo
    const changeMagnitude = Math.abs(lastBalance - newBalance);
    const formattedChange = changeMagnitude.toFixed(2);

    if (status === "rejected") {
      return `$${formattedChange}`; // Monto sin signo para transacciones anuladas
    }

    if (status === "success") {
      if (type === "order") {
        return `-$${formattedChange}`; // Gasto (resta)
      } else if (type === "recharge" || type === "refund") {
        return `+$${formattedChange}`; // Ingreso (suma)
      }
    }

    return `$${formattedChange}`;
  };

  /**
   * 2. Nueva función para descargar los datos a Excel
   */
  const handleDownloadExcel = () => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      alert("No hay transacciones para descargar.");
      return;
    }

    // Mapear los datos brutos de la transacción al formato deseado para el Excel
    const dataForExport = transactions.map((transaction) => {
      const typeTranslated = getTranslateTypes(transaction);
      
      let statusText = "Pendiente";
      if (transaction.status === "success") {
        statusText = "Exitosa";
      } else if (transaction.status === "rejected") {
        statusText = `${typeTranslated} (Rechazada/Anulada)`;
      } else {
        statusText = typeTranslated;
      }
      
      const balanceChange = getBalanceChangeDisplay(transaction).replace('$', ''); // Eliminar el signo de dólar

      return {
        'ID Transacción': transaction._id,
        'Fecha y Hora': moment(transaction.__updatedtime__).format("DD/MM/YYYY HH:mm:ss"),
        'Usuario': transaction.username,
        'Tipo': typeTranslated,
        'Estado': statusText,
        'Monto ($)': parseFloat(balanceChange.replace(/[+-]/g, '')), // Solo el valor numérico
        'Descripción': transaction.description || "N/A",
        'Método de Pago': transaction.payment_method || "N/A"
      };
    });

    // Crear la hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transacciones");

    // Descargar el archivo
    const fileName = `Transacciones_Usuario_${id_user}_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };
  
  // Definición de columnas (Memorizado)
  const columns = useMemo(() => [
    { Header: "Fecha", accessor: "registrationDate", align: "center" },
    { Header: "Tipo", accessor: "type", align: "left" },
    { Header: "Estado", accessor: "status", align: "left" },
    { Header: "Detalle", accessor: "detail", align: "left" },
    { Header: "Monto", accessor: "balance", align: "center" },
  ], []);

  // Mapeo y Formateo de Datos (Memorizado)
  const rows = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }

    // ... (El mapeo de las filas sigue igual)
    return transactions.map((transaction) => {
      const typeTranslated = getTranslateTypes(transaction);
      
      let badgeContent = typeTranslated;
      let badgeColor = "info"; 
      
      if (transaction.status === "rejected") {
          badgeContent = `${typeTranslated} (Anulada)`;
          badgeColor = "error";
      } else if (transaction.status === "success") {
          badgeColor = transaction.type === "order" ? "warning" : "success";
      }

      const balanceDisplay = getBalanceChangeDisplay(transaction);
      const balanceColor = balanceDisplay.startsWith('+') ? "success" : 
                           balanceDisplay.startsWith('-') ? "error" : "text";

      return {
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
              badgeContent={badgeContent}
              color={badgeColor}
              variant="gradient"
            />
          </MDBox>
        ),
        status: (
          <MDTypography fontFamily='poppins' variant="button" color="text" fontWeight="medium">
            {transaction.status === "success" ? "Exitosa" : 
             transaction.status === "rejected" ? "Rechazada" : "Pendiente"}
          </MDTypography>
        ),
        detail: (
          <MDTypography fontFamily='poppins' variant="button" color="text" fontWeight="medium">
            {transaction.description || "N/A"}
          </MDTypography>
        ),
        balance: (
          <MDTypography
            fontFamily='poppins'
            variant="caption"
            fontWeight="bold"
            color={balanceColor}
          >
            {balanceDisplay}
          </MDTypography>
        ),
      };
    });
  }, [transactions]); 

  // --- Manejo de Estados ---
  if (loading) return <div>Cargando transacciones...</div>;
  if (error) return <div>Error al cargar transacciones: {error.message || "Error desconocido"}</div>;
  
  if (!transactions || transactions.length === 0) {
    return (
      <DashboardLayout>
          <DashboardNavbar />
          <MDBox pt={6} pb={3}>
              <Typography variant="h6" color="textSecondary" align="center">
                  No se encontraron transacciones para el usuario {id_user}.
              </Typography>
          </MDBox>
      </DashboardLayout>
    );
  }

  // --- Renderizado Principal ---
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
                <div style={{ 
                    marginBottom: "2rem", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "16px 16px 0 16px" /* Ajuste de padding para alinear el título */
                }}>
                  <MDTypography component="div"
                    className="event-title" color="text">
                    Historial de transacciones
                  </MDTypography>
                  <MDBox display="flex" gap={1}> 
                    {/* 3. Botón de Descarga a Excel */}
                    <MDButton 
                      style={{ fontSize: '16px' }} // Mantener el texto sin transformar
                      variant="outlined" // Usamos outlined para distinguirlo del botón de Volver
                      color="success" // Color verde
                      onClick={handleDownloadExcel}
                      startIcon={<FileDownloadIcon />} 
                      disabled={!transactions || transactions.length === 0} // Deshabilitar si no hay datos
                    >
                      Descargar reporte
                    </MDButton>
                    {/* Botón de Volver */}
                    <MDButton 
                      variant="contained" 
                      onClick={handleGoBack}
                      startIcon={<ArrowBackIcon />} >
                      Volver
                    </MDButton>
                  </MDBox>
                </div>
                <MDBox pt={3}>
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
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default TokenAdminTransactions;
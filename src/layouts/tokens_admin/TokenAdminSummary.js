import React, { useState, useMemo } from "react";
import { styled } from "@mui/system";
import moment from "moment";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { Typography } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import { Link } from "react-router-dom";

//import Footer from "examples/Footer";
import MDTypography from "components/MDTypography";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/styles.css";
import 'moment/locale/es';
import MDInput from "components/MDInput";

// URL
import { API_BASE_URL } from '../../config';

// Componentes Styled (se mantienen para la funcionalidad de búsqueda y refresco)
const SearchInput = styled(MDInput)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    width: "50%",
  },
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
}));

const RefreshButtonContainer = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginRight: theme.spacing(3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    justifyContent: "center",
  },
}));

function TokenAdminSummary() {
  const event_id = localStorage.getItem("eventId");
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 1. CAMBIO CLAVE: Usar el nuevo endpoint para el resumen por usuario/cajero
  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/transaction/summarize_by_users?event_id=${event_id}`
  );

  moment().locale('es');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Función para filtrar por nombre o ID del cajero
  const filterByCashier = (summaryData, searchTerm) => {
    return summaryData.filter((item) => {
      // Buscar en el nombre, si está disponible, o en el user_id
      const name = item.user_name || item.user_id;
      return name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Aseguramos que 'data' sea un array (en el endpoint de ejemplo es un array directo)
  const filteredData = useMemo(() => {
    const summaryList = data || []; // Asume que el endpoint retorna un array directamente
    if (!searchTerm) {
      return summaryList;
    }
    return filterByCashier(summaryList, searchTerm);
  }, [data, searchTerm]);

if (loading || error) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Resumen de Cajeros" />
        <MDBox pt={6} pb={3} display="flex" minHeight="50vh">
          <MDTypography variant="h6">
            {error ? "Error al obtener los datos" : "Cargando resumen de cajeros..."}
          </MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

// 2. CAMBIO CLAVE: Definición de las columnas para el resumen de cajeros
const columns = [
    { Header: "ID ", accessor: "user_id", align: "left" },
    { Header: "Usuario", accessor: "user_name", width: "20%", align: "left" },
    { Header: "Total Efectivo", accessor: "total_cash", align: "center" },
    { Header: "Total Tarjeta", accessor: "total_credit_card", align: "center" },
    { Header: "Total Recargado", accessor: "total_amount_loaded", align: "center" },
    { Header: "Total de Transacciones", accessor: "total_transactions", align: "center" },
  ];

// 3. CAMBIO CLAVE: Mapeo de los datos del endpoint a las filas de la tabla
  const rows = filteredData.map((item) => ({
    user_id: (
      <MDTypography fontFamily="poppins" variant="caption" color="text" fontWeight="medium">
        <Link className='custom-link' to={`/tokens_admin_details/${item.user_id}`}>{item.user_id}</Link>
      </MDTypography>
    ),
    user_name: (
        // El endpoint no proporciona user_name directamente, usamos el ID como fallback
      <MDTypography fontFamily="poppins" variant="button" color="text" fontWeight="medium">
        {item.username || "N/A"} 
      </MDTypography>
    ),
    total_cash: (
      <MDTypography fontFamily="poppins" variant="caption" color="text" fontWeight="medium">
        ${item.total_cash ? item.total_cash.toFixed(2) : '0.00'}
      </MDTypography>
    ),
    total_credit_card: (
      <MDTypography fontFamily="poppins" variant="caption" color="text" fontWeight="medium">
        ${item.total_credit_card ? item.total_credit_card.toFixed(2) : '0.00'}
      </MDTypography>
    ),
    total_amount_loaded: (
      <MDTypography  fontFamily="poppins" variant="caption" color="success" fontWeight="bold">
        ${item.total_recharged ? item.total_recharged.toFixed(2) : '0.00'}
      </MDTypography>
    ),
    total_transactions: (
      <MDTypography fontFamily="poppins" variant="caption" color="text" fontWeight="medium">
        {item.num_transactions}
      </MDTypography>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Resumen de Saldo por Cajero"/>
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} pr={2} pl={2} pb={3} >
                <Typography pr={2} pl={2} className="event-title">
                  Resumen de recargas por administrador
                </Typography>
                <div style={{  margin: "1rem 1rem 2rem 1rem", display: "flex", alignItems: "center", justifyContent:"space-between" }} >
                  <SearchInput
                    fontFamily="poppins"
                    type="search"
                    label="Buscar"
                    placeholder="Buscar por nombre o ID de cajero..."
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
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      {/*<Footer />*/}
    </DashboardLayout>
  );
}

export default TokenAdminSummary;
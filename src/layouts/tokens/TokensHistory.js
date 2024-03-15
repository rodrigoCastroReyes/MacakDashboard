import React, { useState, useMemo } from "react";
import { styled } from "@mui/system";
import { Link } from "react-router-dom";
import moment from "moment";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
//import Footer from "examples/Footer";
import MDTypography from "components/MDTypography";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/styles.css";
import 'moment/locale/es';
import MDInput from "components/MDInput";

const SearchInput = styled(MDInput)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    width: "50%",
  },
  [theme.breakpoints.up("sm")]: {
    width: "auto", // Ajusta el ancho según tus necesidades
  },
}));

const RefreshButtonContainer = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: theme.spacing(2), // Agrega margen inferior para separar del campo de búsqueda
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    justifyContent: "center",
  },
}));

function TokensHistory() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, refetch } = useAxios(
    "https://biodynamics.tech/api_tokens/event/tokens?id=f9b857ac-16f2-4852-8981-b72831e7f67c"
  );
  moment().locale('es');
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filterByCode = (tokens, searchTerm) => {
    return tokens.filter((token) => {
      return token?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTokens = useMemo(() => {
    if (!searchTerm) {
      return data?.tokens || [];
    }
    return filterByCode(data?.tokens || [], searchTerm);
  }, [data?.tokens, searchTerm]);

  if (loading) return <div>Cargando...</div>;
  if (error || !data?._id || !data?.tokens)
    return <div>Error al obtener los datos</div>;

const columns = [
    {
      Header: "Fecha de Registro",
      accessor: "registrationDate",
      align: "center",
    },
    {
      Header: "Código",
      accessor: "code",
      width: "30%",
      align: "left",
    },
    { Header: "Estado", accessor: "status", align: "left" },
    { Header: "Saldo", accessor: "balance", align: "center" },
  ];

  const rows = filteredTokens.map((token) => ({
    code: (
      <MDTypography fontFamily="poppins" variant="button" color="text" fontWeight="medium">
        <Link className='custom-link' to={`/token/${token._id}`}>{token.code}</Link>
      </MDTypography>
    ),
    status: (
      <MDTypography  fontFamily="poppins" variant="button" color="text" fontWeight="medium">
        {token.status === "registered" ? "Registrado" : "No Registrado"}
      </MDTypography>
    ),
    registrationDate: (
      <MDTypography  fontFamily="poppins" variant="caption" color="text" fontWeight="medium">
        {moment(token.__createdtime__).format("DD [de] MMMM YYYY HH:mm:ss A")}
      </MDTypography>
    ),
    balance: (
      <MDTypography  fontFamily="poppins" variant="caption" color="success" fontWeight="bold">
        ${token.balance}
      </MDTypography>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography component="div" align="center" fontFamily="montserrat-semibold" fontSize="22px" variant="h6" color="white">
                  Historial de registro de tokens
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <div style={{ marginBottom: "2rem"}}>
                  <SearchInput
                    fontFamily="poppins"
                    type="search"
                    label="Buscar"
                    style={{marginLeft:"48px"}}
                    placeholder="Buscar por código..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <RefreshButtonContainer>
                  <button
                    className="refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? "Refrescando..." : "Actualizar"}
                  </button>
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

export default TokensHistory;

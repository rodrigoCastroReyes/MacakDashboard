import React, { useState, useMemo } from "react";
import { styled } from "@mui/system";
import { Link } from "react-router-dom";
import moment from "moment";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { Typography } from "@mui/material";
import fileDownload from "js-file-download";
import MDBadge from "components/MDBadge";
import RefreshIcon from "@mui/icons-material/Refresh";

//import Footer from "examples/Footer";
import MDTypography from "components/MDTypography";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/styles.css";
import "moment/locale/es";
import MDInput from "components/MDInput";
import DownloadIcon from "@mui/icons-material/Download";
import axios from "axios";

// URL
import { API_BASE_URL } from "../../config";

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

function TokensHistory() {
  const event_id = localStorage.getItem("eventId");
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/event/tokens?id=${event_id}`
  );
  moment().locale("es");
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const downloadReport = async (code) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/report/generate_report_of_token?token_code=${code}`,
        {
          responseType: "blob",
        }
      );
      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const filename = new Date().toISOString();
      fileDownload(response.data, `token_${code}_${filename}.pdf`);
    } catch (error) {
      console.log(error);
    }
  };

  const filterByCode = (tokens, searchTerm) => {
    return tokens.filter((token) => {
      return token?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const getTranslateStatus = (status) => {
    if (status === "registered") {
      return "Registrado";
    } else {
      return "Anulado";
    }
  };

  const filteredTokens = useMemo(() => {
    if (!searchTerm) {
      return data?.tokens || [];
    }
    return filterByCode(data?.tokens || [], searchTerm);
  }, [data?.tokens, searchTerm]);

  if (loading || error) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Tokens" />
        <MDBox pt={6} pb={3} display="flex" minHeight="50vh">
          <div variant="h6">
            {error ? "Error al obtener los datos" : "Cargando..."}
          </div>
        </MDBox>
      </DashboardLayout>
    );
  }

  const columns = [
    {
      Header: "Fecha de Registro",
      accessor: "registrationDate",
      align: "center",
    },
    { Header: "Código", accessor: "code", width: "30%", align: "center" },
    { Header: "Estado", accessor: "status", align: "center" },
    { Header: "Saldo", accessor: "balance", align: "center" },
    { Header: "Descargas", accessor: "download_report", align: "center" },
  ];

  const rows = [...filteredTokens]
    .sort((a, b) => new Date(b.__createdtime__) - new Date(a.__createdtime__))
    .map((token) => ({
      code: (
        <MDTypography
          fontFamily="poppins"
          variant="button"
          color="text"
          fontWeight="medium"
        >
          <Link className="custom-link" to={`/token/${token._id}`}>
            {token.code}
          </Link>
        </MDTypography>
      ),
      status: (
        <MDBox ml={-1}>
          <MDBadge
            fontFamily="poppins"
            badgeContent={getTranslateStatus(token.status)}
            color={token.status === "registered" ? "success" : "failed"}
            variant="gradient"
            size="medium"
          />
        </MDBox>
      ),
      download_report: (
        <Link
          className="custom-link"
          to={`${API_BASE_URL}/report/generate_report_of_token?token_code=${token.code}`}
          target="_blank"
          download
        >
          <DownloadIcon
            style={{ margin: "0px 10px", cursor: "pointer" }}
            fontSize="small"
          />
        </Link>
      ),
      registrationDate: (
        <MDTypography
          fontFamily="poppins"
          variant="caption"
          color="text"
          fontWeight="medium"
        >
          {moment(token.__createdtime__).format("DD [de] MMMM YYYY HH:mm:ss A")}
        </MDTypography>
      ),
      balance: (
        <MDTypography
          fontFamily="poppins"
          variant="caption"
          color="success"
          fontWeight="bold"
        >
          ${token.balance}
        </MDTypography>
      ),
    }));

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Registro de Tokens" />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} pr={2} pl={2} pb={3}>
                <Typography pr={2} pl={2} className="event-title">
                  Historial de registro de tokens
                </Typography>
                <div
                  style={{
                    margin: "1rem 1rem 2rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
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
                      <RefreshIcon
                        className="custom-btn-icon"
                        onClick={handleRefresh}
                        fontSize="medium"
                      />
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

export default TokensHistory;

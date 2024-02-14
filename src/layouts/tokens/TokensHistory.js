import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDTypography from "components/MDTypography";
//import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import TokensData from "layouts/tokens/data/TokensData";
import "css/styles.css";

{
  /*import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/buttonStyles.css";

function TokensHistory() {
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useAxios(
    "https://biodynamics.tech/api_tokens/event/tokens?id=f9b857ac-16f2-4852-8981-b72831e7f67c"
  );
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (error || !data?._id || !data?.tokens)
    return <div>Error al obtener los datos</div>;

  const tokens = data?.tokens;

  const columns = [
    {
      Header: "Código del Token",
      accessor: "code",
      width: "30%",
      align: "left",
    },
    { Header: "Estado", accessor: "status", align: "left" },
    {
      Header: "Fecha de Registro",
      accessor: "registrationDate",
      align: "center",
    },
    { Header: "Monto", accessor: "balance", align: "center" },
  ];

  const rows = tokens.map((token) => ({
    code: (
        <MDTypography variant="button" color="text" fontWeight="medium">
          <button onClick={() => navigate(`/token-detail/${token.code}`)}>
            {token.code}
          </button>
        </MDTypography>
    ),
    status: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {token.status === "registered" ? "Registrado" : "No Registrado"}
      </MDTypography>
    ),
    registrationDate: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {moment(token.__createdtime__).format("DD MMM YYYY")}
      </MDTypography>
    ),
    balance: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        ${token.balance}
      </MDTypography>
    ),
  }));

  return (
    <>
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
          <MDTypography variant="h6" color="white">
            Historial de registro de tokens
          </MDTypography>
        </MDBox>
        <MDBox pt={3}>
          <div style={{ marginBottom: "2rem" }}>
            <button
              className="refresh-button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
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
        </MDBox>
      </Card>
    </>
  );
}

export default TokensHistory;
*/
}

function TokensHistory() {
  const [refreshing, setRefreshing] = useState(false);
  {/*const { data, loading, error, refetch } = useAxios(
    "https://biodynamics.tech/api_tokens/event/tokens?id=f9b857ac-16f2-4852-8981-b72831e7f67c"
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (error || !data?._id || !data?.tokens)
    return <div>Error al obtener los datos</div>;

const tokens = data?.tokens;*/}

const [tokens, setTokens] = useState([]);


  useEffect(() => {
    // Simulando la obtención de datos
    const fetchData = async () => {
      const tokens = TokensData.tokens;
      if (tokens) {
        setTokens(tokens);
      }
    };

    fetchData();
  }, [tokens]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular la recarga de datos
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const columns = [
    {
      Header: "Código del Token",
      accessor: "code",
      width: "30%",
      align: "left",
    },
    { Header: "Estado", accessor: "status", align: "left" },
    {
      Header: "Fecha de Registro",
      accessor: "registrationDate",
      align: "center",
    },
    { Header: "Monto", accessor: "balance", align: "center" },
  ];

  const rows = tokens.map((token) => ({
    code: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        <Link className='custom-link' to={`/token/${token.code}`}>{token.code}</Link>
      </MDTypography>
    ),
    status: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {token.status === "registered" ? "Registrado" : "No Registrado"}
      </MDTypography>
    ),
    registrationDate: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {moment(token.__createdtime__).format("DD MMM YYYY")}
      </MDTypography>
    ),
    balance: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
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
                <MDTypography variant="h6" color="white">
                  Historial de registro de tokens
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <div style={{ marginBottom: "2rem" }}>
                  <button
                    className="refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
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
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TokensHistory;

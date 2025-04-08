import React, { useState, useMemo } from "react";
import { Grid, Card, TextField, Box, IconButton } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import StorefrontIcon from '@mui/icons-material/Storefront';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from "react-router-dom";

// JSON local
import storesData from "./stores.json";

const Shops = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredStores = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return storesData.stores.filter((store) =>
      store.name.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm]);

  const resetSearch = () => setSearchTerm("");

  const handleCardClick = (id) => {
    navigate(`/shop-products/${id}`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Tiendas Registradas" />
      <MDBox pt={3} pr={2} pl={2} pb={3}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <TextField
              label="Buscar tienda"
              placeholder="Buscar por nombre"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
            />
            <IconButton onClick={resetSearch} sx={{ ml: 2 }} title="Reiniciar búsqueda">
              <RefreshIcon fontSize="medium" />
            </IconButton>
          </Box>

          <MDTypography variant="caption" sx={{ fontSize: '1rem' }}>
            {filteredStores.length === 1 ? "1 tienda encontrada" : `${filteredStores.length} tiendas encontradas`}
          </MDTypography>
        </Box>

        <Grid container rowSpacing={3} columnSpacing={3}>
          {filteredStores.map((store) => (
            <Grid item xs={12} sm={6} md={4} key={store._id}>
              <Grid container>
                {/* Columna izquierda: ícono */}
                <Grid item xs={3}>
                  <Card
                    sx={{
                      backgroundColor: "grey.700", 
                      borderTopLeftRadius: 50,
                      borderBottomLeftRadius: 50,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      p: 4,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <StorefrontIcon fontSize="large" color="white" />
                    </Box>
                  </Card>
                </Grid>

                {/* Columna derecha: info */}
                <Grid item xs={9}>
                  <Card
                    onClick={() => handleCardClick(store._id)}
                    sx={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderTopRightRadius: 50,
                      borderBottomRightRadius: 50,
                      p: 4,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      cursor: "pointer",
                      gap: 2,
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <MDTypography variant="h6">{store.name}</MDTypography>
                    <MDTypography variant="caption" color="text">
                      ID: {store._id}
                    </MDTypography>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>

        {filteredStores.length === 0 && (
          <MDTypography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            No se encontraron tiendas con ese nombre.
          </MDTypography>
        )}
      </MDBox>
    </DashboardLayout>
  );
};

export default Shops;

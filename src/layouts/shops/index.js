import React, { useState, useMemo } from "react";
import { Grid, Card, TextField, Box, IconButton } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import StorefrontIcon from '@mui/icons-material/Storefront';
import RefreshIcon from '@mui/icons-material/Refresh';

// JSON local
import storesData from "./stores.json";

const Shops = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStores = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return storesData.stores.filter((store) =>
      store.name.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm]);

  const resetSearch = () => setSearchTerm("");

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

        <Grid container spacing={3}>
          {filteredStores.map((store) => (
            <Grid item xs={12} sm={6} md={12} key={store._id}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  "&:hover": { boxShadow: 6 }
                }}
              >
                <StorefrontIcon fontSize="large" color="primary" />
                <MDBox>
                  <MDTypography variant="h6">{store.name}</MDTypography>
                  <MDTypography variant="caption" color="text">
                    ID: {store._id}
                  </MDTypography>
                </MDBox>
              </Card>
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

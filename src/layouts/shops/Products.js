import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Card, Typography, IconButton } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import RefreshIcon from "@mui/icons-material/Refresh";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";

// Importar imágenes locales
import productAImg from "./productA.jpg";
import productBImg from "./productB.jpg";
import productCImg from "./productC.jpg";

// Cargar JSON de productos
import productsData from "./products.json";

const Products = () => {
  const { id: storeId } = useParams();

  // Simulamos recarga con estado local (más adelante se reemplaza por fetch)
  const [productList, setProductList] = useState(productsData.products);

  const handleRefresh = () => {
    // Por ahora simplemente se vuelve a cargar el JSON estático
    setProductList([...productsData.products]);
    console.log("Productos recargados");
  };

  const storeInfo = {
    name: `Tienda ${storeId.toUpperCase()}`,
    id: storeId,
  };

  const imageMap = {
    abc: productAImg,
    def: productBImg,
    ghi: productCImg,
  };

  const productTable = {
    columns: [
      { Header: "Imagen", accessor: "img", align: "center" },
      { Header: "Descripción", accessor: "description", align: "center" },
      { Header: "Precio", accessor: "price", align: "center" },
    ],
    rows: productList.map((product) => ({
      description: (
        <MDTypography fontSize="12px" variant="caption" color="text" align="center">
          {product.description}
        </MDTypography>
      ),
      price: (
        <MDTypography fontSize="12px" variant="caption" color="success" align="center">
          ${product.price.toFixed(2)}
        </MDTypography>
      ),
      img: (
        <Box
          component="img"
          src={imageMap[product._id]}
          alt={product.description}
          sx={{ height: 60, objectFit: "contain", mx: "auto", borderRadius: 1 }}
        />
      ),
    })),
  };

  return (
    <DashboardLayout>
      <DashboardNavbar main_title={`Panel de tienda: ${storeId}`} />
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2}>
          {/* Ícono de tienda */}
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                p: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <StorefrontIcon fontSize="large" color="secondary" />
            </Card>
          </Grid>

          {/* Información de la tienda */}
          <Grid item xs={12} md={9}>
            <Card
              sx={{
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {storeInfo.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ID de tienda: {storeInfo.id}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Productos registrados: {productList.length}
              </Typography>
            </Card>
          </Grid>

          {/* Tabla de productos */}
          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5">Productos registrados</Typography>
                <IconButton title="Refrescar" onClick={handleRefresh}>
                  <RefreshIcon fontSize="medium" />
                </IconButton>
              </Box>
              <DataTable
                table={productTable}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Products;

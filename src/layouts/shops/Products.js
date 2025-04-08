import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Card, Typography, IconButton } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import RefreshIcon from "@mui/icons-material/Refresh";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";

// Imágenes locales
import productAImg from "./productA.jpg";
import productBImg from "./productB.jpg";
import productCImg from "./productC.jpg";

// JSON con campo de descuento
import productsData from "./products.json";

const Products = () => {
  const { id: storeId } = useParams();

  const [productList, setProductList] = useState(productsData.products);

  const handleRefresh = () => {
    setProductList([...productsData.products]);
    console.log("Productos recargados");
  };

  const handleDiscountChange = (index, newDiscount) => {
    const updatedProducts = [...productList];
    updatedProducts[index].discount = parseFloat(newDiscount) || 0;
    setProductList(updatedProducts);
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
      { Header: "Descuento (%)", accessor: "discount", align: "center" },
    ],
    rows: productList.map((product, index) => {
      const hasDiscount = product.discount > 0;
      const discountedPrice = product.price - (product.price * product.discount) / 100;

      return {
        description: (
          <MDTypography fontSize="12px" variant="caption" color="text" align="center">
            {product.description}
          </MDTypography>
        ),
        discount: (
          <Box textAlign="center">
            <input
              type="number"
              min="0"
              max="100"
              value={product.discount}
              onChange={(e) => handleDiscountChange(index, e.target.value)}
              style={{
                width: "80px",
                height: "36px",
                textAlign: "center",
                fontSize: "18px",
                padding: "4px 6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
          </Box>
        ),
        price: hasDiscount ? (
          <Box textAlign="center">
            <MDTypography
              fontSize="12px"
              variant="caption"
              color="text"
              sx={{ textDecoration: "line-through", mr: 1 }}
            >
              ${product.price.toFixed(2)}
            </MDTypography>
            <MDTypography
              fontSize="12px"
              variant="caption"
              color="warning"
              fontWeight="bold"
            >
              ${discountedPrice.toFixed(2)}
            </MDTypography>
          </Box>
        ) : (
          <MDTypography
            fontSize="12px"
            variant="caption"
            color="success"
            fontWeight="bold"
            align="center"
          >
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
      };
    }),
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

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Card, Typography, IconButton, CircularProgress, TextField } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";

import StorefrontIcon from "@mui/icons-material/Storefront";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { API_BASE_URL } from "config";
import moment from "moment";

const Products = () => {
  const { id: storeId } = useParams();
  const eventId = localStorage.getItem("eventId");

  const [productList, setProductList] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [originalDiscount, setOriginalDiscount] = useState(0);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store/products?id=${storeId}`);
      const data = await res.json();
      const withDiscount = data.map((p) => ({ ...p, discount: 0 }));
      setProductList(withDiscount);
    } catch (err) {
      console.error("Error al obtener productos:", err);
    }
  };

  const fetchStoreDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store/by_event?id=${eventId}`);
      const data = await res.json();
      const tienda = data.find((store) => store._id === storeId);
      if (tienda) setStoreInfo(tienda);
    } catch (err) {
      console.error("Error al obtener tienda:", err);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchStoreDetails()]);
    setLoading(false);
    setEditingIndex(null);
  };

  useEffect(() => {
    handleRefresh();
  }, [storeId]);

  const handleDiscountChange = (index, newDiscount) => {
    const updated = [...productList];
    updated[index].discount = parseFloat(newDiscount) || 0;
    setProductList(updated);
  };

  const cancelEdit = () => {
    const updated = [...productList];
    if (editingIndex !== null) {
      updated[editingIndex].discount = originalDiscount;
    }
    setProductList(updated);
    setEditingIndex(null);
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
          <MDTypography fontSize="14px" variant="caption" color="text" align="center">
            {product.description}
          </MDTypography>
        ),
        discount: (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
            {editingIndex === index ? (
              <>
                <TextField
                  type="number"
                  value={product.discount}
                  onChange={(e) => handleDiscountChange(index, e.target.value)}
                  size="14px"
                  sx={{ width: 70 }}
                  inputProps={{ min: 0, max: 100 }}
                />
                <IconButton
                  size="small"
                  onClick={() => setEditingIndex(null)}
                  title="Aplicar descuento"
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={cancelEdit}
                  title="Cancelar"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <Typography variant="caption" fontSize="14px">{product.discount}%</Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setOriginalDiscount(product.discount);
                    setEditingIndex(index);
                  }}
                  title="Editar descuento"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        ),
        price: hasDiscount ? (
          <Box textAlign="center">
            <MDTypography
              fontSize="14px"
              variant="caption"
              color="text"
              sx={{ textDecoration: "line-through", mr: 1 }}
            >
              ${product.price.toFixed(2)}
            </MDTypography>
            <MDTypography
              fontSize="14px"
              variant="caption"
              color="warning"
              fontWeight="bold"
            >
              ${discountedPrice.toFixed(2)}
            </MDTypography>
          </Box>
        ) : (
          <MDTypography
            fontSize="14px"
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
            src={product.img}
            alt={product.description}
            sx={{ height: 60, objectFit: "contain", mx: "auto", borderRadius: 1 }}
          />
        ),
      };
    }),
  };

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Panel de Tienda" />
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <StorefrontIcon fontSize="large" sx={{ color: "secondary" }} />
            </Card>
          </Grid>

          <Grid item xs={12} md={9}>
            <Card sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {storeInfo ? (
                <>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {storeInfo.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Fecha de registro: {moment(storeInfo.__createdtime__).format("DD/MM/YYYY")}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Cargando información de tienda...
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary">
                Productos disponibles: {productList.length}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5">Lista de Productos</Typography>
                <IconButton title="Refrescar" onClick={handleRefresh}>
                  <RefreshIcon fontSize="medium" />
                </IconButton>
              </Box>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={24} color="secondary" />
                </Box>
              ) : (
                <DataTable
                  table={productTable}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Products;

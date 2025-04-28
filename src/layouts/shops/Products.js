import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  Typography,
  IconButton,
  CircularProgress,
  Dialog,
} from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";

import StorefrontIcon from "@mui/icons-material/Storefront";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import AddProductForm from "./Components/AddProduct";
import ProductActions from "./Components/ProductActions";
import EditProductDialog from "./Components/EditProductDialog";
import ConfirmDeleteDialog from "./Components/ConfirmDeleteDialog";

import { API_BASE_URL } from "config";
import moment from "moment";

const Products = () => {
  const { id: storeId } = useParams();
  const eventId = localStorage.getItem("eventId");

  const [productList, setProductList] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleOpenEditDialog = (product) => {
    setSelectedProduct({ ...product });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProduct = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/product?id=${selectedProduct._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: selectedProduct.description,
            price: parseFloat(selectedProduct.price),
            img: selectedProduct.img,
          }),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar producto");

      const updatedList = productList.map((p) =>
        p._id === selectedProduct._id
          ? { ...selectedProduct, price: parseFloat(selectedProduct.price) }
          : p
      );
      setProductList(updatedList);
      handleCloseEditDialog();
    } catch (err) {
      console.error("Error actualizando producto:", err);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/product?id=${productToDelete._id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Error al eliminar producto");

      setProductList((prev) =>
        prev.filter((p) => p._id !== productToDelete._id)
      );
      setOpenConfirmDialog(false);
      setProductToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store/products?id=${storeId}`);
      const data = await res.json();
      setProductList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStoreDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store/by_event?id=${eventId}`);
      const data = await res.json();
      const tienda = data.find((store) => store._id === storeId);
      if (tienda) setStoreInfo(tienda);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchStoreDetails()]);
    setLoading(false);
  };

  useEffect(() => {
    handleRefresh();
  }, [storeId]);

  const productTable = {
    columns: [
      { Header: "Imagen", accessor: "img", align: "center" },
      { Header: "Descripción", accessor: "description", align: "center" },
      { Header: "Precio", accessor: "price", align: "center" },
      ...(showActions
        ? [{ Header: "Acciones", accessor: "actions", align: "center" }]
        : []),
    ],
    rows: productList.map((product) => ({
      img: (
        <Box
          component="img"
          src={product.img}
          alt={product.description}
          sx={{
            height: 60,
            objectFit: "contain",
            mx: "auto",
            borderRadius: 1,
          }}
        />
      ),
      description: (
        <MDTypography
          fontSize="14px"
          variant="caption"
          color="text"
          align="center"
        >
          {product.description}
        </MDTypography>
      ),
      price: (
        <MDTypography
          fontSize="14px"
          variant="caption"
          color="success"
          fontWeight="bold"
        >
          ${parseFloat(product.price).toFixed(2)}
        </MDTypography>
      ),
      ...(showActions
        ? {
            actions: (
              <ProductActions
                product={product}
                onEdit={handleOpenEditDialog}
                onDelete={(p) => {
                  setProductToDelete(p);
                  setOpenConfirmDialog(true);
                }}
              />
            ),
          }
        : {}),
    })),
  };

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Panel de Tienda" />
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2}>
          <Grid container spacing={2}>
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
                <StorefrontIcon fontSize="large" sx={{ color: "secondary" }} />
              </Card>
            </Grid>

            <Grid item xs={12} md={9}>
              <Card
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  {storeInfo ? (
                    <>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {storeInfo.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Fecha de registro:{" "}
                        {moment(storeInfo.__createdtime__).format("DD/MM/YYYY")}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 1 }}
                      >
                        Productos disponibles: {productList.length}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Cargando información de tienda...
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <IconButton title="Editar Tienda" sx={{ opacity: 0.2 }}>
                    <EditIcon fontSize="medium" />
                  </IconButton>
                  <IconButton
                    title="Eliminar Tienda"
                    sx={{ color: "red", opacity: 0.2 }}
                  >
                    <DeleteIcon fontSize="medium" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h5">Lista de Productos</Typography>
                <Box>
                  <IconButton
                    title="Agregar producto"
                    onClick={handleOpenAddDialog}
                  >
                    <AddIcon fontSize="medium" />
                  </IconButton>
                  <IconButton
                    title={
                      showActions ? "Ocultar acciones" : "Mostrar acciones"
                    }
                    onClick={() => setShowActions((prev) => !prev)}
                  >
                    {showActions ? (
                      <VisibilityOffIcon fontSize="medium" />
                    ) : (
                      <VisibilityIcon fontSize="medium" />
                    )}
                  </IconButton>
                  <IconButton title="Refrescar" onClick={handleRefresh}>
                    <RefreshIcon fontSize="medium" />
                  </IconButton>
                </Box>
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

      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <AddProductForm
          storeId={storeId}
          handleClose={handleCloseAddDialog}
          onRefresh={fetchProducts}
          existingProducts={productList}
        />
      </Dialog>

      <EditProductDialog
        open={editDialogOpen}
        product={selectedProduct}
        onClose={handleCloseEditDialog}
        onChange={handleEditFieldChange}
        onSave={handleUpdateProduct}
      />

      <ConfirmDeleteDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleDeleteProduct}
        productName={productToDelete?.description}
      />
    </DashboardLayout>
  );
};

export default Products;

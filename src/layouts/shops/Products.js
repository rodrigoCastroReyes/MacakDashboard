import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";

import StorefrontIcon from "@mui/icons-material/Storefront";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DiscountIcon from "@mui/icons-material/Discount";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import AddProductForm from "layouts/shops/AddProduct";
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
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [showActions, setShowActions] = useState(false);
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

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
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
    } catch (err) {
      console.error("Error al eliminar producto:", err);
    } finally {
      setOpenConfirmDialog(false);
      setProductToDelete(null);
    }
  };

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
      { Header: "Descuento", accessor: "discount", align: "center" },
      ...(showActions
        ? [{ Header: "Acciones", accessor: "actions", align: "center" }]
        : []),
    ],
    rows: productList.map((product, index) => {
      const parsedPrice = parseFloat(product.price);
      const hasDiscount = product.discount > 0;
      const discountedPrice =
        parsedPrice - (parsedPrice * product.discount) / 100;

      return {
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
        price: hasDiscount ? (
          <Box textAlign="center">
            <MDTypography
              fontSize="14px"
              variant="caption"
              color="text"
              sx={{ textDecoration: "line-through", mr: 1 }}
            >
              ${parsedPrice.toFixed(2)}
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
            ${parsedPrice.toFixed(2)}
          </MDTypography>
        ),
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
        discount: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
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
                  onClick={async () => {
                    const updated = [...productList];
                    const currentProduct = updated[index];
                    const newPrice =
                      parsedPrice -
                      (parsedPrice * currentProduct.discount) / 100;

                    try {
                      const res = await fetch(
                        `${API_BASE_URL}/product?id=${currentProduct._id}`,
                        {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            price: parseFloat(newPrice.toFixed(2)),
                          }),
                        }
                      );

                      if (!res.ok)
                        throw new Error("Error al actualizar el precio");

                      currentProduct.price = parseFloat(newPrice.toFixed(2));
                      setProductList(updated);
                    } catch (err) {
                      console.error(err);
                    }

                    setEditingIndex(null);
                  }}
                  title="Aplicar descuento"
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={cancelEdit} title="Cancelar">
                  <CloseIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    const updated = [...productList];
                    updated[index].discount = 0;
                    setProductList(updated);
                    setEditingIndex(null);
                  }}
                  title="Eliminar descuento"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <Typography variant="caption" fontSize="14px">
                  {product.discount}%
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setOriginalDiscount(product.discount);
                    setEditingIndex(index);
                  }}
                  title="Editar descuento"
                >
                  <DiscountIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        ),
        ...(showActions
          ? {
              actions: (
                <Box display="flex" justifyContent="center" gap={1}>
                  <IconButton
                    title="Editar Producto"
                    onClick={() => handleOpenEditDialog(product)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    title="Eliminar Producto"
                    onClick={() => {
                      setProductToDelete(product);
                      setOpenConfirmDialog(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ),
            }
          : {}),
      };
    }),
  };

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Panel de Tienda" />
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2}>
          <Grid container spacing={2} alignItems="stretch">
            {/* Ícono de la tienda */}
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

            {/* Información + botones */}
            <Grid item xs={12} md={9}>
              <Card
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: { xs: "column", md: "row" }, // Responsive: columna en móvil, fila en desktop
                  gap: 2,
                }}
              >
                {/* Información de la tienda */}
                <Box sx={{ flexGrow: 1 }}>
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

                {/* Botones de acción */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <IconButton title="Editar Tienda" color="secondary"  sx={{ opacity: 0.2 }}>
                    <EditIcon fontSize="medium" />
                  </IconButton>
                  <IconButton title="Eliminar Tienda" sx={{ color : "red", opacity: 0.2 }}>
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

      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Producto</DialogTitle>
        {selectedProduct && (
          <>
            <DialogContent>
              <TextField
                label="Descripción"
                name="description"
                value={selectedProduct.description}
                onChange={handleEditFieldChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Precio"
                name="price"
                type="number"
                value={selectedProduct.price}
                onChange={handleEditFieldChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Imagen (URL)"
                name="img"
                value={selectedProduct.img}
                onChange={handleEditFieldChange}
                fullWidth
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditDialog}>Cancelar</Button>
              <Button onClick={handleUpdateProduct} color="primary">
                Guardar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>
          ¿Seguro que deseas eliminar{" "}
          {productToDelete?.description || "este producto"}?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteProduct} color="secondary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default Products;

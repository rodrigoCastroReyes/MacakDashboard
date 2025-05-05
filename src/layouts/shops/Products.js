import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  Card,
  Typography,
  IconButton,
  CircularProgress,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import DiscountIcon from "@mui/icons-material/Discount";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

import AddProductForm from "./Components/AddProduct";
import ProductActions from "./Components/ProductActions";
import EditProductDialog from "./Components/EditProductDialog";
import ConfirmDeleteDialog from "./Components/ConfirmDeleteDialog";

import { API_BASE_URL } from "config";
import moment from "moment";

const Products = () => {
  const { id: storeId } = useParams();
  const navigate = useNavigate();
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
  const [editStoreOpen, setEditStoreOpen] = useState(false);
  const [editedStore, setEditedStore] = useState(null);
  const [confirmStoreDelete, setConfirmStoreDelete] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null);
  const [originalDiscount, setOriginalDiscount] = useState(0);

  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [deleteEnabled, setDeleteEnabled] = useState(false);

  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const cancelEdit = () => {
    const updated = [...productList];
    if (editingIndex !== null) {
      updated[editingIndex].discount = originalDiscount;
      setProductList(updated);
    }
    setEditingIndex(null);
  };

  const handleDiscountChange = (index, value) => {
    let val = parseInt(value);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    const updated = [...productList];
    updated[index].discount = val;
    setProductList(updated);
  };

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

  const handleDeleteStore = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store?id=${storeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar tienda");
      navigate("/tiendas");
    } catch (err) {
      console.error("Error al eliminar tienda:", err);
    }
  };

  useEffect(() => {
    if (confirmStoreDelete) {
      setDeleteCountdown(5);
      setDeleteEnabled(false);
      const interval = setInterval(() => {
        setDeleteCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setDeleteEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [confirmStoreDelete]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store/products?id=${storeId}`);
      const data = await res.json();
      const enriched = data.map((p) => ({
        ...p,
        originalPrice: p.price,
        discount: 0,
      }));
      setProductList(enriched);
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

  const [vendors, setVendors] = useState([]);
  const [openAddVendorDialog, setOpenAddVendorDialog] = useState(false);
  const [newVendor, setNewVendor] = useState({
    username: "",
    email: "",
    password: "",
    role: "event_vendor",
  });

  const handleOpenAddVendorDialog = () => setOpenAddVendorDialog(true);
  const handleCloseAddVendorDialog = () => {
    setOpenAddVendorDialog(false);
    setNewVendor({
      username: "",
      email: "",
      password: "",
      role: "event_vendor",
    });
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/event_vendor/store?id=${storeId}`
      );
      const data = await res.json();
      setVendors(data);
    } catch (err) {
      console.error("Error al obtener vendedores:", err);
    }
  };

  useEffect(() => {
    handleRefresh();
    fetchVendors();
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
    rows: productList.map((product, index) => ({
      img: (
        <Box
          component="img"
          src={product.img}
          alt={product.description}
          sx={{ height: 60, objectFit: "contain", mx: "auto", borderRadius: 1 }}
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
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          {editingIndex === index ? (
            <>
              <TextField
                type="number"
                value={product.discount || 0}
                onChange={(e) => handleDiscountChange(index, e.target.value)}
                size="small"
                sx={{ width: 70 }}
                inputProps={{ min: 0, max: 100 }}
              />
              <IconButton
                size="small"
                onClick={() => {
                  const updated = [...productList];
                  const current = updated[index];
                  const discount = current.discount || 0;
                  const newPrice =
                    current.originalPrice -
                    (current.originalPrice * discount) / 100;

                  current.price = parseFloat(newPrice.toFixed(2));
                  setProductList(updated);
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
                  const current = updated[index];
                  current.discount = 0;
                  current.price = current.originalPrice;
                  setProductList(updated);
                  setEditingIndex(null);
                }}
                title="Eliminar descuento"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              {product.discount > 0 &&
              product.originalPrice !== product.price ? (
                <>
                  <Typography
                    variant="caption"
                    color="error"
                    fontSize="14px"
                    sx={{ textDecoration: "line-through" }}
                  >
                    ${parseFloat(product.originalPrice).toFixed(2)}
                  </Typography>
                  <Typography
                    fontSize="14px"
                    variant="caption"
                    fontWeight="bold"
                    color="success"
                  >
                    ${parseFloat(product.price).toFixed(2)}
                  </Typography>
                </>
              ) : (
                <Typography
                  fontSize="14px"
                  variant="caption"
                  fontWeight="bold"
                  color="success"
                >
                  ${parseFloat(product.price).toFixed(2)}
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={() => {
                  setOriginalDiscount(product.discount || 0);
                  setEditingIndex(index);
                }}
                title="Editar descuento"
              >
                <DiscountIcon fontSize="small" color="action" />
              </IconButton>
            </Box>
          )}
        </Box>
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
          <Grid item xs={12}>
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
                  <StorefrontIcon
                    fontSize="large"
                    sx={{ color: "secondary" }}
                  />
                </Card>
              </Grid>
              <Grid item xs={12} md={9}>
                <Card
                  sx={{
                    p: 3,
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
                          {moment(storeInfo.__createdtime__).format(
                            "DD/MM/YYYY"
                          )}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mt: 1 }}
                        >
                          Productos disponibles: {productList.length}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mt: 1 }}
                        >
                          Vendedores Asignados: {productList.length}
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
                    <IconButton
                      title="Editar Tienda"
                      onClick={() => {
                        setEditedStore({ ...storeInfo });
                        setEditStoreOpen(true);
                      }}
                      sx={{ opacity: 0.4 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      title="Eliminar Tienda"
                      onClick={() => setConfirmStoreDelete(true)}
                      sx={{ color: "red", opacity: 0.4 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Dialog
            open={confirmStoreDelete}
            onClose={() => setConfirmStoreDelete(false)}
          >
            <DialogTitle>¿Eliminar tienda?</DialogTitle>
            <DialogContent>
              <Typography>
                Esta acción no se puede deshacer. ¿Estás seguro?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmStoreDelete(false)}>
                Cancelar
              </Button>
              <Button
                color="error"
                onClick={handleDeleteStore}
                disabled={!deleteEnabled}
              >
                {deleteEnabled ? "Eliminar" : `Eliminar (${deleteCountdown})`}
              </Button>
            </DialogActions>
          </Dialog>
          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h5">Vendedores Asignados</Typography>
                <Box>
                  <IconButton
                    title="Agregar Vendedor"
                    onClick={handleOpenAddVendorDialog}
                  >
                    <PersonAddAlt1Icon fontSize="medium" />
                  </IconButton>
                  <IconButton title="Refrescar" onClick={fetchVendors}>
                    <RefreshIcon fontSize="medium" />
                  </IconButton>
                </Box>
              </Box>
              {vendors.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No hay vendedores asignados.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {vendors.map((vendor) => (
                    <Grid item xs={12} md={4} key={vendor._id}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          boxShadow: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {/* Ícono + información (fila) */}
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            width="30%"
                          >
                            <AccountBoxIcon fontSize="large" color="action" />
                          </Box>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {vendor.username}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {vendor.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          mt={1}
                          pl="30%"
                        >
                          Registrado:{" "}
                          {moment(vendor.__createdtime__).format("DD/MM/YYYY")}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Card>
          </Grid>

          <Dialog
            open={openAddVendorDialog}
            onClose={handleCloseAddVendorDialog}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Agregar Vendedor</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Email"
                value={newVendor.email}
                onChange={(e) =>
                  setNewVendor((prev) => ({ ...prev, email: e.target.value }))
                }
                margin="dense"
              />
              <TextField
                fullWidth
                label="Username"
                value={newVendor.username}
                onChange={(e) =>
                  setNewVendor((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                margin="dense"
              />
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={newVendor.password}
                onChange={(e) =>
                  setNewVendor((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                margin="dense"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddVendorDialog}>Cancelar</Button>
              <Button
                onClick={() => {
                  // Lógica para enviar al backend aún no implementada
                  console.log("Guardar vendedor:", newVendor);
                  handleCloseAddVendorDialog();
                }}
                color="primary"
              >
                Guardar
              </Button>
            </DialogActions>
          </Dialog>
          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
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

      <Dialog
        open={editStoreOpen}
        onClose={() => setEditStoreOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Editar Tienda
          </Typography>
          <TextField
            fullWidth
            label="Nombre de tienda"
            name="name"
            value={editedStore?.name || ""}
            onChange={(e) =>
              setEditedStore((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={{ mb: 1 }}
          />
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              onClick={() => setEditStoreOpen(false)}
              sx={{ mr: 2 }}
              color="secondary"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                try {
                  const res = await fetch(
                    `${API_BASE_URL}/store?id=${storeId}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: editedStore.name }),
                    }
                  );
                  if (!res.ok) throw new Error("Error al actualizar tienda");
                  setStoreInfo((prev) => ({ ...prev, name: editedStore.name }));
                  setEditStoreOpen(false);
                } catch (err) {
                  console.error("Error al actualizar tienda:", err);
                }
              }}
              color="primary"
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Dialog>
    </DashboardLayout>
  );
};

export default Products;

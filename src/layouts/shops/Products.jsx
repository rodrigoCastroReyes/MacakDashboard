import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import StateMessage from "examples/StateMessage";
import AddProductForm from "./components/AddProduct";
import EditProductDialog from "./components/EditProductDialog";
import ConfirmDeleteDialog from "./components/ConfirmDeleteDialog";
import StoreHeaderCard from "./components/StoreHeaderCard";
import InventoryNotice from "./components/InventoryNotice";
import VendorList from "./components/VendorList";
import ProductTable from "./components/ProductTable";
import { summarizeStock } from "./components/stock";
import { API_BASE_URL } from "config";

const Products = () => {
  const { id: storeId } = useParams();
  const navigate = useNavigate();
  const eventId = localStorage.getItem("eventId");

  const [productList, setProductList] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [existingEmails, setExistingEmails] = useState([]);
  const [existingUsernames, setExistingUsernames] = useState([]);
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [vendors, setVendors] = useState([]);
  const [openAddVendorDialog, setOpenAddVendorDialog] = useState(false);
  const [newVendor, setNewVendor] = useState({
    username: "",
    email: "",
    password: "",
    role: "event_vendor",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");

  // ── Inventario ────────────────────────────────────────────────
  const [inventory, setInventory] = useState({}); // { product_id: quantity }
  const [hideUntracked, setHideUntracked] = useState(false);
  const [editingStockIndex, setEditingStockIndex] = useState(null);
  const [stockValue, setStockValue] = useState("");
  const [savingStock, setSavingStock] = useState(false);

  const handleOpenAddDialog = useCallback(() => setOpenAddDialog(true), []);
  const handleCloseAddDialog = useCallback(() => setOpenAddDialog(false), []);

  const cancelEdit = useCallback(() => {
    const updated = [...productList];
    if (editingIndex !== null) {
      updated[editingIndex].discount = originalDiscount;
      setProductList(updated);
    }
    setEditingIndex(null);
  }, [editingIndex, originalDiscount, productList]);

  const handleDiscountChange = useCallback(
    (index, value) => {
      let val = parseInt(value);
      if (isNaN(val)) val = 0;
      if (val < 0) val = 0;
      if (val > 100) val = 100;
      const updated = [...productList];
      updated[index].discount = val;
      setProductList(updated);
    },
    [productList]
  );

  const handleOpenEditDialog = useCallback((product) => {
    setSelectedProduct({ ...product });
    setEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleEditFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleUpdateProduct = useCallback(async () => {
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
            category: selectedProduct.category,
            flags: selectedProduct.flags || [],
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
  }, [selectedProduct, productList, handleCloseEditDialog]);

  const handleDeleteProduct = useCallback(async () => {
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
  }, [productToDelete]);

  const handleDeleteStore = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store?id=${storeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar tienda");
      navigate("/tiendas");
    } catch (err) {
      console.error("Error al eliminar tienda:", err);
    }
  }, [storeId, navigate]);

  const fetchProducts = useCallback(async () => {
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
  }, [storeId]);

  // Fetch del inventario — maneja 404 como inventario vacío
  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/store_inventory?store_id=${storeId}`
      );
      if (res.status === 404) {
        // La tienda aún no tiene inventario creado
        setInventory({});
        return;
      }
      if (!res.ok) throw new Error("Error al obtener inventario");
      const data = await res.json();
      const map = {};
      (data.items || []).forEach((item) => {
        map[item.product_id] = item.quantity;
      });
      setInventory(map);
    } catch (err) {
      console.error("Error al obtener inventario:", err);
      setInventory({});
    }
  }, [storeId]);

  const fetchStoreDetails = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store/by_event?id=${eventId}`);
      const data = await res.json();
      const shop = data.find((store) => store._id === storeId);
      if (shop) setStoreInfo(shop);
    } catch (err) {
      console.error(err);
    }
  }, [eventId, storeId]);

  const fetchVendors = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/event_vendor/store?id=${storeId}`
      );
      const data = await res.json();
      setVendors(data);
      setExistingEmails(data.map((v) => v.email));
      setExistingUsernames(data.map((v) => v.username));
    } catch (err) {
      console.error("Error al obtener vendedores:", err);
    }
  }, [storeId]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchProducts(),
      fetchStoreDetails(),
      fetchVendors(),
      fetchInventory(),
    ]);
    setLoading(false);
  }, [fetchProducts, fetchStoreDetails, fetchVendors, fetchInventory]);

  // Guardar stock de un producto (crea inventario si no existe)
  const handleSaveStock = useCallback(
    async (product) => {
      let qty = parseInt(stockValue);
      if (isNaN(qty) || qty < 0) qty = 0;

      setSavingStock(true);
      try {
        // Intentar actualizar (PUT). Si no existe inventario → crear (POST) y reintentar.
        let res = await fetch(
          `${API_BASE_URL}/store_inventory?store_id=${storeId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: [{ product_id: product._id, quantity: qty }],
            }),
          }
        );

        if (res.status === 404) {
          // El inventario no existe aún → crearlo con este producto
          res = await fetch(`${API_BASE_URL}/store_inventory`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              store_id: storeId,
              items: [{ product_id: product._id, quantity: qty }],
            }),
          });
        }

        if (!res.ok) throw new Error("Error al guardar stock");

        // Actualizar estado local
        setInventory((prev) => ({ ...prev, [product._id]: qty }));
        setEditingStockIndex(null);
        setStockValue("");
      } catch (err) {
        console.error("Error al guardar stock:", err);
        alert("Ocurrió un error al guardar el stock.");
      } finally {
        setSavingStock(false);
      }
    },
    [stockValue, storeId]
  );

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

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleOpenAddVendorDialog = useCallback(
    () => setOpenAddVendorDialog(true),
    []
  );

  const handleCloseAddVendorDialog = useCallback(() => {
    setOpenAddVendorDialog(false);
    setNewVendor({
      username: "",
      email: "",
      password: "",
      role: "event_vendor",
    });
  }, []);

  const applyDiscount = useCallback(
    (index) => {
      const updated = [...productList];
      const current = updated[index];
      const discount = current.discount || 0;
      current.price = parseFloat(
        (current.originalPrice - (current.originalPrice * discount) / 100).toFixed(2)
      );
      setProductList(updated);
      setEditingIndex(null);
    },
    [productList]
  );

  const stockSummary = useMemo(
    () => summarizeStock(productList, inventory),
    [productList, inventory]
  );

  const discountEdit = {
    index: editingIndex,
    onStart: (index, discount) => {
      setOriginalDiscount(discount);
      setEditingIndex(index);
    },
    onChange: handleDiscountChange,
    onApply: applyDiscount,
    onCancel: cancelEdit,
  };

  const stockEdit = {
    index: editingStockIndex,
    value: stockValue,
    saving: savingStock,
    onStart: (index, quantity) => {
      setStockValue(quantity !== undefined ? String(quantity) : "0");
      setEditingStockIndex(index);
    },
    onChange: setStockValue,
    onSave: handleSaveStock,
    onCancel: () => {
      setEditingStockIndex(null);
      setStockValue("");
    },
  };

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Panel de tienda" />
      <MDBox py={3}>
        {storeInfo ? (
          <StoreHeaderCard
            store={storeInfo}
            vendorCount={vendors.length}
            summary={stockSummary}
            refreshing={loading}
            onRefresh={handleRefresh}
            onEdit={() => {
              setEditedStore({ ...storeInfo });
              setEditStoreOpen(true);
            }}
            onDelete={() => setConfirmStoreDelete(true)}
          />
        ) : (
          <StateMessage state={loading ? "loading" : "error"} message="Cargando la tienda…" />
        )}

        <InventoryNotice summary={stockSummary} />
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
        <VendorList vendors={vendors} onAdd={handleOpenAddVendorDialog} />
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
                onChange={(e) => {
                  const email = e.target.value;
                  setNewVendor((prev) => ({ ...prev, email }));
                  if (existingEmails.includes(email)) {
                    setEmailError("Este correo ya está registrado");
                  } else {
                    setEmailError("");
                  }
                }}
                margin="dense"
                error={!!emailError}
                helperText={emailError}
              />
              <TextField
                fullWidth
                label="Username"
                value={newVendor.username}
                onChange={(e) => {
                  const username = e.target.value;
                  setNewVendor((prev) => ({ ...prev, username }));
                  if (existingUsernames.includes(username)) {
                    setUsernameError(
                      "Este nombre de usuario ya está registrado"
                    );
                  } else {
                    setUsernameError("");
                  }
                }}
                margin="dense"
                error={!!usernameError}
                helperText={usernameError}
              />
              <TextField
                fullWidth
                label="Contraseña"
                type="text"
                value={newVendor.password}
                onChange={(e) =>
                  setNewVendor((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                margin="dense"
              />
              <TextField
                fullWidth
                label="Confirmar contraseña"
                type="text"
                value={confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfirmPassword(value);
                  if (value !== newVendor.password) {
                    setConfirmError("Las contraseñas no coinciden");
                  } else {
                    setConfirmError("");
                  }
                }}
                margin="dense"
                error={!!confirmError}
                helperText={confirmError}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddVendorDialog}>Cancelar</Button>
              <Button
                onClick={async () => {
                  if (!!emailError || !!usernameError) return;
                  try {
                    const res1 = await fetch(`${API_BASE_URL}/user`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newVendor),
                    });
                    const result1 = await res1.json();
                    if (!res1.ok)
                      throw new Error(
                        result1.message || "Error creando usuario"
                      );
                    const res2 = await fetch(`${API_BASE_URL}/event_vendor`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        user_id: result1._id,
                        store_id: storeId,
                      }),
                    });
                    if (!res2.ok)
                      throw new Error("Error asignando vendedor a la tienda");
                    fetchVendors();
                    handleCloseAddVendorDialog();
                  } catch (error) {
                    console.error("Error guardando vendedor:", error);
                    alert("Ocurrió un error al guardar el vendedor.");
                  }
                }}
                color="primary"
                disabled={
                  !!emailError ||
                  !!usernameError ||
                  !!confirmError ||
                  !newVendor.email.trim() ||
                  !newVendor.username.trim() ||
                  !newVendor.password.trim() ||
                  !confirmPassword.trim()
                }
              >
                Guardar
              </Button>
            </DialogActions>
          </Dialog>
        <ProductTable
          products={productList}
          inventory={inventory}
          loading={loading}
          hideUntracked={hideUntracked}
          onToggleHideUntracked={() => setHideUntracked((v) => !v)}
          discountEdit={discountEdit}
          stockEdit={stockEdit}
          onAdd={handleOpenAddDialog}
          onEditProduct={handleOpenEditDialog}
          onDeleteProduct={(p) => {
            setProductToDelete(p);
            setOpenConfirmDialog(true);
          }}
        />
      </MDBox>
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
                      body: JSON.stringify({
                        name: editedStore.name,
                      }),
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
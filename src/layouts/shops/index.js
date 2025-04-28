import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  TextField,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import useAxios from "hooks/useAxios";
import { Skeleton } from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import AddShop from "./Components/AddShop";

import { API_BASE_URL } from "config";

const Shops = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [storesWithProductCount, setStoresWithProductCount] = useState([]);
  const navigate = useNavigate();
  const eventId = localStorage.getItem("eventId");

  const {
    data: stores,
    loading: storesLoading,
    error: storesError,
  } = useAxios(`${API_BASE_URL}/store/by_event?id=${eventId}`);

  const refreshStores = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store/by_event?id=${eventId}`);
      const newStores = await res.json();

      const storesWithCounts = await Promise.all(
        newStores.map(async (store) => {
          try {
            const response = await fetch(
              `${API_BASE_URL}/store/products?id=${store._id}`
            );
            const products = await response.json();
            return { ...store, productCount: products.length };
          } catch (error) {
            console.error(
              `Error fetching products for store ${store._id}:`,
              error
            );
            return { ...store, productCount: 0 };
          }
        })
      );

      setStoresWithProductCount(storesWithCounts);
      setIsStoresReady(true);
    } catch (err) {
      console.error("Error al refrescar tiendas:", err);
    }
  };

  const [isStoresReady, setIsStoresReady] = useState(false);

  const [openAddShopModal, setOpenAddShopModal] = useState(false);

  const skeletonCount = stores?.length || 6;

  useEffect(() => {
    const fetchProductCounts = async () => {
      if (stores && stores.length > 0) {
        const storesWithCounts = await Promise.all(
          stores.map(async (store) => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/store/products?id=${store._id}`
              );
              const products = await response.json();
              return { ...store, productCount: products.length };
            } catch (error) {
              console.error(
                `Error fetching products for store ${store._id}:`,
                error
              );
              return { ...store, productCount: 0 };
            }
          })
        );
        setStoresWithProductCount(storesWithCounts);
        setIsStoresReady(true);
      }
    };

    fetchProductCounts();
  }, [stores]);

  const filteredStores = storesWithProductCount.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetSearch = () => setSearchTerm("");

  const handleCardClick = (id) => {
    navigate(`/shop-products/${id}`);
  };

  if (storesLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Tiendas" />
        <MDBox pt={6} pb={3} display="flex">
          <div variant="h6">
            Cargando...
            <CircularProgress size={24} color="secondary" />
          </div>
        </MDBox>
      </DashboardLayout>
    );
  }

  if (storesError) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Tiendas" />
        <MDBox pt={6} pb={3} display="flex" justifyContent="center">
          <MDTypography variant="h6">
            Error al obtener las tiendas.
          </MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Tiendas" />
      <MDBox pt={3} pr={2} pl={2} pb={3}>
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextField
              label="Buscar tienda"
              placeholder="Buscar por nombre"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
            />
            <IconButton
              onClick={resetSearch}
              sx={{ ml: 2 }}
              title="Reiniciar búsqueda"
            >
              <RefreshIcon fontSize="medium" />
            </IconButton>
          </Box>

          <MDTypography variant="caption" sx={{ fontSize: "1rem" }}>
            {filteredStores.length === 1
              ? "1 tienda encontrada"
              : `${filteredStores.length} tiendas encontradas`}
          </MDTypography>
        </Box>

        <Grid container rowSpacing={3} columnSpacing={3}>
          {(isStoresReady
            ? filteredStores
            : Array(skeletonCount).fill(null)
          ).map((store, index) => (
            <Grid item xs={12} sm={6} md={4} key={store?._id || index}>
              {isStoresReady ? (
                <Grid container>
                  <Grid item xs={3}>
                    <Card
                      sx={{
                        backgroundColor: "grey.800",
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
                        <StorefrontIcon
                          fontSize="large"
                          sx={{ color: "#fff" }}
                        />
                      </Box>
                    </Card>
                  </Grid>
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
                        {store.productCount} productos
                      </MDTypography>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                // Skeletons
                <Grid container>
                  {/* Skeleton ícono izquierdo */}
                  <Grid item xs={3}>
                    <Card
                      sx={{
                        backgroundColor: "grey.300",
                        borderTopLeftRadius: 50,
                        borderBottomLeftRadius: 50,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        p: 4,
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Skeleton
                        variant="circular"
                        width={100}
                        height={100}
                        animation="wave"
                      />
                    </Card>
                  </Grid>

                  {/* Skeleton texto derecho */}
                  <Grid item xs={9}>
                    <Card
                      sx={{
                        backgroundColor: "grey.200",
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderTopRightRadius: 50,
                        borderBottomRightRadius: 50,
                        p: 4,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Skeleton
                        variant="text"
                        width="70%"
                        height={30}
                        animation="wave"
                      />
                      <Skeleton
                        variant="text"
                        width="40%"
                        height={20}
                        animation="wave"
                      />
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Grid>
          ))}
          {/* tarjeta Agregar Tienda */}
          {searchTerm === "" && (
            <Grid item xs={12} sm={6} md={4}>
              {isStoresReady ? (
                <Card
                  onClick={() => setOpenAddShopModal(true)}
                  sx={{
                    p: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    gap: 2,
                    backgroundColor: "grey.200",
                    border: "2px dashed grey",
                    borderTopLeftRadius: 50,
                    borderBottomLeftRadius: 50,
                    borderTopRightRadius: 50,
                    borderBottomRightRadius: 50,
                    transition: "all 0.3s ease-in-out",
                    "&:hover .hover-grow": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Box
                    className="hover-grow"
                    sx={{ transition: "transform 0.3s ease-in-out" }}
                  >
                    <AddCircleOutlineIcon
                      fontSize="large"
                      sx={{ color: "grey.700" }}
                    />
                  </Box>
                  <Box
                    className="hover-grow"
                    sx={{ transition: "transform 0.3s ease-in-out" }}
                  >
                    <MDTypography
                      variant="h6"
                      sx={{ textAlign: "center", color: "grey.700" }}
                    >
                      Agregar Tienda
                    </MDTypography>
                  </Box>
                </Card>
              ) : (
                // Skeleton 
                <Card
                  sx={{
                    p: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderTopLeftRadius: 50,
                    borderBottomLeftRadius: 50,
                    borderTopRightRadius: 50,
                    borderBottomRightRadius: 50,
                    backgroundColor: "grey.100",
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={60}
                    height={60}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={30}
                    animation="wave"
                    sx={{ mt: 2 }}
                  />
                </Card>
              )}
            </Grid>
          )}
        </Grid>

        <AddShop
          open={openAddShopModal}
          onClose={() => setOpenAddShopModal(false)}
          onRefresh={refreshStores}
          existingStores={storesWithProductCount}
        />

        {isStoresReady && filteredStores.length === 0 && (
          <MDTypography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            No se encontraron tiendas con ese nombre.
          </MDTypography>
        )}
      </MDBox>
    </DashboardLayout>
  );
};

export default Shops;

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import useAxios from "hooks/useAxios";
import { API_BASE_URL } from '../../../../config';
import {
  Typography, IconButton, Grid, CardContent,
  Card, Autocomplete, TextField, InputAdornment,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MDBox from "components/MDBox";
import './style.css';

const SalesSummary = () => {
  const event_id = localStorage.getItem("eventId");
  const [startIndex, setStartIndex] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);
  const navigate = useNavigate();

  const { data, loading, error } = useAxios(
    `${API_BASE_URL}/store/by_event?id=${event_id}`
  );

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al obtener los datos</div>;

  const stores_summary = data;
  const itemsPerPage = 12; // 3 filas × 4 tiendas

  const filteredStores = selectedStore
    ? stores_summary.filter((s) => s._id === selectedStore._id)
    : stores_summary;

  const salesToDisplay = filteredStores.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (startIndex + itemsPerPage < filteredStores.length) {
      setStartIndex(startIndex + itemsPerPage);
    }
  };

  const handlePreviousPage = () => {
    if (startIndex - itemsPerPage >= 0) {
      setStartIndex(startIndex - itemsPerPage);
    }
  };

  const handleStoreSelect = (_, newStore) => {
    setSelectedStore(newStore);
    setStartIndex(0);
    if (newStore) {
      navigate(`/transaccion/${newStore._id}`);
    }
  };

  return (
    <Card>
      <CardContent className="event-summary-container">
        <Typography fontWeight="regular" className="event-sales-title" gutterBottom>
          Resumen por puntos de venta
        </Typography>

        <MDBox mb={3}>
          <Autocomplete
            options={stores_summary || []}
            getOptionLabel={(store) => store.name || ""}
            value={selectedStore}
            onChange={handleStoreSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar tienda"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <StorefrontIcon fontSize="small" />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            noOptionsText="No se encontraron tiendas"
          />
        </MDBox>

        <MDBox py={3}>
          <Grid container spacing={3}>
            {salesToDisplay.map(({ name, _id, total }) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={_id}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="dark"
                    icon="store"
                    title={name}
                    url={`/transaccion/${_id}`}
                    to_url={true}
                    percentage={{
                      color: "success",
                      amount: "",
                      label: "Suma de ventas",
                    }}
                  />
                </MDBox>
              </Grid>
            ))}
          </Grid>
        </MDBox>

        <div style={{ display: "flex", justifyContent: "center" }}>
          {startIndex > 0 && (
            <IconButton onClick={handlePreviousPage}>
              <ArrowBackIcon />
            </IconButton>
          )}
          {filteredStores.length > itemsPerPage && (
            <IconButton onClick={handleNextPage}>
              <ArrowForwardIcon />
            </IconButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

SalesSummary.propTypes = {
  stores_summary: PropTypes.arrayOf(
    PropTypes.shape({
      store: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
    })
  ),
};

export default SalesSummary;
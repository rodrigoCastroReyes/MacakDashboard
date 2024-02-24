import React, { useState } from "react";
import PropTypes from "prop-types";
import {Link} from 'react-router-dom';
import useAxios from "hooks/useAxios";

import {
  Typography,
  IconButton,
  Grid,
  CardContent,
  Card,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MDBox from "components/MDBox";
import './style.css'

const SalesSummary = () => {
  const [startIndex, setStartIndex] = useState(0);
  const { data, loading, error, refetch } = useAxios(
    "https://biodynamics.tech/api_tokens/dashboard/summary_per_store?event_id=f9b857ac-16f2-4852-8981-b72831e7f67c"
  );
  
  if (loading) return <div>Cargando...</div>;
  if (error || !data?.stores_summary)
    return <div>Error al obtener los datos</div>;
  
  const stores_summary = data.stores_summary;
  const itemsPerPage = 6;

  // Limitamos la cantidad de puntos de venta a mostrar a 6
  const salesToDisplay = stores_summary.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Función para dividir el array en grupos de 3 elementos
  const chunkArray = (arr, size) => {
    return arr.reduce(
      (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
      []
    );
  };

  // Dividimos los puntos de venta en grupos de 3
  const chunkedSales = chunkArray(salesToDisplay, 3);

  const handleNextPage = () => {
    if (startIndex + itemsPerPage < stores_summary.length) {
      setStartIndex(startIndex + itemsPerPage);
    }
  };

  const handlePreviousPage = () => {
    if (startIndex - itemsPerPage >= 0) {
      setStartIndex(startIndex - itemsPerPage);
    }
  };

  return (
    <Card>
      <CardContent className="event-summary-container">
        <Typography fontWeight="regular" 
          className="event-sales-title" gutterBottom>
         Resumen por puntos de venta
        </Typography>
        <MDBox py={3}>
          <Grid container spacing={3}>
            {stores_summary.map(({ name, store_id, total}) => (
              <React.Fragment key={name}>
                <Grid item xs={12} md={6} lg={3}>
                  <MDBox mb={1.5}>
                  <Link to={`/transaccion/${store_id}`}>
                    <ComplexStatisticsCard
                      color="dark"
                      icon="store"
                      title={ name }
                      count={ "$"+ total }
                      percentage={{
                      color: "success",
                      amount: "",
                      label: "Suma de ventas",
                      }}
                      />
                  </Link>
                  </MDBox>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </MDBox>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {startIndex > 0 && (
            <IconButton onClick={handlePreviousPage}>
              <ArrowBackIcon />
            </IconButton>
          )}
          {stores_summary.length > itemsPerPage && (
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

import React, { useState } from "react";
import PropTypes from "prop-types";
import {Link} from 'react-router-dom';
import useAxios from "hooks/useAxios";

// URL
import { API_BASE_URL } from '../../../../config';

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
  const event_id = localStorage.getItem("eventId");
  const [startIndex, setStartIndex] = useState(0);
  const { data, loading, error } = useAxios(
    `${API_BASE_URL}/dashboard/summary_per_store?event_id=${event_id}`
  );
  
  if (loading) return <div>Cargando...</div>;
  if (!data?.stores_summary)
    return <div>¡ Sin ventas !</div>;
  if (error)
    return <div>Error al obtener los datos</div>;
  
  const stores_summary = data.stores_summary;
  const itemsPerPage = 6;

  // Limitamos la cantidad de puntos de venta a mostrar a 6
  const salesToDisplay = stores_summary.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // eslint-disable-next-line no-lone-blocks
  //Función para dividir el array en grupos de 3 elementos
  const chunkArray = (arr, size) => {
    return arr.reduce(
      (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
      []
    );
  };

  // Dividimos los puntos de venta en grupos de 3
  // eslint-disable-next-line no-unused-vars
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
                    <ComplexStatisticsCard
                      color="dark"
                      icon="store"
                      title={ name }
                      count={ "$"+ total }
                      url={`/transaccion/${store_id}`}
                      to_url={true}
                      percentage={{
                      color: "success",
                      amount: "",
                      label: "Suma de ventas",
                      }}
                    />
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

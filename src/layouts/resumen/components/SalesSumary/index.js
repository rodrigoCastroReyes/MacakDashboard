import React, { useState } from "react";
import PropTypes from "prop-types";
import {Link} from 'react-router-dom';
import useAxios from "hooks/useAxios";

import {
  Typography,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  IconButton,
  Grid,
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
    <div>
      <Typography variant="h6" gutterBottom>
        Resumen de ventas
      </Typography>
      <TableContainer>
        <Table>
          <TableBody>
            {chunkedSales.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map(({ store, total}) => (
                  <React.Fragment key={store}>
                    <TableCell
                      style={{
                        width: "25%",
                        height: "175px",
                        border: "40px solid white",
                        background: "white",
                        padding: 0,
                        justifyItems: "center",
                        justifySelf: "center",
                      }}
                    >
                      <Link to={`/transaccion/${store}`}>
                        <Grid
                          sx={{
                            borderRadius: "10%",
                            background: "white",
                            height: "100%",
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Typography align="center">
                            <Typography align="center">${total}</Typography>
                            <Avatar>
                              <StoreIcon />
                            </Avatar>
                            <Typography variant="h3">{store}</Typography>
                          </Typography>
                        </Grid>
                      </Link>
                    </TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
    </div>
  );
};

SalesSummary.propTypes = {
  stores_summary: PropTypes.arrayOf(
    PropTypes.shape({
      store: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default SalesSummary;

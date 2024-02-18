import React, { useState } from "react";
import PropTypes from "prop-types";
import {Link} from 'react-router-dom';

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

const SalesSummary = ({ salesByPos }) => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 6;

  // Limitamos la cantidad de puntos de venta a mostrar a 6
  const salesToDisplay = salesByPos.slice(
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
    if (startIndex + itemsPerPage < salesByPos.length) {
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
                {row.map(({ pos, sales, store_id }) => (
                  <React.Fragment key={pos}>
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
                      <Link to={`/transaccion/${store_id}`}>
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
                            <Typography align="center">${sales}</Typography>
                            <Avatar>
                              <StoreIcon />
                            </Avatar>
                            <Typography variant="h3">{pos}</Typography>
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
        {salesByPos.length > itemsPerPage && (
          <IconButton onClick={handleNextPage}>
            <ArrowForwardIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
};

SalesSummary.propTypes = {
  salesByPos: PropTypes.arrayOf(
    PropTypes.shape({
      pos: PropTypes.string.isRequired,
      sales: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default SalesSummary;

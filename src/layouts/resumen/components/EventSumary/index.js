import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import PropTypes from "prop-types";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

const EventSummary = ({
  totalSales,
  totalIncome,
  activatedTokens,
  salesPoints,
  transactions,
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resumen del evento
        </Typography>
        <TableContainer
          sx={{ width: "40%", overflowX: "auto" }}
          style={{ width: "100%" }}
        >
          <Table>
            <TableBody>
              <TableRow style={{ height: "auto" }}>
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
                  <Grid
                    sx={{
                      borderRadius: "10%",
                      background: "white",
                      height: "100%",
                      width: "50%",
                      justifyContent: "center",
                      alignItems: "center",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography align="center">
                      <Typography align="center" style={{ color: "#197BBD" }}>
                        ${totalSales}
                      </Typography>
                      <Typography variant="h3" align="center">
                        Ventas Totales
                      </Typography>
                    </Typography>
                  </Grid>
                </TableCell>
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
                  <Grid
                    sx={{
                      borderRadius: "10%",
                      background: "white",
                      height: "100%",
                      width: "50%",
                      justifyContent: "center",
                      alignItems: "center",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography align="center">
                      <Typography align="center" style={{ color: "#197BBD" }}>
                        ${totalIncome}
                      </Typography>
                      <Typography variant="h3" align="center">
                        Saldo Total
                      </Typography>
                    </Typography>
                  </Grid>
                </TableCell>
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
                  <Grid
                    sx={{
                      borderRadius: "10%",
                      background: "white",
                      height: "100%",
                      width: "50%",
                      justifyContent: "center",
                      alignItems: "center",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography align="center">
                      <Typography align="center" style={{ color: "#197BBD" }}>
                        {activatedTokens}
                      </Typography>
                      <Typography variant="h3" align="center">
                        Tokens activados
                      </Typography>
                    </Typography>
                  </Grid>
                </TableCell>
              </TableRow>
              <TableRow style={{ height: "auto" }}>
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
                  <Grid
                    sx={{
                      borderRadius: "10%",
                      background: "white",
                      height: "100%",
                      width: "50%",
                      justifyContent: "center",
                      alignItems: "center",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography align="center">
                      <Typography align="center" style={{ color: "#197BBD" }}>
                        {salesPoints}
                      </Typography>
                      <Typography variant="h3" align="center">
                        Puntos de venta
                      </Typography>
                    </Typography>
                  </Grid>
                </TableCell>
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
                      <Typography align="center" style={{ color: "#197BBD" }}>
                        {transactions}
                      </Typography>
                      <Typography variant="h3" align="center">
                        Transacciones
                      </Typography>
                    </Typography>
                  </Grid>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

EventSummary.propTypes = {
  totalSales: PropTypes.number.isRequired,
  totalIncome: PropTypes.number.isRequired,
  activatedTokens: PropTypes.number.isRequired,
  salesPoints: PropTypes.number.isRequired,
  transactions: PropTypes.number.isRequired,
};

export default EventSummary;

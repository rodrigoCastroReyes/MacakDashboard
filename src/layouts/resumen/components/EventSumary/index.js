import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import PropTypes from "prop-types";
import './style.css'

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
        <Typography className="event-summary-title" gutterBottom>
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
                    fontFamily: 'lato',
                    width: "33.33%",
                    height: "50px",
                    border: "10px solid white",
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
                      <Typography align="center" className="event-summary-value">
                        ${totalSales}
                      </Typography>
                      <Typography  className="event-summary-label" align="center">
                        Ventas
                      </Typography>
                    </Typography>
                  </Grid>
                </TableCell>
                <TableCell
                  style={{
                    width: "33.33%",
                    height: "50px",
                    border: "10px solid white",
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
                      <Typography align="center" className="event-summary-value">
                        ${totalIncome}
                      </Typography>
                      <Typography className="event-summary-label" align="center">
                        Recargas
                      </Typography>
                    </Typography>
                  </Grid>
                </TableCell>
                <TableCell
                  style={{
                    height: "50px",
                    border: "10px solid white",
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
                      <Typography align="center" className="event-summary-value" >
                        {activatedTokens}
                      </Typography>
                      <Typography className="event-summary-label" align="center">
                        Tokens
                      </Typography>
                    </Typography>
                  </Grid>
                </TableCell>
              </TableRow>
              <TableRow style={{ height: "auto" }}>
                <TableCell
                  style={{
                    width: "50%",
                    height: "50px",
                    border: "10px solid white",
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
                      <Typography align="center" className="event-summary-value">
                        {salesPoints}
                      </Typography>
                      <Typography className="event-summary-label" align="center">
                        Puntos de venta
                      </Typography>
                    </Typography>
                  </Grid>
                </TableCell>
                <TableCell
                  style={{
                    width: "50%",
                    height: "50px",
                    border: "10px solid white",
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
                      <Typography align="center" className="event-summary-value">
                        {transactions}
                      </Typography>
                      <Typography className="event-summary-label" align="center">
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

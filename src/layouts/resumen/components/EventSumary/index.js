import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import PropTypes from "prop-types";
import './style.css'
import MDBox from "components/MDBox";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

const EventSummary = ({
  totalSales,
  totalIncome,
  activatedTokens,
  salesPoints,
}) => {
  return (
    <Card>
      <CardContent className="event-summary-container" >
        <Typography className="event-summary-title">
          Estadísticas del evento
        </Typography>
        <MDBox py={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="weekend"
                  title="Ventas totales del evento"
                  count={ "$" + totalSales}
                  url=""
                  to_url={false}
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Ventas de todos los puntos de venta",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="leaderboard"
                  title="Recargas de tokens"
                  count={ "$" + totalIncome }
                  url=""
                  to_url={false}
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Suma de todas las recargas",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="leaderboard"
                  title="Tokens activados"
                  count={ activatedTokens}
                  url=""
                  to_url={false}
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Tokens registrados al evento",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="store"
                  title="Puntos de venta"
                  count={ salesPoints}
                  url=""
                  to_url={false}
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Numero de tiendas registradas",
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </CardContent>
    </Card>
  );
};

EventSummary.propTypes = {
  totalSales: PropTypes.number.isRequired,
  totalIncome: PropTypes.number.isRequired,
  activatedTokens: PropTypes.number.isRequired,
  salesPoints: PropTypes.number.isRequired
};

export default EventSummary;

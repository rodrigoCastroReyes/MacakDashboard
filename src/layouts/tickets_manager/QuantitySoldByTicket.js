import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";

function QuantitySoldByTicket({ data }) {
  if (!data) return <div>Cargando...</div>;

  if (data.length === 0)
    return (
      <div
        style={{ padding: "8px", display: "flex", justifyContent: "center" }}
      >
        Sin datos disponibles
      </div>
    );

  const topThreeTickets = data.slice(0, 3);

  return (
    <Card
      sx={{ padding: 3, backgroundColor: "transparent", boxShadow: "none" }}
    >
      <MDBox mb={2}>
        <MDTypography 
        colorVerticalBarChart="dark" fontWeight="bold" 
        fontFamily="montserrat-semibold" component="div" 
        align="left" style={{ fontSize: "1.1rem" }} >

          Tickets vendidos por localidad
          
        </MDTypography>
      </MDBox>
      <Grid container spacing={2} justifyContent="center" alignItems="stretch">
        {topThreeTickets.map((ticket, index) => {
          const sold = ticket.sold_quantity;
          const available = ticket.max_quantity - ticket.sold_quantity;

          const chartData = {
            labels: ["Vendidos", "Disponibles"],
            datasets: {
              label: ticket.name,
              data: [sold, available],
              backgroundColors: ["light", "info"],
              centerText: {
                enabled: true,
                sold,
                total: sold + available,
                fontSize: 16,
                color: "#333",
              },
            },
            cutout: 70,
          };

          return (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <DefaultDoughnutChart
                title={ticket.name}
                description={`Vendidos: ${sold} / ${ticket.max_quantity}`}
                chart={chartData}
                height="230px"
              />
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
}

export default QuantitySoldByTicket;

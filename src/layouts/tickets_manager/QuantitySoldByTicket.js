import React, { useState, useMemo } from "react";
import useAxios from "hooks/useAxios";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";
import PieChart from "examples/Charts/PieChart";
import HorizontalStackedBarChart from "examples/Charts/BarCharts/HorizontalStackedBarChart";

function QuantitySoldByTicket({data}) {

  const totalTicketsSold = data.reduce((acc, ticket) => acc + ticket.sold_quantity, 0);

  const chart = useMemo(() => {
    return {
      labels: data.map((ticket) => ticket.name),
      datasets: [
        {
          label: "Vendidos",
          color: "rgba(255, 159, 64, 1)",
          data: data.map((ticket) =>  ticket.sold_quantity),
          backgroundColor: [
            'rgba(191, 223, 20, 1)',
            'rgba(118, 210, 224, 1)',
            'rgba(236, 64, 112, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ]
        },
        {
          label: "Disponibles",
          color: "rgba(75, 192, 192, 1)",
          data: data.map((ticket) =>  ticket.max_quantity - ticket.sold_quantity )
        }
      ],
    };
  }, [data]);

  if (!data) return <div>Cargando...</div>;

  if (data.length === 0)
    return (
      <div style={{ paddingTop: "8px", paddingBottom: "8px", display: "flex", justifyContent: "center" }}>
        Sin datos disponibles
      </div>
    );
  
  return (
    //<PieChart title="Tickets vendidos por localidad" description={totalTicketsSold} chart={chart} height="300px" />
    <HorizontalStackedBarChart title="Tickets vendidos por localidad" description={totalTicketsSold} chart={chart} height="300px" />
  );
}

export default QuantitySoldByTicket;

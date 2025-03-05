import React, { useState, useMemo } from "react";
import useAxios from "hooks/useAxios";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";
import PieChart from "examples/Charts/PieChart";

function QuantitySoldByTicket({data}) {

  const totalTicketsSold = data.reduce((acc, ticket) => acc + ticket.sold_quantity, 0);

  const chart = useMemo(() => {
    return {
      labels: data.map((ticket) => ticket.name),
      datasets: [
        {
          label: "Tipos de localidades",
          color: "primary",
          data: data.map((ticket) =>  ticket.sold_quantity),
          backgroundColor: [
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ]
        },
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
    <PieChart title="Tickets vendidos por localidad" description={totalTicketsSold} chart={chart} height="300px" />
  );
}

export default QuantitySoldByTicket;

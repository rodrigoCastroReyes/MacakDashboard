import React, { useState, useMemo } from "react";
import useAxios from "hooks/useAxios";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";

function SalesPerTicket({data}) {

  const totalSales = data.reduce((acc, ticket) => acc + ticket.sold_quantity * ticket.price, 0);

  const chart = useMemo(() => {
    return {
      labels: data.map((ticket) => ticket.name),
      datasets: [
        {
          label: "Ventas por localidad",
          color: "success",
          data: data.map((ticket) =>  ticket.sold_quantity*ticket.price ),
        },
      ],
    };
  }, [ data ]);
  

  if (!data) return <div>Cargando...</div>;

  if (data.length === 0)
    return (
      <div style={{ paddingTop: "8px", paddingBottom: "8px", display: "flex", justifyContent: "center" }}>
        Sin datos disponibles
      </div>
    );

  return (
    <VerticalBarChart title="Ventas por localidad" description={`$${totalSales}`} chart={chart} height="350px" />
  );
}

export default SalesPerTicket;

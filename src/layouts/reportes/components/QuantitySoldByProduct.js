import React, { useState, useMemo } from "react";
import useAxios from "hooks/useAxios";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";
import PieChart from "examples/Charts/PieChart";

function QuantitySoldByProduct({id_store}) {
  const { data, loading, error } = useAxios(
    `https://biodynamics.tech/api_tokens/dashboard/sold_products?store_id=${id_store}`
  );

  const chart = useMemo(() => {
    return {
      labels: data?.report.map((product) => product.description),
      datasets: [
        {
          label: "Cantidad vendida",
          color: "primary",
          data: data?.report.map((product) => product.quantity),
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

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.report || !data?.total)
    return  <div pt="2" pb="2" display="flex" justifyContent="center">Sin datos disponibles</div>;
  return (
    <PieChart title="Unidades vendidas por producto" description={data.total} chart={chart} height="300px" />
  );
}

export default QuantitySoldByProduct;

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
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.report || !data?.total)
    return <div>Error al obtener los datos</div>;

  return (
    <PieChart title="Unidades vendidas por producto" description={
    data.total} chart={chart} />
  );
}

export default QuantitySoldByProduct;

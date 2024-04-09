import React, { useState, useMemo } from "react";
import useAxios from "hooks/useAxios";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";

function SalesPerProduct({id_store}) {
  const { data, loading, error } = useAxios(
    `https://biodynamics.tech/api_tokens/dashboard/total_per_product?store_id=${id_store}`
  );

  const getProductValue = (value) => {
    if(value % 1 === 0){
      return Number.parseFloat(value).toFixed(2);
    }else{
      return value.toFixed(2);
    }
  };
  const chart = useMemo(() => {
    return {
      labels: data?.report.map((product) => product.description),
      datasets: [
        {
          label: "Total vendido",
          color: "primary",
          data: data?.report.map((product) => getProductValue(product.value)),
        },
      ],
    };
  }, [ data, getProductValue]);
  
  if (loading) return <div>Cargando...</div>;
  
  if (error || !data?.report || !data?.total)
    return <div>Error al obtener los datos</div>;

  return (
    <VerticalBarChart title="Total de ventas por producto" description={
    `$${data.total}`} chart={chart} height="200px" />
  );
}

export default SalesPerProduct;

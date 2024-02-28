import React from "react";
import useAxios from "hooks/useAxios";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";

function SalesPerProduct() {
  const { data, loading, error } = useAxios(
    "https://biodynamics.tech/api_tokens/dashboard/total_per_product?store_id=d22aac82-0680-4c84-a166-4fa348b3b2c7"
  );

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.report || !data?.total)
    return <div>Error al obtener los datos</div>;

  const report = data?.report;
  
  const getProductValue = (value) => {
    if(value % 1 === 0){
      return Number.parseFloat(value).toFixed(2);
    }else{
      return value.toFixed(2);
    }
  };

  const chart = {
    labels: report.map((product) => product.description),
    datasets: [
      {
        label: "Total vendido",
        color: "primary",
        data: report.map((product) => getProductValue(product.value)),
      },
    ],
  };

  return (
    <VerticalBarChart title="Total de ventas por producto" description={
    `$${data.total}`} chart={chart} />
  );
}

export default SalesPerProduct;

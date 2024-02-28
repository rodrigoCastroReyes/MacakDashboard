import React from "react";
import useAxios from "hooks/useAxios";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";

function QuantitySoldByProduct() {
  const { data, loading, error } = useAxios(
    "https://biodynamics.tech/api_tokens/dashboard/sold_products?store_id=d22aac82-0680-4c84-a166-4fa348b3b2c7"
  );

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.report || !data?.total)
    return <div>Error al obtener los datos</div>;

  const report = data?.report;

  const chart = {
    labels: report.map((product) => product.description),
    datasets: [
      {
        label: "Cantidad vendida",
        color: "success",
        data: report.map((product) => product.quantity),
      },
    ],
  };

  return (
    <VerticalBarChart title="Unidades vendidas por producto" description={
    data.total} chart={chart} />
  );
}

export default QuantitySoldByProduct;

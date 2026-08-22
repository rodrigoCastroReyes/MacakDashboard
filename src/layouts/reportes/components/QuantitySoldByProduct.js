import React, { useMemo } from "react";
import useAxios from "hooks/useAxios";
import HorizontalBarChart from "examples/Charts/BarCharts/HorizontalBarChart";
import { schemeTableau10 } from 'd3-scale-chromatic';
import { API_BASE_URL } from '../../../config';

function QuantitySoldByProduct({ id_store }) {
  const { data, loading, error } = useAxios(
    `${API_BASE_URL}/dashboard/sold_products?store_id=${id_store}`
  );

  const chart = useMemo(() => {
    if (!data?.report) return { labels: [], datasets: [] };
    return {
      labels: data.report.map((p) => p.description),
      datasets: [{
        label: "Unidades",
        data: data.report.map((p) => p.quantity),
        backgroundColor: data.report.map((_, i) =>
          schemeTableau10[i % schemeTableau10.length]
        ),
        borderRadius: 4,
        datalabels: {
          color: "#ffffff",
          anchor: "center",
          align: "center",
          font: { size: 11, weight: "500" },
          formatter: (v, ctx) => {
            const max = Math.max(...ctx.dataset.data);
            return v / max < 0.15 ? "" : v;
          },
        },
      }],
    };
  }, [data]);

  if (loading) return <div>Cargando...</div>;
  if (error || !data?.report || !data?.total)
    return <div>Sin datos disponibles</div>;

  return (
    <HorizontalBarChart
      title="Unidades por producto"
      description={`${data.total} u`}
      chart={chart}
      height="420px"
    />
  );
}

export default QuantitySoldByProduct;
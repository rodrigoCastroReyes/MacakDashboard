import React, { useMemo } from "react";
import useAxios from "hooks/useAxios";
import HorizontalBarChart from "examples/Charts/BarCharts/HorizontalBarChart";
import { schemeTableau10 } from 'd3-scale-chromatic';
import { API_BASE_URL } from '../../../config';

function SalesPerProduct({ id_store }) {
  const { data: salesData, loading: salesLoading } = useAxios(
    `${API_BASE_URL}/dashboard/total_per_product?store_id=${id_store}`
  );

  const top5 = useMemo(() => {
    if (!salesData?.report) return [];
    return [...salesData.report]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [salesData]);

  const chart = useMemo(() => {
    if (!top5.length) return { labels: [], datasets: [] };
    return {
      labels: top5.map((p) => p.description),
      datasets: [{
        label: "Ingresos ($)",
        data: top5.map((p) => p.value.toFixed(2)),
        backgroundColor: top5.map((_, i) => schemeTableau10[i % schemeTableau10.length]),
        borderRadius: 4,
        datalabels: {
          color: "#ffffff",
          anchor: "center",
          align: "center",
          font: { size: 11, weight: "500" },
          formatter: (v, ctx) => {
            const max = Math.max(...ctx.dataset.data);
            return v / max < 0.15 ? "" : `$${v}`;
          },
        },
      }],
    };
  }, [top5]);

  if (salesLoading) return <div>Cargando...</div>;
  if (!salesData?.report) return <div>Sin datos disponibles</div>;

  const total = top5.reduce((acc, p) => acc + p.value, 0).toFixed(2);

  return (
    <HorizontalBarChart
      title="Top 5 por ingresos"
      description={`$${total}`}
      chart={chart}
      height="420px"
    />
  );
}

export default SalesPerProduct;
import { useMemo, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import StateMessage from "examples/StateMessage";
import HorizontalBarChart from "examples/Charts/BarCharts/HorizontalBarChart";

import useAxios from "hooks/useAxios";
import { CHART_PRIMARY } from "utils/chartColors";
import { formatNumber } from "utils/format";
import { API_BASE_URL } from "config";

const TOP_N = 5;

function QuantitySoldByProduct({ id_store, refreshToken = 0 }) {
  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/sold_products?store_id=${id_store}`
  );

  // El botón "Actualizar" de la cabecera incrementa refreshToken; refetch ignora
  // la caché de 10 minutos y trae datos frescos.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    refetch();
  }, [refreshToken, refetch]);


  const { top, totalAll } = useMemo(() => {
    const report = data?.report || [];
    const sorted = [...report].sort((a, b) => b.quantity - a.quantity);
    return {
      top: sorted.slice(0, TOP_N),
      totalAll: sorted.reduce((acc, p) => acc + (p.quantity || 0), 0),
    };
  }, [data]);

  const chart = useMemo(
    () => ({
      labels: top.map((p) => p.description),
      datasets: [
        {
          label: "Unidades",
          data: top.map((p) => p.quantity),
          backgroundColor: CHART_PRIMARY,
          borderRadius: 4,
          datalabels: {
            // Igual que en ingresos: fuera de la barra, siempre visible.
            anchor: "end",
            align: "end",
            offset: 4,
            color: "#152c5b",
            font: { size: 11, weight: "600" },
            formatter: (v) => formatNumber(v),
          },
        },
      ],
    }),
    [top]
  );

  const options = useMemo(
    () => ({
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const share = totalAll ? (ctx.raw / totalAll) * 100 : 0;
              return `${formatNumber(ctx.raw)} u · ${share.toFixed(1)}% del total`;
            },
          },
        },
      },
    }),
    [totalAll]
  );

  if (loading) {
    return (
      <StateMessage state="loading" message="Cargando productos…" />
    );
  }

  if (error || !top.length) {
    return (
      <MDBox p={3}>
        <MDTypography variant="button" color={error ? "error" : "text"}>
          {error ? "Error al obtener los datos" : "Sin unidades vendidas"}
        </MDTypography>
      </MDBox>
    );
  }

  const topUnits = top.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const share = totalAll ? Math.round((topUnits / totalAll) * 100) : 0;

  return (
    <HorizontalBarChart
      title={`Top ${top.length} por unidades`}
      description={
        <MDBox>
          <MDTypography variant="h4" fontWeight="bold" color="dark" sx={{ lineHeight: 1.2 }}>
            {formatNumber(topUnits)} u
          </MDTypography>
          {share < 100 && (
            <MDTypography variant="caption" color="text">
              {share}% de las {formatNumber(totalAll)} u vendidas
            </MDTypography>
          )}
        </MDBox>
      }
      chart={chart}
      options={options}
      height={`${top.length * 52 + 40}px`}
    />
  );
}

QuantitySoldByProduct.propTypes = {
  id_store: PropTypes.string.isRequired,
  refreshToken: PropTypes.number,
};

export default QuantitySoldByProduct;

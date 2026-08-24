import { useMemo, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import StateMessage from "examples/StateMessage";
import HorizontalBarChart from "examples/Charts/BarCharts/HorizontalBarChart";

import useAxios from "hooks/useAxios";
import { CHART_PRIMARY } from "utils/chartColors";
import { formatCurrency } from "utils/format";
import { API_BASE_URL } from "config";

const TOP_N = 5;

function SalesPerProduct({ id_store, refreshToken = 0 }) {
  const { data: salesData, loading: salesLoading, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/total_per_product?store_id=${id_store}`
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


  const { top, totalTop, totalAll } = useMemo(() => {
    const report = salesData?.report || [];
    const sorted = [...report].sort((a, b) => b.value - a.value);
    const t = sorted.slice(0, TOP_N);
    return {
      top: t,
      totalTop: t.reduce((acc, p) => acc + p.value, 0),
      totalAll: sorted.reduce((acc, p) => acc + p.value, 0),
    };
  }, [salesData]);

  const chart = useMemo(
    () => ({
      labels: top.map((p) => p.description),
      datasets: [
        {
          label: "Ingresos",
          data: top.map((p) => p.value),
          backgroundColor: CHART_PRIMARY,
          borderRadius: 4,
          datalabels: {
            // Al final de la barra y en tinta oscura: antes iba dentro en blanco y
            // se ocultaba en las barras cortas, así que los productos con menos
            // ingresos no mostraban ninguna cifra.
            anchor: "end",
            align: "end",
            offset: 4,
            color: "#152c5b",
            font: { size: 11, weight: "600" },
            formatter: (v) => formatCurrency(v),
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
              return `${formatCurrency(ctx.raw)} · ${share.toFixed(1)}% del total`;
            },
          },
        },
      },
    }),
    [totalAll]
  );

  if (salesLoading) {
    return (
      <StateMessage state="loading" message="Cargando productos…" />
    );
  }

  if (!top.length) {
    return (
      <MDBox p={3}>
        <MDTypography variant="button" color="text">
          Sin ventas registradas en esta tienda
        </MDTypography>
      </MDBox>
    );
  }

  const share = totalAll ? Math.round((totalTop / totalAll) * 100) : 0;

  return (
    <HorizontalBarChart
      title={`Top ${top.length} por ingresos`}
      description={
        <MDBox>
          <MDTypography variant="h4" fontWeight="bold" color="dark" sx={{ lineHeight: 1.2 }}>
            {formatCurrency(totalTop)}
          </MDTypography>
          {share < 100 && (
            <MDTypography variant="caption" color="text">
              {share}% de los {formatCurrency(totalAll)} de la tienda
            </MDTypography>
          )}
        </MDBox>
      }
      chart={chart}
      options={options}
      // Alto proporcional al número de barras: 420px fijos dejaban mucho hueco.
      height={`${top.length * 52 + 40}px`}
    />
  );
}

SalesPerProduct.propTypes = {
  id_store: PropTypes.string.isRequired,
  refreshToken: PropTypes.number,
};

export default SalesPerProduct;

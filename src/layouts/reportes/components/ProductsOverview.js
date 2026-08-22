import React, { useState, useMemo } from "react";
import useAxios from "hooks/useAxios";
import HorizontalBarChart from "examples/Charts/BarCharts/HorizontalBarChart";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import BarChartIcon from '@mui/icons-material/BarChart';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { API_BASE_URL } from '../../../config';

function ProductsOverview({ id_store }) {
  const [view, setView] = useState('chart');

  const { data: salesData, loading: salesLoading } = useAxios(
    `${API_BASE_URL}/dashboard/total_per_product?store_id=${id_store}`
  );
  const { data: unitsData, loading: unitsLoading } = useAxios(
    `${API_BASE_URL}/dashboard/sold_products?store_id=${id_store}`
  );

  const chart = useMemo(() => {
    if (!unitsData?.report) return { labels: [], datasets: [] };
    return {
      labels: unitsData.report.map((p) => p.description),
      datasets: [{
        label: "Unidades",
        data: unitsData.report.map((p) => p.quantity),
        backgroundColor: unitsData.report.map((_, i) =>
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
  }, [unitsData]);

  const ranking = useMemo(() => {
    if (!salesData?.report || !unitsData?.report) return [];
    return salesData.report
      .map((p, i) => {
        const units = unitsData.report.find((u) => u.description === p.description);
        const qty = units?.quantity || 0;
        const pricePerUnit = qty > 0 ? (p.value / qty).toFixed(2) : 0;
        return {
          name: p.description,
          total: p.value,
          qty,
          pricePerUnit,
          color: schemeTableau10[i % schemeTableau10.length],
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // top 5
  }, [salesData, unitsData]);

  if (salesLoading || unitsLoading) return <div>Cargando...</div>;
  if (!unitsData?.report) return <div>Sin datos disponibles</div>;

  return (
    <MDBox>
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        pt={2}
      >
        <MDTypography variant="button" fontWeight="medium" textTransform="uppercase" color="text">
          {view === 'chart' ? 'Unidades por producto' : 'Top 5 por ingresos'}
        </MDTypography>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, val) => { if (val) setView(val); }}
          size="small"
        >
          <ToggleButton value="chart">
            <BarChartIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="ranking">
            <FormatListNumberedIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </MDBox>

      {view === 'chart' ? (
        <HorizontalBarChart
          description={`${unitsData.total} uds`}
          chart={chart}
          height="380px"
        />
      ) : (
        <MDBox
          px={2}
          pb={2}
          sx={{ height: '420px', overflowY: 'auto' }}
        >
          <MDTypography variant="h2" fontWeight="medium" mb={1}>
            {unitsData.total} uds
          </MDTypography>
          {ranking.map((p, i) => (
            <MDBox
              key={p.name}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              py={1.5}
              sx={{ borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}
            >
              <MDBox display="flex" alignItems="center" gap={1}>
                <MDTypography
                  variant="h5"
                  fontWeight="medium"
                  sx={{ color: "rgba(0,0,0,0.2)", width: "24px" }}
                >
                  {i + 1}
                </MDTypography>
                <MDBox
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "2px",
                    background: p.color,
                    flexShrink: 0,
                  }}
                />
                <MDBox>
                  <MDTypography variant="button" fontWeight="medium">
                    {p.name}
                  </MDTypography>
                  <MDTypography variant="caption" color="text" display="block">
                    {p.qty} uds · ${p.pricePerUnit}/u
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDTypography variant="button" fontWeight="medium">
                ${p.total.toFixed(0)}
              </MDTypography>
            </MDBox>
          ))}
        </MDBox>
      )}
    </MDBox>
  );
}

export default ProductsOverview;
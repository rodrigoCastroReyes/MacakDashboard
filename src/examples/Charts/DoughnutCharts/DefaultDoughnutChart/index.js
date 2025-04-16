/**
=========================================================
* Material Dashboard 2  React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com
=========================================================
*/

import { useMemo } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-chartjs-2 components
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// DefaultDoughnutChart configurations
import configs from "examples/Charts/DoughnutCharts/DefaultDoughnutChart/configs";

const centerTextPlugin = {
  id: "centerText",
  beforeDraw(chart) {
    if (!chart.config?.type || chart.config.type !== "doughnut") return;

    const pluginConfig = chart.config.options?.plugins?.centerText;

    if (
      !pluginConfig ||
      typeof pluginConfig !== "object" ||
      pluginConfig.enabled !== true ||
      typeof pluginConfig.sold !== "number" ||
      typeof pluginConfig.total !== "number" ||
      pluginConfig.total === 0
    ) {
      return;
    }

    const { sold, total, color = "#666", fontSize = 16 } = pluginConfig;
    const percentage = Math.round((sold / total) * 100);
    const text = `${percentage}%`;

    const { width, height, ctx } = chart;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillText(text, width / 2, height / 2);
    ctx.restore();
  },
};

ChartJS.register(ArcElement, Tooltip, Legend);

function DefaultDoughnutChart({ icon, title, description, height, chart }) {
  const { data, options } = configs(
    chart.labels || [],
    chart.datasets || {},
    chart.cutout
  );

  const renderChart = (
    <MDBox py={2} pr={2} pl={icon.component ? 1 : 2}>
      {title || description ? (
        <MDBox display="flex" px={description ? 1 : 0} pt={description ? 1 : 0}>
          {icon.component && (
            <MDBox
              width="4rem"
              height="4rem"
              bgColor={icon.color || "dark"}
              variant="gradient"
              coloredShadow={icon.color || "dark"}
              borderRadius="xl"
              display="flex"
              justifyContent="center"
              alignItems="center"
              color="white"
              mt={-5}
              mr={2}
            >
              <Icon fontSize="medium">{icon.component}</Icon>
            </MDBox>
          )}
          <MDBox mt={icon.component ? -2 : 0}>
            {title && <MDTypography variant="h6">{title}</MDTypography>}
            <MDBox mb={2}>
              <MDTypography component="div" variant="button" color="text">
                {description}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      ) : null}
      {useMemo(
        () => (
          <MDBox height={height}>
            <Doughnut
              data={data}
              options={options}
              plugins={[centerTextPlugin]}
              redraw
            />
          </MDBox>
        ),
        [chart, height]
      )}
    </MDBox>
  );

  return title || description ? (
    <Card sx={{ backgroundColor: "transparent", boxShadow: "none" }}>
      {renderChart}
    </Card>
  ) : (
    renderChart
  );
}

DefaultDoughnutChart.defaultProps = {
  icon: { color: "info", component: "" },
  title: "",
  description: "",
  height: "19.125rem",
};

DefaultDoughnutChart.propTypes = {
  icon: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "light",
      "dark",
    ]),
    component: PropTypes.node,
  }),
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chart: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.array, PropTypes.object])
  ).isRequired,
};

export default DefaultDoughnutChart;

/**
=========================================================
* Material Dashboard 2  React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/* eslint-disable no-dupe-keys */
// Material Dashboard 2 React base styles
import colors from "assets/theme/base/colors";
import { Chart as ChartJS } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ChartDataLabels)

const { gradients, dark } = colors;

function configs(labels, datasets) {
  const backgroundColors = [];

  if (datasets.backgroundColors) {
    datasets.backgroundColors.forEach((color) =>
      gradients[color]
        ? backgroundColors.push(gradients[color].state)
        : backgroundColors.push(dark.main)
    );
  } else {
    backgroundColors.push(dark.main);
  }

  return {
    data: {
      labels,
      datasets: [...datasets],
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: false
      },
      plugins: {
        legend: {
          labels: {
            color: "#7b809a",
            font: {
              size: 12,
              family: "montserrat-semibold",
              style: "normal",
            }
          }
        },
        datalabels: {
          formatter: (value,ctx) => {
            let datasets = ctx.chart.data.datasets;
            return value;
          },
          color: "#7b809a",
          font: {
            size: 14,
            family: "montserrat-semibold",
            style: "normal",
            lineHeight: 2,
          }
        }
      }
    },
  };
}

export default configs;

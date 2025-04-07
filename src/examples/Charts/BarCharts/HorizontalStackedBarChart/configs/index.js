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
// Material Dashboard 2 React base styles
import typography from "assets/theme/base/typography";

function configs(labels, datasets) {
  return {
    data: {
      labels,
      datasets: [...datasets],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          formatter: (value,ctx) => {
            let datasets = ctx.chart.data.datasets;
            return value;
          },
          color: "#344767",
          font: {
            size: 12,
            family: "montserrat-semibold",
            style: "normal",
            lineHeight: 2,
          }
        }
      },
      scales: {
        y: {
          stacked: true,
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
            color: "#c1c4ce5c",
          },
          ticks: {
            display: true,
            color: "#344767",
            padding: 10,
            font: {
              size: 14,
              family: "montserrat",
              style: "normal",
              lineHeight: 2,
            },
          },
        },
        x: {
          stacked: true,
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: true,
            drawTicks: true,
            color: "#c1c4ce5c",
          },
          ticks: {
            display: true,
            color: "#344767",
            padding: 20,
            font: {
              size: 14,
              family: "montserrat",
              style: "normal",
              lineHeight: 2,
            },
          },
        },
      },
    },
  };
}

export default configs;

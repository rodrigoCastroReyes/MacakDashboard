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

import "css/styles.css";

function configs(labels, datasets) {
  return {
    data: {
      labels,
      datasets: [...datasets],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          display: true,
          formatter: function (value) {
            return "$" + new Intl.NumberFormat("es-EC", {
              minimumFractionDigits: 0,
            }).format(value);
          },
          color: "black",
          anchor: "end",
          font: {
            size: 11,
            family: "montserrat-semibold",
            style: "normal",
            lineHeight: 2,
          },
          offset: -20,
          align: "start",
        },
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
          },
          ticks: {
            display: true,
            padding: 10,
            color: "#1c0d02",
            font: {
              size: 12,
              family: "montserrat",
              style: "normal",
              lineHeight: 2,
            },
          },
        },
        x: {
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: true,
            drawTicks: true,
          },
          ticks: {
            display: true,
            color: "#1c0d02",
            padding: 10,
            font: {
              size: 12,
              family: "poppins",
              style: "normal",
              lineHeight: 2,
            },
            //autoSkip: false,
            //maxRotation: 45,
            //minRotation: 45,
          },
        },
      },
    },
  };
}

export default configs;

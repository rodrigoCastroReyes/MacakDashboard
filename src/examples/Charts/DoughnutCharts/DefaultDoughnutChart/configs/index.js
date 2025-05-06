/**
=========================================================
* Material Dashboard 2  React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com
=========================================================
*/

/* eslint-disable no-dupe-keys */
// Material Dashboard 2 React base styles
import colors from "assets/theme/base/colors";

const { gradients, dark } = colors;

function configs(labels, datasets, cutout = 60) {
  const backgroundColors = [];

  if (datasets.backgroundColors) {
    datasets.backgroundColors.forEach((color) => {
      if (gradients[color]) {
        if (color === "info") {
          backgroundColors.push(gradients.info.main);
        } else {
          backgroundColors.push(gradients[color].state);
        }
      } else {
        backgroundColors.push(dark.main);
      }
    });
  } else {
    backgroundColors.push(dark.main);
  }

  const centerTextPluginOptions =
    datasets.centerText && datasets.centerText.enabled === true
      ? {
          centerText: {
            enabled: true,
            sold: datasets.centerText.sold,
            total: datasets.centerText.total,
            color: datasets.centerText.color || "#666",
            fontSize: datasets.centerText.fontSize || 16,
          },
        }
      : {};

  return {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: datasets.label,
          weight: 9,
          cutout,
          tension: 0.9,
          pointRadius: 2,
          borderWidth: 2,
          backgroundColor: backgroundColors,
          fill: false,
          data: datasets.data,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        ...centerTextPluginOptions,
      },
      animation: {
        duration: 2000,
        easing: "easeOutCirc",
        animateRotate: true,
        animateScale: true,
      }
        
      
    },
  };
}

export default configs;

import typography from "assets/theme/base/typography";
import { CHART_GRID, CHART_TICK } from "utils/chartColors";

/** Los nombres de producto largos desbordaban la franja del eje; se recortan. */
const truncate = (value, max = 22) =>
  typeof value === "string" && value.length > max ? `${value.slice(0, max - 1)}…` : value;

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
      // Espacio a la derecha para las etiquetas de valor, que van fuera de la barra.
      layout: { padding: { right: 56, left: 4, top: 4, bottom: 4 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#152c5b",
          titleFont: { family: typography.fontFamily, size: 12, weight: "600" },
          bodyFont: { family: typography.fontFamily, size: 12 },
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          // El eje recorta los nombres largos; el tooltip muestra el completo.
          callbacks: { title: (items) => items[0]?.label ?? "" },
        },
      },
      scales: {
        y: {
          // Sin rejilla: en barras horizontales las líneas por categoría son ruido.
          grid: { display: false, drawBorder: false, drawTicks: false },
          ticks: {
            display: true,
            // Antes #b2b9bf, con ~1.9 de contraste sobre blanco: ilegible.
            color: CHART_TICK,
            padding: 8,
            crossAlign: "far",
            font: { size: 11, family: typography.fontFamily, weight: "500" },
            callback(value) {
              return truncate(this.getLabelForValue(value));
            },
          },
        },
        x: {
          // Cada barra lleva su valor escrito al final, así que el eje sobra.
          display: false,
          grid: { display: false, drawBorder: false, color: CHART_GRID },
        },
      },
    },
  };
}

export default configs;

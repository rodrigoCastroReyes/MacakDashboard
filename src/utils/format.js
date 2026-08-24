// Ecuador usa USD y el formato "$121.598,43" (punto para miles, coma para decimales).
const LOCALE = "es-EC";

export const formatCurrency = (value) =>
  new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatNumber = (value) => new Intl.NumberFormat(LOCALE).format(Number(value) || 0);

// `toFixed(1)` devolvía "37.4%" con punto, chocando con el "$6.364,32" de al lado.
export const formatPercent = (value, digits = 1) =>
  `${new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value) || 0)}%`;

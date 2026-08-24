/**
 * Tokens de color para gráficos.
 *
 * Regla principal: los gráficos de este panel son de UNA sola serie (top de
 * productos, unidades por producto, ventas por hora…). En ese caso todas las
 * barras/puntos van del MISMO color: la longitud de la barra y la etiqueta del
 * eje ya identifican cada elemento, así que darle un color distinto a cada barra
 * gasta el canal de identidad sin aportar información.
 *
 * Antes se usaba `schemeTableau10[i % 10]`, que además de ser ajeno a la marca
 * ciclaba los colores: al filtrar, un producto podía cambiar de color.
 */

/** Serie única. Es el azul del wordmark de Macak. */
export const CHART_PRIMARY = "#0053D1";

/** Relleno translúcido del mismo hue, para áreas bajo la línea. */
export const CHART_PRIMARY_SOFT = "rgba(0, 83, 209, 0.12)";

/** Grises recesivos para rejilla, ejes y etiquetas. */
export const CHART_GRID = "rgba(21, 44, 91, 0.08)";
export const CHART_TICK = "#5a6a85";

/**
 * Paleta categórica, por si en el futuro hace falta comparar varias series a la
 * vez. Orden fijo: se asigna del slot 1 en adelante y NUNCA se cicla; una novena
 * serie se agrupa en "Otros", no genera un color nuevo.
 *
 * Validada con el validador de la guía de dataviz (modo claro, pares adyacentes):
 *   Banda de luminosidad  PASS — las 8 dentro de L 0.43–0.77
 *   Suelo de croma        PASS — todas >= 0.10
 *   Separación CVD        PASS — peor par adyacente ΔE 33.8 (protan)
 *   Contraste vs fondo    PASS — todas >= 3:1
 */
export const CHART_CATEGORICAL = [
  "#0053D1", // azul de marca
  "#0E8C60", // verde
  "#B87A00", // ámbar
  "#046A38", // verde oscuro
  "#4A3AA7", // índigo
  "#C62828", // rojo
  "#C9527F", // rosa
  "#C2500F", // naranja quemado
];

import moment from "moment";
// Bajo Vite hay que importar la build ESM del locale: "moment/locale/es" es
// CommonJS y acaba registrando el idioma en otra instancia de moment, así que
// los meses seguían saliendo en inglés ("4 de October").
import "moment/dist/locale/es";

/**
 * Momento con el locale español fijado en la propia instancia.
 *
 * No se usa `moment.locale("es")` porque es un ajuste global y cualquier otro
 * módulo puede pisarlo; aquí el idioma viaja con el objeto.
 */
export const esMoment = (value) => moment(value).locale("es");

/** "sábado, 4 de octubre 2025" → solo la primera letra en mayúscula. */
export const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/** Cabecera de agrupación por día: "Sábado, 4 de octubre 2025". */
export const formatDay = (value) =>
  capitalizeFirst(esMoment(value).format("dddd, D [de] MMMM YYYY"));

import PropTypes from "prop-types";

import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

/**
 * Mensaje único para los estados de carga, error y sin datos.
 *
 * Antes cada componente resolvía esto por su cuenta: unos con `MDTypography` y
 * otros con un `<div>Cargando...</div>` sin estilo, así que los textos se veían
 * distintos entre tarjetas de la misma pantalla.
 */
function StateMessage({ state = "loading", message, py = 4 }) {
  const defaults = {
    loading: "Cargando…",
    error: "No se pudieron obtener los datos",
    empty: "Sin datos disponibles",
  };

  return (
    <MDBox
      px={3}
      py={py}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={1.25}
      minHeight={80}
    >
      {state === "loading" && <CircularProgress size={16} color="info" />}
      <MDTypography
        variant="button"
        fontWeight="regular"
        color={state === "error" ? "error" : "text"}
        textAlign="center"
      >
        {message || defaults[state]}
      </MDTypography>
    </MDBox>
  );
}

StateMessage.propTypes = {
  state: PropTypes.oneOf(["loading", "error", "empty"]),
  message: PropTypes.string,
  py: PropTypes.number,
};

export default StateMessage;

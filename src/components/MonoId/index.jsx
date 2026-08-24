import { useState } from "react";
import PropTypes from "prop-types";

import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Pila monoespaciada del sistema: los identificadores se comparan carácter a
// carácter y con Poppins bailan. No se descarga ninguna fuente extra para esto.
export const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

/**
 * Identificador monoespaciado con botón de copiar.
 *
 * El botón se deja siempre visible (atenuado) en vez de aparecer al pasar el
 * ratón: en las revisiones anteriores los usuarios no descubrían las acciones
 * que solo salían en hover.
 */
function MonoId({
  value,
  truncate = false,
  color = "text",
  fontSize = "11.5px",
  fontWeight = "regular",
  maxWidth = 190,
}) {
  const [copied, setCopied] = useState(false);

  const copy = (e) => {
    // La fila navega al detalle; copiar no debe sacar al usuario de la lista.
    e.stopPropagation();
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <MDBox display="flex" alignItems="center" gap={0.5} minWidth={0}>
      <MDTypography
        variant="caption"
        color={color}
        fontWeight={fontWeight}
        title={value}
        sx={{
          fontFamily: MONO,
          fontSize,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: truncate ? maxWidth : "none",
        }}
      >
        {value}
      </MDTypography>

      {copied ? (
        <MDTypography
          variant="caption"
          color="success"
          fontWeight="semiBold"
          sx={{ whiteSpace: "nowrap" }}
        >
          copiado ✓
        </MDTypography>
      ) : (
        <Tooltip title="Copiar">
          <IconButton
            size="small"
            onClick={copy}
            sx={{
              p: 0.25,
              color: "text.main",
              opacity: 0.5,
              "&:hover": { opacity: 1, color: "info.main" },
            }}
          >
            <Icon sx={{ fontSize: "14px !important" }}>content_copy</Icon>
          </IconButton>
        </Tooltip>
      )}
    </MDBox>
  );
}

MonoId.propTypes = {
  value: PropTypes.string.isRequired,
  truncate: PropTypes.bool,
  color: PropTypes.string,
  fontSize: PropTypes.string,
  fontWeight: PropTypes.string,
  maxWidth: PropTypes.number,
};

export default MonoId;

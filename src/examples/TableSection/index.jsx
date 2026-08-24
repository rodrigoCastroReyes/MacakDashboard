import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { formatNumber } from "utils/format";

/**
 * Contenedor estándar de las secciones de listado (Tokens, Administradores,
 * Anulaciones, Reembolsos…).
 *
 * Antes cada pantalla repetía su propia cabecera con márgenes sueltos
 * (`margin: "1rem 1rem 2rem 1rem"` + padding del título), lo que dejaba un hueco
 * enorme entre el título y la tabla. Aquí el espaciado está definido en un solo
 * sitio: cabecera compacta, separador, y la tabla pegada debajo.
 */
function TableSection({ title, count, countLabel, search, actions, children }) {
  const hasCount = typeof count === "number";
  const [singular, plural] = countLabel;

  return (
    <Card
      // El borde y la ausencia de sombra vienen del tema; aquí solo el recorte,
      // para que el separador y las filas respeten las esquinas redondeadas.
      sx={{ overflow: "hidden" }}
    >
      <MDBox
        px={3}
        py={2.5}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
      >
        <MDBox display="flex" alignItems="baseline" gap={1}>
          <MDTypography variant="h6" fontWeight="semiBold" color="dark">
            {title}
          </MDTypography>
          {hasCount && (
            <MDTypography variant="button" color="text">
              · {formatNumber(count)} {count === 1 ? singular : plural}
            </MDTypography>
          )}
        </MDBox>

        <MDBox display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          {search && (
            <TextField
              size="small"
              placeholder={search.placeholder}
              value={search.value}
              onChange={search.onChange}
              sx={{ width: { xs: "100%", sm: 260 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon fontSize="small" sx={{ color: "text.main", opacity: 0.6 }}>
                      search
                    </Icon>
                  </InputAdornment>
                ),
              }}
            />
          )}
          {actions}
        </MDBox>
      </MDBox>

      <Divider sx={{ m: 0 }} />

      {children}
    </Card>
  );
}

TableSection.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  countLabel: PropTypes.arrayOf(PropTypes.string),
  search: PropTypes.shape({
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
  }),
  actions: PropTypes.node,
  children: PropTypes.node,
};

export default TableSection;

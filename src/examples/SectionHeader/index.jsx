import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

/**
 * Rótulo de sección: texto pequeño en mayúsculas, fuera de las tarjetas.
 * Da jerarquía sin gastar el peso visual de un título dentro de cada tarjeta.
 * Admite acciones a la derecha (por ejemplo un botón "Actualizar").
 */
function SectionHeader({ title, children, ...rest }) {
  return (
    <MDBox
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      mb={1.5}
      {...rest}
    >
      <MDTypography
        variant="caption"
        fontWeight="semiBold"
        color="text"
        textTransform="uppercase"
        sx={{ letterSpacing: "0.08em" }}
      >
        {title}
      </MDTypography>
      {children}
    </MDBox>
  );
}

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default SectionHeader;

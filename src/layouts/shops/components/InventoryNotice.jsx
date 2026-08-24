import PropTypes from "prop-types";

import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { formatNumber } from "utils/format";

/**
 * Aviso sobre el estado del inventario.
 *
 * El mockup encendía una alerta ámbar cuando había productos sin existencias.
 * Con los datos reales eso se dispararía en las 43 tiendas del evento, porque 42
 * no tienen ninguna entrada de inventario: no es que estén agotadas, es que no
 * llevan control de stock. Así que solo se alarma cuando hay agotados de verdad;
 * la falta de inventario se cuenta como información, en gris.
 */
function InventoryNotice({ summary }) {
  if (summary.total === 0) return null;

  if (!summary.tracked) {
    return (
      <MDBox
        display="flex"
        alignItems="center"
        gap={1.25}
        px={2}
        py={1.25}
        mb={2}
        sx={({ palette, borders }) => ({
          backgroundColor: palette.grey[100],
          border: `1px solid ${palette.grey[300]}`,
          borderRadius: borders.borderRadius.lg,
        })}
      >
        <Icon sx={{ fontSize: "18px !important", color: "text.main", opacity: 0.7 }}>
          inventory_2
        </Icon>
        <MDTypography variant="button" fontWeight="regular" color="text">
          Esta tienda no lleva control de inventario. Asigna existencias a un producto para
          empezar a seguirlas.
        </MDTypography>
      </MDBox>
    );
  }

  if (!summary.out && !summary.low) return null;

  const parts = [];
  if (summary.out) {
    parts.push(
      `${formatNumber(summary.out)} ${summary.out === 1 ? "producto agotado" : "productos agotados"}`
    );
  }
  if (summary.low) {
    parts.push(
      `${formatNumber(summary.low)} con existencias bajas`
    );
  }

  return (
    <MDBox
      display="flex"
      alignItems="center"
      gap={1.25}
      px={2}
      py={1.25}
      mb={2}
      sx={({ palette, borders }) => ({
        backgroundColor: palette.badgeColors.warning.background,
        border: `1px solid ${palette.warning.main}`,
        borderRadius: borders.borderRadius.lg,
      })}
    >
      <Icon sx={{ fontSize: "18px !important", color: "warning.main" }}>warning_amber</Icon>
      <MDTypography variant="button" fontWeight="regular" sx={{ color: "warning.focus" }}>
        {parts.join(" · ")}. Repón las existencias para poder venderlos.
      </MDTypography>
    </MDBox>
  );
}

InventoryNotice.propTypes = {
  summary: PropTypes.object.isRequired,
};

export default InventoryNotice;

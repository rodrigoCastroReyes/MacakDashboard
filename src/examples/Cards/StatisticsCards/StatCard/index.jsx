import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

/**
 * Tarjeta de métrica: etiqueta arriba, cifra grande y pie opcional.
 * El icono es opcional y el pie admite un nodo (por ejemplo, una píldora).
 */
function StatCard({ icon, label, value, caption, color = "info", valueColor = "dark", valueVariant = "h3" }) {
  return (
    <Card sx={{ height: "100%" }}>
      <MDBox p={2.5}>
        <MDBox display="flex" alignItems="center" gap={1} mb={1.25}>
          {icon && (
            <Icon fontSize="small" sx={{ color: `${color}.main` }}>
              {icon}
            </Icon>
          )}
          <MDTypography
            variant="caption"
            fontWeight="semiBold"
            color="text"
            textTransform="uppercase"
            sx={{ letterSpacing: "0.07em" }}
          >
            {label}
          </MDTypography>
        </MDBox>

        <MDTypography
          variant={valueVariant}
          fontWeight="bold"
          color={valueColor}
          // `break-word` partía importes como "$70.894,25" en dos líneas dentro de
          // una fila de 5 KPIs; con overflowWrap solo se parte donde hay espacios.
          sx={{ lineHeight: 1.15, letterSpacing: "-0.02em", overflowWrap: "break-word" }}
        >
          {value}
        </MDTypography>

        {caption && (
          <MDBox mt={1}>
            {typeof caption === "string" ? (
              <MDTypography variant="caption" color="text">
                {caption}
              </MDTypography>
            ) : (
              caption
            )}
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

StatCard.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  caption: PropTypes.node,
  color: PropTypes.string,
  valueColor: PropTypes.string,
  valueVariant: PropTypes.string,
};

export default StatCard;

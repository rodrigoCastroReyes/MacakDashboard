import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

/**
 * La API no devuelve el rol del usuario, así que se deduce del nombre
 * (`cah_cash_*`, `cah_help_*`, `*_admin`). Si algún día llega un campo `role`,
 * basta con pasarlo por props y borrar `roleFromUsername`.
 */
export function roleFromUsername(username = "") {
  const u = username.toLowerCase();
  if (u.includes("admin")) return "admin";
  if (u.includes("help") || u.includes("soporte")) return "support";
  return "cashier";
}

const LABELS = { cashier: "Cajero", admin: "Admin", support: "Soporte" };
const TONES = { cashier: "info", admin: "error", support: "primary" };

function CashierRoleTag({ role }) {
  return (
    <MDBox
      px={0.875}
      py={0.125}
      sx={({ palette, borders }) => ({
        backgroundColor: palette.badgeColors[TONES[role]].background,
        color: palette.badgeColors[TONES[role]].text,
        borderRadius: borders.borderRadius.md,
        display: "inline-flex",
        alignItems: "center",
      })}
    >
      <MDTypography
        variant="caption"
        fontWeight="semiBold"
        color="inherit"
        textTransform="uppercase"
        sx={{ fontSize: "10px", letterSpacing: "0.03em", lineHeight: 1.6 }}
      >
        {LABELS[role]}
      </MDTypography>
    </MDBox>
  );
}

CashierRoleTag.propTypes = {
  role: PropTypes.oneOf(["cashier", "admin", "support"]).isRequired,
};

export default CashierRoleTag;

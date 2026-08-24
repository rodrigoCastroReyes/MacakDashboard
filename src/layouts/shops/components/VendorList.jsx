import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import StateMessage from "examples/StateMessage";

import { esMoment } from "utils/datetime";
import { formatNumber } from "utils/format";

const initialsOf = (name) => String(name || "").replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase();

/**
 * Vendedores asignados a la tienda, en filas compactas.
 *
 * Antes cada vendedor ocupaba una tarjeta de un tercio de ancho con un PNG de
 * 60 px y el texto centrado, así que un único vendedor dejaba dos huecos vacíos.
 */
function VendorList({ vendors, onAdd }) {
  return (
    <Card sx={{ mb: 2, overflow: "hidden" }}>
      <MDBox
        px={3}
        py={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
      >
        <MDBox display="flex" alignItems="baseline" gap={1}>
          <MDTypography variant="h6" fontWeight="semiBold" color="dark">
            Vendedores asignados
          </MDTypography>
          <MDTypography variant="button" color="text">
            · {formatNumber(vendors.length)}
          </MDTypography>
        </MDBox>
        <MDButton
          variant="outlined"
          color="info"
          size="small"
          onClick={onAdd}
          startIcon={<Icon>person_add</Icon>}
        >
          Asignar vendedor
        </MDButton>
      </MDBox>

      <Divider sx={{ m: 0 }} />

      {vendors.length === 0 ? (
        <StateMessage state="empty" message="No hay vendedores asignados a esta tienda" />
      ) : (
        vendors.map((vendor, i) => (
          <MDBox
            key={vendor._id}
            display="flex"
            alignItems="center"
            gap={1.5}
            px={3}
            py={1.75}
            sx={({ palette }) => ({
              borderTop: i === 0 ? "none" : `1px solid ${palette.grey[200]}`,
            })}
          >
            <MDBox
              display="grid"
              sx={({ palette, borders }) => ({
                width: 40,
                height: 40,
                flexShrink: 0,
                placeItems: "center",
                borderRadius: borders.borderRadius.lg,
                backgroundColor: palette.badgeColors.info.background,
                color: palette.badgeColors.info.text,
              })}
            >
              <MDTypography variant="button" fontWeight="bold" color="inherit">
                {initialsOf(vendor.username)}
              </MDTypography>
            </MDBox>

            <MDBox minWidth={0} flex={1}>
              <MDTypography variant="button" fontWeight="semiBold" color="dark" display="block">
                {vendor.username}
              </MDTypography>
              <MDTypography
                variant="caption"
                color="text"
                sx={{ overflowWrap: "anywhere" }}
              >
                {vendor.email} · registrado{" "}
                {esMoment(vendor.__createdtime__).format("DD/MM/YYYY")}
              </MDTypography>
            </MDBox>
          </MDBox>
        ))
      )}
    </Card>
  );
}

VendorList.propTypes = {
  vendors: PropTypes.array.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default VendorList;

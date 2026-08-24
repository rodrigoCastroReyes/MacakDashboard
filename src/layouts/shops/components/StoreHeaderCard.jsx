import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import { esMoment } from "utils/datetime";
import { formatNumber } from "utils/format";

/** Métrica compacta dentro de la cabecera. */
function Metric({ label, value, color = "dark" }) {
  return (
    <MDBox
      px={1.75}
      py={1.5}
      sx={({ palette, borders }) => ({
        backgroundColor: palette.grey[100],
        borderRadius: borders.borderRadius.lg,
      })}
    >
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {label}
      </MDTypography>
      <MDTypography variant="h4" fontWeight="bold" color={color} sx={{ mt: 0.25, lineHeight: 1.2 }}>
        {value}
      </MDTypography>
    </MDBox>
  );
}

Metric.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
};

/**
 * Cabecera del panel de tienda: identidad, acciones y existencias de un vistazo.
 *
 * Antes el icono de la tienda ocupaba una tarjeta entera de tres columnas sin
 * decir nada, y los datos eran cuatro líneas de texto suelto.
 */
function StoreHeaderCard({ store, vendorCount, summary, onEdit, onDelete, onRefresh, refreshing }) {
  return (
    <Card sx={{ mb: 2 }}>
      <MDBox p={2.5}>
        <MDBox
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={2}
          flexWrap="wrap"
        >
          <MDBox display="flex" alignItems="center" gap={1.75} minWidth={0}>
            <MDBox
              display="grid"
              sx={({ palette, borders }) => ({
                width: 56,
                height: 56,
                flexShrink: 0,
                placeItems: "center",
                borderRadius: borders.borderRadius.lg,
                backgroundColor: palette.badgeColors.info.background,
                color: palette.badgeColors.info.text,
              })}
            >
              <Icon fontSize="medium">storefront</Icon>
            </MDBox>
            <MDBox minWidth={0}>
              <MDTypography variant="h4" fontWeight="semiBold" color="dark" sx={{ lineHeight: 1.2 }}>
                {store.name}
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={0.75} mt={0.5} flexWrap="wrap">
                <Icon sx={{ fontSize: "15px !important", color: "text.main", opacity: 0.7 }}>
                  event
                </Icon>
                <MDTypography variant="caption" color="text">
                  Registrada {esMoment(store.__createdtime__).format("DD/MM/YYYY")} ·{" "}
                  {formatNumber(vendorCount)}{" "}
                  {vendorCount === 1 ? "vendedor asignado" : "vendedores asignados"}
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>

          <MDBox display="flex" alignItems="center" gap={1}>
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              onClick={onEdit}
              startIcon={<Icon>edit</Icon>}
            >
              Editar
            </MDButton>
            <MDButton
              variant="outlined"
              color="secondary"
              size="small"
              onClick={onRefresh}
              disabled={refreshing}
              startIcon={<Icon>refresh</Icon>}
            >
              {refreshing ? "Actualizando…" : "Actualizar"}
            </MDButton>
            <Tooltip title="Eliminar tienda">
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{ color: "error.main", "&:hover": { backgroundColor: "error.light" } }}
              >
                <Icon fontSize="small">delete</Icon>
              </IconButton>
            </Tooltip>
          </MDBox>
        </MDBox>

        <MDBox
          display="grid"
          gap={1.5}
          mt={2.5}
          sx={{ gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" } }}
        >
          <Metric label="En catálogo" value={formatNumber(summary.total)} />
          {summary.tracked ? (
            <>
              <Metric label="Con stock" value={formatNumber(summary.inStock)} color="success" />
              <Metric
                label="Agotados"
                value={formatNumber(summary.out)}
                color={summary.out ? "error" : "dark"}
              />
            </>
          ) : (
            <>
              <Metric label="Vendedores" value={formatNumber(vendorCount)} />
              <Metric label="Sin registrar" value={formatNumber(summary.untracked)} />
            </>
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
}

StoreHeaderCard.propTypes = {
  store: PropTypes.object.isRequired,
  vendorCount: PropTypes.number.isRequired,
  summary: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  refreshing: PropTypes.bool,
};

export default StoreHeaderCard;

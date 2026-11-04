import { useState } from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import SegmentedToggle from "layouts/summary/components/SegmentedToggle";
import { CHART_PRIMARY } from "utils/chartColors";
import { formatCurrency, formatNumber } from "utils/format";

const ORDERS = [
  { value: "quantity", label: "Unidades" },
  { value: "value", label: "Ingresos" },
];

/**
 * Top 10 de productos de todas las tiendas. Barras en HTML y no en canvas para
 * poder mostrar el producto en texto normal y su tienda debajo, en gris.
 *
 * En pantallas anchas la tarjeta toma el alto de su fila (el del gráfico por
 * hora, que va al lado) y la lista se desplaza dentro; en pantallas angostas,
 * apiladas, la lista tiene un alto máximo propio.
 */
function TopProducts({ byQuantity, byValue }) {
  const [orderBy, setOrderBy] = useState("quantity");
  const rows = orderBy === "quantity" ? byQuantity : byValue;
  const max = rows.reduce((acc, p) => Math.max(acc, p[orderBy]), 0);
  const format = orderBy === "quantity" ? formatNumber : formatCurrency;

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        // Fuera del flujo en lg: así no aporta alto a la fila y no estira al gráfico.
        position: { lg: "absolute" },
        inset: { lg: 0 },
      }}
    >
      <MDBox p={3} display="flex" flexDirection="column" flex={1} minHeight={0}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
          <MDBox minWidth={0}>
            <MDTypography variant="h6" color="dark">
              Top {rows.length} productos
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {orderBy === "quantity" ? "Por unidades vendidas" : "Por ingresos"}
            </MDTypography>
          </MDBox>
          <SegmentedToggle
            value={orderBy}
            onChange={setOrderBy}
            options={ORDERS}
            label="Ordenar productos por"
          />
        </MDBox>

        <MDBox
          flex={1}
          minHeight={0}
          mx={-1}
          px={1}
          sx={({ palette }) => ({
            overflowY: "auto",
            maxHeight: { xs: 420, lg: "none" },
            borderTop: `1px solid ${palette.grey[200]}`,
            borderBottom: `1px solid ${palette.grey[200]}`,
          })}
        >
          {rows.map((p, index) => (
            <MDBox
              key={`${p.product_id}-${p.store_id}`}
              display="grid"
              alignItems="center"
              columnGap={1.5}
              py={1}
              sx={({ palette }) => ({
                gridTemplateColumns: "20px minmax(0, 0.9fr) minmax(0, 1fr) auto",
                borderBottom: index === rows.length - 1 ? "none" : `1px solid ${palette.grey[200]}`,
              })}
              title={`${formatNumber(p.quantity)} unidades · ${formatCurrency(p.value)}`}
            >
              <MDTypography
                variant="caption"
                color="text"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {index + 1}
              </MDTypography>
              <MDBox minWidth={0}>
                <MDTypography
                  variant="button"
                  color="dark"
                  display="block"
                  sx={{
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.description || "Producto eliminado"}
                </MDTypography>
                <MDTypography
                  variant="caption"
                  color="text"
                  display="block"
                  sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {p.store_name}
                </MDTypography>
              </MDBox>
              <MDBox
                height="10px"
                sx={({ palette, borders }) => ({
                  backgroundColor: palette.grey[100],
                  borderRadius: borders.borderRadius.sm,
                  overflow: "hidden",
                })}
              >
                <MDBox
                  height="100%"
                  sx={({ borders }) => ({
                    width: `${max ? (p[orderBy] / max) * 100 : 0}%`,
                    backgroundColor: CHART_PRIMARY,
                    borderRadius: borders.borderRadius.sm,
                  })}
                />
              </MDBox>
              <MDTypography
                variant="button"
                fontWeight="bold"
                color="dark"
                sx={{ textAlign: "right", fontVariantNumeric: "tabular-nums", minWidth: 64 }}
              >
                {format(p[orderBy])}
              </MDTypography>
            </MDBox>
          ))}
        </MDBox>

        <MDTypography variant="caption" color="text" display="block" mt={1.5}>
          Cada fila es un producto en una tienda: si se vende en varias tiendas, aparece una vez por
          cada una.
        </MDTypography>
      </MDBox>
    </Card>
  );
}

const productShape = PropTypes.shape({
  product_id: PropTypes.string,
  description: PropTypes.string,
  store_id: PropTypes.string,
  store_name: PropTypes.string,
  quantity: PropTypes.number,
  value: PropTypes.number,
});

TopProducts.propTypes = {
  byQuantity: PropTypes.arrayOf(productShape).isRequired,
  byValue: PropTypes.arrayOf(productShape).isRequired,
};

export default TopProducts;

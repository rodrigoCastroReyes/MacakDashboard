import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import StateMessage from "examples/StateMessage";
import SectionHeader from "examples/SectionHeader";
import StatCard from "examples/Cards/StatisticsCards/StatCard";

import useAxios from "hooks/useAxios";
import { formatCurrency, formatNumber, formatPercent } from "utils/format";
import { API_BASE_URL } from "config";

const VENDOR_GRID = "minmax(0, 2fr) 0.8fr 0.8fr 1fr 0.8fr";
const PRODUCT_GRID = "minmax(0, 2fr) 0.8fr 1fr";

const numberSx = { textAlign: "right", fontVariantNumeric: "tabular-nums" };

/** Fila de cabecera o de datos de una tabla hecha con grid. */
function GridRow({ columns, children, header = false, total = false }) {
  return (
    <MDBox
      display="grid"
      gap={2}
      alignItems="center"
      px={3}
      py={header ? 1.25 : 1.5}
      sx={({ palette }) => ({
        gridTemplateColumns: columns,
        borderBottom: total ? "none" : `1px solid ${palette.grey[200]}`,
        borderTop: total ? `2px solid ${palette.grey[300]}` : "none",
        backgroundColor: total ? palette.grey[100] : "transparent",
      })}
    >
      {children}
    </MDBox>
  );
}

GridRow.propTypes = {
  columns: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  header: PropTypes.bool,
  total: PropTypes.bool,
};

function HeaderCell({ children, right = false }) {
  return (
    <MDTypography
      variant="caption"
      fontWeight="semiBold"
      color="text"
      textTransform="uppercase"
      sx={{ letterSpacing: "0.04em", fontSize: "11px", ...(right ? { textAlign: "right" } : {}) }}
    >
      {children}
    </MDTypography>
  );
}

HeaderCell.propTypes = {
  children: PropTypes.node.isRequired,
  right: PropTypes.bool,
};

function Cell({ children, right = false, bold = false }) {
  return (
    <MDTypography
      variant="caption"
      fontWeight={bold ? "bold" : "regular"}
      color="dark"
      sx={right ? numberSx : { overflow: "hidden", textOverflow: "ellipsis" }}
    >
      {children}
    </MDTypography>
  );
}

Cell.propTypes = {
  children: PropTypes.node,
  right: PropTypes.bool,
  bold: PropTypes.bool,
};

const vendorName = (vendor) => vendor.username || "Vendedor sin nombre";

/**
 * Ventas de la tienda por vendedor: comparación entre vendedores y, debajo, el
 * detalle de productos de cada uno. La suma de los vendedores es el total de la
 * tienda (mismas órdenes que el resto del resumen: exitosas y no anuladas).
 */
function SalesByVendor({ id_store, refreshToken = 0 }) {
  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/sales_by_vendor?store_id=${id_store}`
  );

  // El botón "Actualizar" de la cabecera incrementa refreshToken; refetch ignora
  // la caché de 10 minutos y trae datos frescos.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    refetch();
  }, [refreshToken, refetch]);

  if (loading && !data) {
    return <StateMessage state="loading" message="Cargando ventas por vendedor…" />;
  }

  if (error && !data) {
    return <StateMessage state="error" />;
  }

  const vendors = data?.vendors || [];

  if (vendors.length === 0) {
    return (
      <MDBox py={2}>
        <MDTypography variant="button" color="text">
          Sin ventas registradas en esta tienda
        </MDTypography>
      </MDBox>
    );
  }

  const share = (value) => (data.total ? (value / data.total) * 100 : 0);

  return (
    <>
      <div id="section-vendors-summary">
        <SectionHeader title="Resumen por vendedor" />
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total de la tienda" value={formatCurrency(data.total)} valueColor="info" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Vendedores" value={formatNumber(vendors.length)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Órdenes" value={formatNumber(data.orders)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Items vendidos" value={formatNumber(data.items)} />
          </Grid>
        </Grid>

        <Card>
          <GridRow columns={VENDOR_GRID} header>
            <HeaderCell>Vendedor</HeaderCell>
            <HeaderCell right>Órdenes</HeaderCell>
            <HeaderCell right>Items</HeaderCell>
            <HeaderCell right>Ventas</HeaderCell>
            <HeaderCell right>% tienda</HeaderCell>
          </GridRow>
          {vendors.map((vendor) => (
            <GridRow key={vendor.user_id} columns={VENDOR_GRID}>
              <Cell bold>{vendorName(vendor)}</Cell>
              <Cell right>{formatNumber(vendor.orders)}</Cell>
              <Cell right>{formatNumber(vendor.items)}</Cell>
              <Cell right bold>{formatCurrency(vendor.total)}</Cell>
              <Cell right>{formatPercent(share(vendor.total))}</Cell>
            </GridRow>
          ))}
          <GridRow columns={VENDOR_GRID} total>
            <Cell bold>Total tienda</Cell>
            <Cell right bold>{formatNumber(data.orders)}</Cell>
            <Cell right bold>{formatNumber(data.items)}</Cell>
            <Cell right bold>{formatCurrency(data.total)}</Cell>
            <Cell right bold>{formatPercent(100)}</Cell>
          </GridRow>
        </Card>
      </div>

      {/* Una sección por vendedor: así el PDF puede cortar página entre ellos. */}
      {vendors.map((vendor, index) => (
        <div key={vendor.user_id} id={`section-vendor-${index}`}>
          <SectionHeader title={`Productos vendidos · ${vendorName(vendor)}`} mt={4} />
          <Card>
            <GridRow columns={PRODUCT_GRID} header>
              <HeaderCell>Producto</HeaderCell>
              <HeaderCell right>Items</HeaderCell>
              <HeaderCell right>Ventas</HeaderCell>
            </GridRow>
            {vendor.products.map((product) => (
              <GridRow key={product.product_id} columns={PRODUCT_GRID}>
                {/* Un producto borrado después de vender sigue contando en el dinero. */}
                <Cell>{product.description || "Producto eliminado"}</Cell>
                <Cell right>{formatNumber(product.quantity)}</Cell>
                <Cell right>{formatCurrency(product.value)}</Cell>
              </GridRow>
            ))}
            <GridRow columns={PRODUCT_GRID} total>
              <Cell bold>Total {vendorName(vendor)}</Cell>
              <Cell right bold>{formatNumber(vendor.items)}</Cell>
              <Cell right bold>{formatCurrency(vendor.total)}</Cell>
            </GridRow>
          </Card>
        </div>
      ))}
    </>
  );
}

SalesByVendor.propTypes = {
  id_store: PropTypes.string.isRequired,
  refreshToken: PropTypes.number,
};

export default SalesByVendor;

import { useState } from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import StateMessage from "examples/StateMessage";

import { formatCurrency, formatNumber } from "utils/format";

import { STOCK_STATES, stockStateOf } from "./stock";

const GRID = "52px minmax(170px, 2fr) minmax(130px, 1fr) minmax(170px, 1.2fr) 92px";

/** Miniatura con reserva: varias imágenes son enlaces externos que ya no cargan. */
function ProductThumb({ src, alt }) {
  const [broken, setBroken] = useState(false);

  return (
    <MDBox
      display="grid"
      sx={({ palette, borders }) => ({
        width: 44,
        height: 44,
        placeItems: "center",
        overflow: "hidden",
        borderRadius: borders.borderRadius.md,
        backgroundColor: palette.grey[100],
        color: palette.text.main,
      })}
    >
      {src && !broken ? (
        <MDBox
          component="img"
          src={src}
          alt={alt}
          onError={() => setBroken(true)}
          sx={{ width: 44, height: 44, objectFit: "cover" }}
        />
      ) : (
        <Icon sx={{ opacity: 0.45 }}>image_not_supported</Icon>
      )}
    </MDBox>
  );
}

ProductThumb.propTypes = { src: PropTypes.string, alt: PropTypes.string };

/** Distintivo de existencias, con el color según el estado. */
function StockChip({ state, quantity }) {
  const info = STOCK_STATES[state];
  const label = state === "ok" || state === "low" ? `${info.label} · ${formatNumber(quantity)}` : info.label;

  return (
    <MDBox
      display="inline-flex"
      alignItems="center"
      gap={0.5}
      px={1}
      py={0.25}
      sx={({ palette, borders }) => ({
        borderRadius: borders.borderRadius.xl,
        backgroundColor:
          state === "untracked" ? palette.grey[200] : palette.badgeColors[info.color].background,
        color: state === "untracked" ? palette.text.main : palette.badgeColors[info.color].text,
      })}
    >
      <Icon sx={{ fontSize: "14px !important" }}>{info.icon}</Icon>
      <MDTypography variant="caption" fontWeight="semiBold" color="inherit">
        {label}
      </MDTypography>
    </MDBox>
  );
}

StockChip.propTypes = { state: PropTypes.string.isRequired, quantity: PropTypes.number };

/**
 * Catálogo de la tienda con precio y existencias editables en línea.
 *
 * Sustituye al DataTable genérico, que centraba todas las columnas y mostraba el
 * stock como un número suelto sin distinguir "sin registrar" de "agotado".
 */
function ProductTable({
  products,
  inventory,
  loading,
  hideUntracked,
  onToggleHideUntracked,
  discountEdit,
  stockEdit,
  onAdd,
  onEditProduct,
  onDeleteProduct,
}) {
  const visible = hideUntracked
    ? products.filter((p) => stockStateOf(inventory[p._id]) !== "untracked")
    : products;

  return (
    <Card sx={{ overflow: "hidden" }}>
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
            Lista de productos
          </MDTypography>
          <MDTypography variant="button" color="text">
            · {formatNumber(products.length)}{" "}
            {products.length === 1 ? "producto" : "productos"}
          </MDTypography>
        </MDBox>

        <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <MDButton
            variant="outlined"
            color="secondary"
            size="small"
            onClick={onToggleHideUntracked}
            startIcon={<Icon>{hideUntracked ? "visibility" : "visibility_off"}</Icon>}
          >
            {hideUntracked ? "Mostrar todos" : "Ocultar sin registrar"}
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            size="small"
            onClick={onAdd}
            startIcon={<Icon>add</Icon>}
          >
            Agregar
          </MDButton>
        </MDBox>
      </MDBox>

      <Divider sx={{ m: 0 }} />

      {loading ? (
        <StateMessage state="loading" message="Cargando productos…" />
      ) : visible.length === 0 ? (
        <StateMessage
          state="empty"
          message={
            products.length === 0
              ? "Esta tienda todavía no tiene productos"
              : "Ningún producto tiene existencias registradas"
          }
        />
      ) : (
        <MDBox sx={{ overflowX: "auto" }}>
          <MDBox sx={{ minWidth: 720 }}>
            <MDBox
              display="grid"
              gap={2}
              alignItems="center"
              px={3}
              py={1.5}
              sx={({ palette }) => ({
                gridTemplateColumns: GRID,
                borderBottom: `1px solid ${palette.grey[200]}`,
              })}
            >
              {["", "Producto", "Precio", "Stock", "Acciones"].map((label, i) => (
                <MDTypography
                  key={label || `col-${i}`}
                  variant="caption"
                  fontWeight="semiBold"
                  color="text"
                  textTransform="uppercase"
                  sx={{
                    letterSpacing: "0.04em",
                    fontSize: "11px",
                    textAlign: i === 4 ? "right" : "left",
                  }}
                >
                  {label}
                </MDTypography>
              ))}
            </MDBox>

            {visible.map((product) => {
              const index = products.indexOf(product);
              const quantity = inventory[product._id];
              const state = stockStateOf(quantity);
              const discounted =
                product.discount > 0 && product.originalPrice !== product.price;

              return (
                <MDBox
                  key={product._id}
                  display="grid"
                  gap={2}
                  alignItems="center"
                  px={3}
                  py={1.25}
                  sx={({ palette }) => ({
                    gridTemplateColumns: GRID,
                    borderBottom: `1px solid ${palette.grey[200]}`,
                    "&:hover": { backgroundColor: palette.grey[100] },
                  })}
                >
                  <ProductThumb src={product.img} alt={product.description} />

                  <MDTypography variant="button" fontWeight="medium" color="dark">
                    {product.description}
                  </MDTypography>

                  {/* Precio, con edición de descuento en línea */}
                  <MDBox display="flex" alignItems="center" gap={0.5} minWidth={0}>
                    {discountEdit.index === index ? (
                      <>
                        <TextField
                          type="number"
                          size="small"
                          label="% desc."
                          value={product.discount || 0}
                          onChange={(e) => discountEdit.onChange(index, e.target.value)}
                          sx={{ width: 92 }}
                          inputProps={{ min: 0, max: 100 }}
                          autoFocus
                        />
                        <Tooltip title="Aplicar descuento">
                          <IconButton size="small" onClick={() => discountEdit.onApply(index)}>
                            <Icon fontSize="small" sx={{ color: "success.main" }}>
                              check
                            </Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton size="small" onClick={discountEdit.onCancel}>
                            <Icon fontSize="small">close</Icon>
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        {discounted && (
                          <MDTypography
                            variant="caption"
                            color="text"
                            sx={{ textDecoration: "line-through", opacity: 0.6 }}
                          >
                            {formatCurrency(product.originalPrice)}
                          </MDTypography>
                        )}
                        <MDTypography variant="button" fontWeight="semiBold" color="success">
                          {formatCurrency(product.price)}
                        </MDTypography>
                        <Tooltip title={discounted ? "Editar descuento" : "Aplicar descuento"}>
                          <IconButton
                            size="small"
                            onClick={() => discountEdit.onStart(index, product.discount || 0)}
                            sx={{ color: "text.main", opacity: 0.5, "&:hover": { opacity: 1 } }}
                          >
                            <Icon sx={{ fontSize: "16px !important" }}>percent</Icon>
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </MDBox>

                  {/* Stock, con edición en línea */}
                  <MDBox display="flex" alignItems="center" gap={0.5} minWidth={0}>
                    {stockEdit.index === index ? (
                      <>
                        <TextField
                          type="number"
                          size="small"
                          label="Unidades"
                          value={stockEdit.value}
                          onChange={(e) => stockEdit.onChange(e.target.value)}
                          sx={{ width: 100 }}
                          inputProps={{ min: 0 }}
                          autoFocus
                          disabled={stockEdit.saving}
                        />
                        <Tooltip title="Guardar stock">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => stockEdit.onSave(product)}
                              disabled={stockEdit.saving}
                            >
                              <Icon fontSize="small" sx={{ color: "success.main" }}>
                                check
                              </Icon>
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <span>
                            <IconButton
                              size="small"
                              onClick={stockEdit.onCancel}
                              disabled={stockEdit.saving}
                            >
                              <Icon fontSize="small">close</Icon>
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <StockChip state={state} quantity={quantity} />
                        <Tooltip title="Editar stock">
                          <IconButton
                            size="small"
                            onClick={() => stockEdit.onStart(index, quantity)}
                            sx={{ color: "text.main", opacity: 0.5, "&:hover": { opacity: 1 } }}
                          >
                            <Icon sx={{ fontSize: "16px !important" }}>inventory_2</Icon>
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </MDBox>

                  <MDBox display="flex" alignItems="center" justifyContent="flex-end" gap={0.25}>
                    <Tooltip title="Editar producto">
                      <IconButton
                        size="small"
                        onClick={() => onEditProduct(product)}
                        sx={{ color: "text.main", "&:hover": { color: "info.main" } }}
                      >
                        <Icon fontSize="small">edit</Icon>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar producto">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteProduct(product)}
                        sx={{ color: "text.main", "&:hover": { color: "error.main" } }}
                      >
                        <Icon fontSize="small">delete</Icon>
                      </IconButton>
                    </Tooltip>
                  </MDBox>
                </MDBox>
              );
            })}

            {visible.length !== products.length && (
              <MDBox px={3} py={1.5}>
                <MDTypography variant="caption" color="text">
                  Mostrando {formatNumber(visible.length)} de {formatNumber(products.length)}{" "}
                  productos
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        </MDBox>
      )}
    </Card>
  );
}

ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  inventory: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  hideUntracked: PropTypes.bool,
  onToggleHideUntracked: PropTypes.func.isRequired,
  discountEdit: PropTypes.object.isRequired,
  stockEdit: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
  onEditProduct: PropTypes.func.isRequired,
  onDeleteProduct: PropTypes.func.isRequired,
};

export default ProductTable;

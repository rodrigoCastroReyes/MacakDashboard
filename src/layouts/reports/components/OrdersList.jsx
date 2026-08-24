import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import StateMessage from "examples/StateMessage";
import StatCard from "examples/Cards/StatisticsCards/StatCard";

import usePagedAxios from "hooks/usePagedAxios";
import { formatCurrency, formatNumber } from "utils/format";
import { esMoment, formatDay } from "utils/datetime";
import { API_BASE_URL } from "config";

/** Estado legible de una orden a partir de status/annulled. */
const orderStateLabel = (order) => {
  if (order.annulled) return "Anulada";
  if (order.status && order.status !== "success") return "Rechazada";
  return "Exitosa";
};

/** "2× SANDUCHE DE PERNIL, 1× FRITADA" — el detalle de items en una línea. */
const flattenItems = (items = []) =>
  items
    .map((i) => `${i.number_of_product}× ${i.description || "Producto"}`)
    .join(", ");

const unitsOf = (order) =>
  (order.items || []).reduce((acc, i) => acc + (i.number_of_product || 0), 0);

/**
 * Lista de órdenes de una tienda como tarjetas, agrupadas por día, con búsqueda
 * por token, filtro por vendedor (username) y descarga a Excel.
 *
 * Se apoya en usePagedAxios porque el endpoint pagina (100 por página, tope de
 * 1000 en el backend) y una tienda concurrida supera esa cifra: al recorrer
 * todas las páginas, `orders` ya contiene el total, así que el filtrado, los
 * totales y la exportación se resuelven en cliente sin más peticiones.
 */
function OrdersList({ id_store, refreshToken = 0 }) {
  const { data, loading, error, refetch } = usePagedAxios(
    `${API_BASE_URL}/dashboard/orders_by_store?store_id=${id_store}`,
    { itemsKey: "orders" }
  );

  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState("");

  // Igual que el resto de la pantalla: el botón "Actualizar" de la cabecera
  // incrementa refreshToken y aquí forzamos un refetch saltándose la caché.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    refetch();
  }, [refreshToken, refetch]);

  const orders = useMemo(() => data?.orders || [], [data]);

  // Vendedores presentes, para el select. Una tienda puede tener varios.
  const vendors = useMemo(
    () => [...new Set(orders.map((o) => o.username).filter(Boolean))].sort(),
    [orders]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (vendor && o.username !== vendor) return false;
      if (term && !String(o.token_code || "").toLowerCase().includes(term)) return false;
      return true;
    });
  }, [orders, search, vendor]);

  // Totales sobre lo filtrado, para que las tarjetas de resumen reaccionen a los
  // filtros. Sin filtros, coincide con el total de la tienda.
  const totals = useMemo(
    () => ({
      count: filtered.length,
      amount: filtered.reduce((acc, o) => acc + (o.final_price || 0), 0),
    }),
    [filtered]
  );

  // Agrupa por día conservando el orden que ya trae el endpoint (descendente).
  const groups = useMemo(() => {
    const byDay = new Map();
    filtered.forEach((order) => {
      const key = formatDay(order.timestamp);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(order);
    });
    return [...byDay.entries()];
  }, [filtered]);

  const handleDownloadExcel = () => {
    if (!filtered.length) return;
    // Cada fila es una orden; los productos van aplanados en "Descripción".
    const rows = filtered.map((o) => ({
      "Fecha y Hora": esMoment(o.timestamp).format("DD/MM/YYYY HH:mm:ss"),
      Token: o.token_code || "",
      Vendedor: o.username || "",
      Descripción: flattenItems(o.items),
      Unidades: unitsOf(o),
      Estado: orderStateLabel(o),
      "Total ($)": o.final_price || 0,
      "Método de Pago": o.payment_method || "",
      "ID Orden": o.order_id,
      "ID Transacción": o.transaction_id || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Órdenes");
    const store = (data?.store_name || "tienda").replace(/[^\w-]+/g, "_");
    XLSX.writeFile(wb, `Ordenes_${store}_${esMoment().format("YYYYMMDD_HHmmss")}.xlsx`);
  };

  if (loading) {
    return <StateMessage state="loading" message="Cargando órdenes…" />;
  }

  if (error) {
    return <StateMessage state="error" />;
  }

  if (!orders.length) {
    return <StateMessage state="empty" message="Esta tienda no tiene órdenes registradas" />;
  }

  return (
    <MDBox>
      {/* Controles: búsqueda por token, filtro por vendedor y descarga. */}
      <MDBox display="flex" alignItems="center" gap={1.5} flexWrap="wrap" mb={2}>
        <TextField
          size="small"
          placeholder="Buscar pulsera…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: "100%", sm: 220 } }}
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
        <TextField
          select
          size="small"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          sx={{ minWidth: 170 }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">Todo vendedor</MenuItem>
          {vendors.map((v) => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>

        <MDBox ml={{ sm: "auto" }}>
          <MDButton
            variant="gradient"
            color="info"
            size="small"
            onClick={handleDownloadExcel}
            disabled={!filtered.length}
            startIcon={<Icon>download</Icon>}
          >
            Descargar
          </MDButton>
        </MDBox>
      </MDBox>

      <Grid container spacing={2} mb={1}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard label="Órdenes" value={formatNumber(totals.count)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard label="Total vendido" value={formatCurrency(totals.amount)} valueColor="info" />
        </Grid>
      </Grid>

      {groups.length === 0 ? (
        <StateMessage state="empty" message="Ninguna orden coincide con los filtros" />
      ) : (
        groups.map(([day, dayOrders]) => (
          <MDBox key={day} mb={3}>
            <MDBox display="flex" alignItems="center" gap={1} mt={2} mb={1.5}>
              <MDTypography variant="button" fontWeight="bold" color="text" textTransform="capitalize">
                {day}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                · {formatNumber(dayOrders.length)}{" "}
                {dayOrders.length === 1 ? "orden" : "órdenes"}
              </MDTypography>
            </MDBox>

            <Grid container spacing={2}>
              {dayOrders.map((order) => (
                <Grid key={order.order_id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <OrderCard order={order} />
                </Grid>
              ))}
            </Grid>
          </MDBox>
        ))
      )}
    </MDBox>
  );
}

/** Tarjeta de una orden: token, hora, detalle de productos y total. */
function OrderCard({ order }) {
  const state = orderStateLabel(order);
  const isBad = state !== "Exitosa";

  return (
    <Card sx={{ height: "100%", p: 2, display: "flex", flexDirection: "column" }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
        <MDBox display="flex" alignItems="center" gap={0.75}>
          <Icon fontSize="small" sx={{ color: "text.secondary" }}>
            nfc
          </Icon>
          <MDTypography variant="button" fontWeight="bold">
            {order.token_code || "—"}
          </MDTypography>
        </MDBox>
        <MDTypography variant="caption" color="text">
          {esMoment(order.timestamp).format("HH:mm")}
        </MDTypography>
      </MDBox>

      <MDBox display="flex" alignItems="center" gap={1} mt={0.25}>
        <MDTypography variant="caption" color="text">
          {order.username || "—"}
        </MDTypography>
        {isBad && (
          <MDTypography variant="caption" fontWeight="medium" color="error">
            · {state}
          </MDTypography>
        )}
      </MDBox>

      <Divider sx={{ my: 1 }} />

      <MDBox flexGrow={1} display="flex" flexDirection="column" gap={0.5}>
        {(order.items || []).map((item, idx) => (
          <MDBox
            key={`${order.order_id}-${item.product_id}-${idx}`}
            display="flex"
            justifyContent="space-between"
            gap={1}
          >
            <MDTypography variant="caption" color="text">
              <b>{formatNumber(item.number_of_product)}×</b> {item.description || "Producto"}
            </MDTypography>
            <MDTypography variant="caption" color="text" sx={{ whiteSpace: "nowrap" }}>
              {formatCurrency(item.total_price)}
            </MDTypography>
          </MDBox>
        ))}
      </MDBox>

      <Divider sx={{ my: 1 }} />

      <MDBox display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="caption" color="text">
          Total
        </MDTypography>
        <MDTypography variant="h6" fontWeight="bold" color="dark">
          {formatCurrency(order.final_price)}
        </MDTypography>
      </MDBox>
    </Card>
  );
}

const orderShape = PropTypes.shape({
  order_id: PropTypes.string.isRequired,
  transaction_id: PropTypes.string,
  timestamp: PropTypes.number,
  status: PropTypes.string,
  annulled: PropTypes.bool,
  payment_method: PropTypes.string,
  username: PropTypes.string,
  token_code: PropTypes.string,
  final_price: PropTypes.number,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      product_id: PropTypes.string,
      number_of_product: PropTypes.number,
      total_price: PropTypes.number,
      description: PropTypes.string,
    })
  ),
});

OrderCard.propTypes = {
  order: orderShape.isRequired,
};

OrdersList.propTypes = {
  id_store: PropTypes.string.isRequired,
  refreshToken: PropTypes.number,
};

export default OrdersList;

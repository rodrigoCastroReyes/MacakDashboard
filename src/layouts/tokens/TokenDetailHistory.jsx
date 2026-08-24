import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { MONO } from "components/MonoId";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import StateMessage from "examples/StateMessage";

import useAxios from "hooks/useAxios";
import usePagedAxios from "hooks/usePagedAxios";
import { formatCurrency, formatNumber } from "utils/format";
import { esMoment, formatDay } from "utils/datetime";
import { API_BASE_URL } from "config";

const TYPE_LABELS = {
  order: "Compra",
  recharge: "Carga",
  refund: "Reembolso",
  activation: "Activación",
};

const METHOD_LABELS = {
  cash: "Efectivo",
  credit_card: "Tarjeta",
  transfer: "Transferencia",
};

/** Un movimiento solo mueve el saldo si salió bien y nadie lo anuló. */
const applies = (t) => t.status === "success" && !t.annulled;

/**
 * Dirección del movimiento a partir del propio salto de saldo, no del `type`.
 * Así "activation" o un "refund" quedan bien clasificados sin tener que
 * enumerar todos los tipos que el backend pueda añadir.
 */
const delta = (t) => (t.token_new_balance || 0) - (t.token_last_balance || 0);
const isCredit = (t) => delta(t) >= 0;
const amountOf = (t) => Math.abs(delta(t));

/**
 * Saldo con el que queda la pulsera tras el movimiento.
 *
 * En los rechazados `token_new_balance` guarda el saldo que *habría* quedado y
 * puede ser negativo (hay uno de 0,50 que apunta a −1,50): el saldo que de
 * verdad persistió es el anterior.
 */
const balanceAfter = (t) => (applies(t) ? t.token_new_balance : t.token_last_balance);

const statusOf = (t) => {
  if (t.annulled) return "annulled";
  return t.status === "success" ? "success" : "rejected";
};

const STATUS_LABELS = { success: "Exitosa", rejected: "Rechazada", annulled: "Anulada" };

const plural = (n, one, many) => `${formatNumber(n)} ${n === 1 ? one : many}`;

const GRID =
  "minmax(150px, 1.1fr) minmax(170px, 1.2fr) minmax(120px, 0.9fr) minmax(120px, 0.9fr) minmax(110px, 0.8fr)";

function TokenDetailHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState({ key: "time", dir: -1 });

  // Paginado: sin `page`/`limit` el endpoint solo devuelve los 10 movimientos
  // más recientes y el extracto quedaba cortado.
  const { data, loading, error, refetch } = usePagedAxios(
    `${API_BASE_URL}/dashboard/token?token_id=${id}`
  );
  // Las anuladas viven en otro endpoint y no aparecen en el principal, así que
  // se traen aparte y se funden en una sola tabla filtrable.
  const { data: voidedData, refetch: refetchVoided } = useAxios(
    `${API_BASE_URL}/transaction/get_anulled_transactions_of_token?token_id=${id}`
  );

  const token = data?.token;

  const movements = useMemo(() => {
    const main = data?.transactions || [];
    const voided = (voidedData?.transactions || []).map((t) => ({ ...t, annulled: true }));
    // Los dos endpoints son disjuntos, pero se deduplica por si algún día
    // dejan de serlo y una anulada acaba contada dos veces.
    const byId = new Map();
    [...main, ...voided].forEach((t) => byId.set(t._id, t));
    return [...byId.values()];
  }, [data?.transactions, voidedData?.transactions]);

  const chrono = useMemo(
    () => [...movements].sort((a, b) => a.__createdtime__ - b.__createdtime__),
    [movements]
  );

  /**
   * El endpoint devuelve como mucho los 10 movimientos más recientes. Si el
   * primero que vemos no arranca de cero, hay historia anterior que no se está
   * mostrando; ese saldo de apertura se declara al pie de la tabla para que la
   * suma cuadre a la vista en lugar de parecer un descuadre.
   */
  const opening = useMemo(() => {
    const first = chrono.find(applies) || chrono[0];
    if (!first) return null;
    const value = first.token_last_balance || 0;
    return value > 0 ? value : null;
  }, [chrono]);

  const stats = useMemo(() => {
    const effective = movements.filter(applies);
    const credits = effective.filter(isCredit);
    const debits = effective.filter((t) => !isCredit(t));
    return {
      credited: credits.reduce((acc, t) => acc + amountOf(t), 0),
      creditCount: credits.length,
      debited: debits.reduce((acc, t) => acc + amountOf(t), 0),
      debitCount: debits.length,
      total: movements.length,
      rejected: movements.filter((t) => statusOf(t) === "rejected").length,
      annulled: movements.filter((t) => statusOf(t) === "annulled").length,
    };
  }, [movements]);

  // Solo se ofrece un filtro cuando hay más de un valor que elegir.
  const typeOptions = useMemo(
    () => [...new Set(movements.map((t) => t.type))].filter(Boolean),
    [movements]
  );
  const statusOptions = useMemo(
    () => [...new Set(movements.map(statusOf))],
    [movements]
  );

  const filtered = useMemo(() => {
    const rows = movements.filter((t) => {
      if (typeFilter && t.type !== typeFilter) return false;
      if (statusFilter && statusOf(t) !== statusFilter) return false;
      return true;
    });
    const { key, dir } = sort;
    return rows.sort((a, b) =>
      key === "amount" ? dir * (amountOf(a) - amountOf(b)) : dir * (a.__createdtime__ - b.__createdtime__)
    );
  }, [movements, typeFilter, statusFilter, sort]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchVoided()]);
    setRefreshing(false);
  };

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: -1 }));

  if (loading || error || !token) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Movimientos del token" />
        <MDBox py={3}>
          <StateMessage
            state={loading ? "loading" : "error"}
            message={loading ? "Cargando movimientos…" : undefined}
          />
        </MDBox>
      </DashboardLayout>
    );
  }

  const registered = token.status === "registered";
  const filtersActive = Boolean(typeFilter || statusFilter);

  return (
    <DashboardLayout>
      <DashboardNavbar main_title={`Token ${token.code}`} />

      <MDBox py={3}>
        {/* Contexto de la pulsera */}
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
                    width: 46,
                    height: 46,
                    flexShrink: 0,
                    placeItems: "center",
                    borderRadius: borders.borderRadius.lg,
                    backgroundColor: palette.badgeColors.info.background,
                    color: palette.badgeColors.info.text,
                  })}
                >
                  <Icon>credit_card</Icon>
                </MDBox>
                <MDBox minWidth={0}>
                  <MDTypography
                    variant="h4"
                    fontWeight="semiBold"
                    color="dark"
                    sx={{ fontFamily: MONO, letterSpacing: "0.02em", lineHeight: 1.2 }}
                  >
                    {token.code}
                  </MDTypography>
                  <MDBox display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
                    <MDBox
                      px={0.875}
                      py={0.25}
                      sx={({ palette, borders }) => ({
                        borderRadius: borders.borderRadius.sm,
                        backgroundColor:
                          palette.badgeColors[registered ? "success" : "warning"].background,
                        color: palette.badgeColors[registered ? "success" : "warning"].text,
                      })}
                    >
                      <MDTypography
                        variant="caption"
                        fontWeight="semiBold"
                        color="inherit"
                        textTransform="uppercase"
                        sx={{ letterSpacing: "0.04em", fontSize: "10.5px" }}
                      >
                        {registered ? "Registrada" : "Anulada"}
                      </MDTypography>
                    </MDBox>
                    <MDTypography variant="caption" color="text">
                      registrada {esMoment(token.__createdtime__).format("DD MMM YYYY, HH:mm")}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>

              <MDBox display="flex" alignItems="center" gap={1}>
                <MDButton
                  variant="gradient"
                  color="info"
                  size="small"
                  component="a"
                  href={`${API_BASE_URL}/report/generate_report_of_token?token_code=${token.code}`}
                  target="_blank"
                  rel="noreferrer"
                  download
                  startIcon={<Icon>download</Icon>}
                >
                  Descargar reporte
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  startIcon={<Icon>refresh</Icon>}
                >
                  {refreshing ? "Actualizando…" : "Actualizar"}
                </MDButton>
                <MDButton
                  variant="text"
                  color="secondary"
                  size="small"
                  onClick={() => navigate("/tokens")}
                  startIcon={<Icon>arrow_back</Icon>}
                >
                  Volver
                </MDButton>
              </MDBox>
            </MDBox>

            {/* KPIs de la pulsera */}
            <MDBox
              display="grid"
              gap={1.5}
              mt={2.5}
              sx={{ gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "1.2fr 1fr 1fr 1fr" } }}
            >
              <Kpi
                label="Saldo actual"
                value={formatCurrency(token.balance)}
                caption="disponible en la pulsera"
                highlight
              />
              {/* Solo se llaman "total" si el extracto arranca de cero; si
                  quedara historia anterior sin traer, serían totales falsos. */}
              <Kpi
                label={opening === null ? "Total cargado" : "Cargado"}
                value={formatCurrency(stats.credited)}
                caption={plural(stats.creditCount, "carga", "cargas")}
              />
              <Kpi
                label={opening === null ? "Total consumido" : "Consumido"}
                value={formatCurrency(stats.debited)}
                caption={plural(stats.debitCount, "compra", "compras")}
              />
              <Kpi
                label="Movimientos"
                value={formatNumber(stats.total)}
                caption={`${plural(stats.rejected, "rechazada", "rechazadas")} · ${plural(
                  stats.annulled,
                  "anulada",
                  "anuladas"
                )}`}
              />
            </MDBox>

            {opening !== null && (
              <MDBox display="flex" alignItems="center" gap={0.75} mt={1.5}>
                <Icon sx={{ fontSize: "16px !important", color: "text.main", opacity: 0.6 }}>
                  info
                </Icon>
                <MDTypography variant="caption" color="text">
                  Cargado y consumido cuentan solo los movimientos listados; la pulsera ya traía{" "}
                  {formatCurrency(opening)} de antes.
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        </Card>

        {/* Movimientos */}
        <Card sx={{ overflow: "hidden" }}>
          <MDBox
            px={3}
            py={2}
            display="flex"
            alignItems="center"
            gap={1.5}
            flexWrap="wrap"
            sx={({ palette }) => ({ borderBottom: `1px solid ${palette.grey[200]}` })}
          >
            <MDBox display="flex" alignItems="baseline" gap={1} mr="auto">
              <MDTypography variant="h6" fontWeight="semiBold" color="dark">
                Movimientos
              </MDTypography>
              <MDTypography variant="button" color="text">
                · {formatNumber(filtered.length)} de {formatNumber(stats.total)}
              </MDTypography>
            </MDBox>

            {typeOptions.length > 1 && (
              <TextField
                select
                size="small"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                sx={{ minWidth: 140 }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">Todo tipo</MenuItem>
                {typeOptions.map((t) => (
                  <MenuItem key={t} value={t}>
                    {TYPE_LABELS[t] || t}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {statusOptions.length > 1 && (
              <TextField
                select
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 140 }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">Todo estado</MenuItem>
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </MDBox>

          {filtered.length === 0 ? (
            <StateMessage
              state="empty"
              message={
                stats.total === 0
                  ? "Esta pulsera todavía no registra movimientos"
                  : "Ningún movimiento coincide con los filtros"
              }
            />
          ) : (
            <MovementRows
              rows={filtered}
              sort={sort}
              onSort={toggleSort}
              opening={filtersActive ? null : opening}
            />
          )}
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

/** Celda de métrica dentro de la tarjeta de contexto. */
function Kpi({ label, value, caption, highlight = false }) {
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
      <MDTypography
        variant={highlight ? "h4" : "h5"}
        fontWeight="bold"
        color={highlight ? "info" : "dark"}
        sx={{ mt: 0.5, lineHeight: 1.1 }}
      >
        {value}
      </MDTypography>
      <MDTypography variant="caption" color="text" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
        {caption}
      </MDTypography>
    </MDBox>
  );
}

Kpi.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  caption: PropTypes.string,
  highlight: PropTypes.bool,
};

/** Extracto de movimientos, agrupado por día cuando el orden es cronológico. */
function MovementRows({ rows, sort, onSort, opening }) {
  const grouped = sort.key === "time";
  let lastDay = null;

  const headers = [
    { key: "time", label: "Fecha y hora", sortable: true },
    { key: "movement", label: "Movimiento" },
    { key: "status", label: "Estado" },
    { key: "amount", label: "Monto", sortable: true, align: "right" },
    { key: "balance", label: "Saldo", align: "right" },
  ];

  // El saldo de apertura cierra la aritmética por el extremo más antiguo de la
  // tabla, que cambia según el sentido del orden.
  const openingRow = opening !== null && grouped && (
    <MDBox
      display="grid"
      gap={2}
      alignItems="center"
      px={3}
      py={1.25}
      sx={({ palette }) => ({
        gridTemplateColumns: GRID,
        backgroundColor: palette.grey[100],
        borderTop: `1px solid ${palette.grey[200]}`,
      })}
    >
      <MDTypography variant="caption" color="text" sx={{ gridColumn: "1 / 4" }}>
        Saldo antes de los movimientos listados
      </MDTypography>
      <MDBox />
      <MDTypography
        variant="caption"
        fontWeight="semiBold"
        color="text"
        sx={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
      >
        {formatCurrency(opening)}
      </MDTypography>
    </MDBox>
  );

  return (
    <MDBox sx={{ overflowX: "auto" }}>
      <MDBox sx={{ minWidth: 760 }}>
        <MDBox
          display="grid"
          gap={2}
          px={3}
          py={1.5}
          sx={({ palette }) => ({
            gridTemplateColumns: GRID,
            borderBottom: `1px solid ${palette.grey[200]}`,
          })}
        >
          {headers.map((col) => {
            const active = sort.key === col.key;
            return (
              <MDBox
                key={col.key}
                display="flex"
                alignItems="center"
                gap={0.25}
                justifyContent={col.align === "right" ? "flex-end" : "flex-start"}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
                sx={{ cursor: col.sortable ? "pointer" : "default", userSelect: "none" }}
              >
                <MDTypography
                  variant="caption"
                  fontWeight="semiBold"
                  color={active ? "info" : "text"}
                  textTransform="uppercase"
                  sx={{ letterSpacing: "0.04em", fontSize: "11px" }}
                >
                  {col.label}
                </MDTypography>
                {col.sortable && (
                  <Icon
                    sx={{
                      fontSize: "16px !important",
                      color: active ? "info.main" : "text.main",
                      opacity: active ? 1 : 0.35,
                    }}
                  >
                    {active && sort.dir === 1 ? "arrow_drop_up" : "arrow_drop_down"}
                  </Icon>
                )}
              </MDBox>
            );
          })}
        </MDBox>

        {sort.dir === 1 && openingRow}

        {rows.map((t) => {
          const day = formatDay(t.__createdtime__);
          const showDay = grouped && day !== lastDay;
          lastDay = day;

          const state = statusOf(t);
          const effective = applies(t);
          const credit = isCredit(t);
          const method = METHOD_LABELS[t.payment_method];

          return (
            <MDBox key={t._id}>
              {showDay && (
                <MDBox
                  px={3}
                  py={0.875}
                  sx={({ palette }) => ({ backgroundColor: palette.grey[100] })}
                >
                  <MDTypography variant="caption" fontWeight="semiBold" color="text">
                    {day}
                  </MDTypography>
                </MDBox>
              )}

              <MDBox
                display="grid"
                gap={2}
                alignItems="center"
                px={3}
                py={1.25}
                sx={({ palette }) => ({
                  gridTemplateColumns: GRID,
                  borderBottom: `1px solid ${palette.grey[200]}`,
                  backgroundColor:
                    state === "rejected"
                      ? palette.badgeColors.error.background
                      : state === "annulled"
                      ? palette.grey[100]
                      : "transparent",
                })}
              >
                <MDTypography
                  variant="caption"
                  color="text"
                  sx={{ fontFamily: MONO, fontSize: "12.5px", whiteSpace: "nowrap" }}
                >
                  {grouped
                    ? esMoment(t.__createdtime__).format("HH:mm:ss")
                    : esMoment(t.__createdtime__).format("DD/MM/YY HH:mm:ss")}
                </MDTypography>

                <MDBox display="flex" alignItems="center" gap={1} minWidth={0}>
                  <MDBox
                    display="grid"
                    sx={({ palette }) => ({
                      width: 26,
                      height: 26,
                      flexShrink: 0,
                      placeItems: "center",
                      borderRadius: "50%",
                      backgroundColor: credit
                        ? palette.badgeColors.success.background
                        : palette.grey[200],
                      color: credit ? palette.success.main : palette.text.main,
                    })}
                  >
                    <Icon sx={{ fontSize: "15px !important" }}>
                      {credit ? "south" : "shopping_cart"}
                    </Icon>
                  </MDBox>
                  <MDBox minWidth={0}>
                    <MDTypography variant="caption" fontWeight="medium" color="dark" display="block">
                      {TYPE_LABELS[t.type] || t.type}
                    </MDTypography>
                    {method && (
                      <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                        {method}
                      </MDTypography>
                    )}
                  </MDBox>
                </MDBox>

                <MDBox>
                  {state === "success" ? (
                    <MDBox display="flex" alignItems="center" gap={0.5}>
                      <Icon sx={{ fontSize: "14px !important", color: "success.main" }}>check</Icon>
                      <MDTypography variant="caption" color="text">
                        Exitosa
                      </MDTypography>
                    </MDBox>
                  ) : (
                    <MDBox
                      px={1}
                      py={0.125}
                      display="inline-flex"
                      sx={({ palette }) => ({
                        borderRadius: "999px",
                        border: `1px solid ${
                          state === "rejected" ? palette.error.main : palette.grey[400]
                        }`,
                        color: state === "rejected" ? palette.error.focus : palette.text.main,
                        backgroundColor: palette.white.main,
                      })}
                    >
                      <MDTypography variant="caption" fontWeight="semiBold" color="inherit">
                        {STATUS_LABELS[state]}
                      </MDTypography>
                    </MDBox>
                  )}
                </MDBox>

                <MDBox sx={{ textAlign: "right" }}>
                  <MDTypography
                    variant="caption"
                    fontWeight={effective ? "semiBold" : "regular"}
                    color={effective ? (credit ? "success" : "dark") : "text"}
                    sx={{
                      fontVariantNumeric: "tabular-nums",
                      textDecoration: effective ? "none" : "line-through",
                      opacity: effective ? 1 : 0.6,
                    }}
                  >
                    {effective && (credit ? "+" : "−")}
                    {formatCurrency(amountOf(t))}
                  </MDTypography>
                  {!effective && (
                    <MDTypography
                      variant="caption"
                      color="text"
                      display="block"
                      sx={{ fontSize: "10.5px", opacity: 0.6 }}
                    >
                      no aplicado
                    </MDTypography>
                  )}
                </MDBox>

                <MDTypography
                  variant="caption"
                  fontWeight={effective ? "semiBold" : "regular"}
                  color={effective ? "dark" : "text"}
                  sx={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    opacity: effective ? 1 : 0.5,
                  }}
                >
                  {formatCurrency(balanceAfter(t))}
                </MDTypography>
              </MDBox>
            </MDBox>
          );
        })}

        {sort.dir === -1 && openingRow}
      </MDBox>
    </MDBox>
  );
}

MovementRows.propTypes = {
  rows: PropTypes.array.isRequired,
  sort: PropTypes.shape({ key: PropTypes.string, dir: PropTypes.number }).isRequired,
  onSort: PropTypes.func.isRequired,
  opening: PropTypes.number,
};

export default TokenDetailHistory;

import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SectionHeader from "examples/SectionHeader";
import StateMessage from "examples/StateMessage";

import CashierRoleTag, { roleFromUsername } from "layouts/token-admins/components/CashierRoleTag";
import MonoId, { MONO } from "components/MonoId";

import useAxios from "hooks/useAxios";
import { formatCurrency, formatNumber, formatPercent } from "utils/format";
import { esMoment, formatDay } from "utils/datetime";
import { API_BASE_URL } from "config";

const PER_PAGE = 15;

const METHODS = {
  cash: { label: "Efectivo", color: "success" },
  credit_card: { label: "Tarjeta", color: "info" },
  transfer: { label: "Transferencia", color: "warning" },
};

/** Importe con signo: la diferencia de saldo del token antes y después. */
const amountOf = (t) => (t.token_new_balance || 0) - (t.token_last_balance || 0);

function TokenAdminTransactions() {
  const { id_user } = useParams();
  const navigate = useNavigate();
  const event_id = localStorage.getItem("eventId");

  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/transaction/get_transaction_by_id_user?id_user=${id_user}&event_id=${event_id}`
  );

  const all = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const username = all[0]?.username || id_user;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const ok = all.filter((t) => t.status === "success" && !t.annulled);
    const recharges = ok.filter((t) => t.type === "recharge");
    const cash = recharges
      .filter((t) => t.payment_method === "cash")
      .reduce((acc, t) => acc + amountOf(t), 0);
    const card = recharges
      .filter((t) => t.payment_method !== "cash")
      .reduce((acc, t) => acc + amountOf(t), 0);
    const gross = cash + card;
    const annulled = all.filter((t) => t.annulled).length;
    const rejected = all.filter((t) => t.status === "rejected").length;
    return {
      gross,
      cash,
      card,
      count: all.length,
      avg: recharges.length ? gross / recharges.length : 0,
      successRate: all.length ? ((all.length - rejected) / all.length) * 100 : 0,
      annulled,
      rejected,
    };
  }, [all]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all
      .filter((t) => {
        if (term && !String(t.token_id || "").toLowerCase().includes(term)) return false;
        if (method && t.payment_method !== method) return false;
        if (status === "success" && (t.status !== "success" || t.annulled)) return false;
        if (status === "rejected" && t.status !== "rejected") return false;
        if (status === "annulled" && !t.annulled) return false;
        if (kind && t.type !== kind) return false;
        return true;
      })
      .sort((a, b) => b.__createdtime__ - a.__createdtime__);
  }, [all, search, method, status, kind]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount - 1);
  const slice = filtered.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE);

  const resetPage = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  const handleDownloadExcel = () => {
    if (!all.length) return;
    const rows = all.map((t) => ({
      "ID Transacción": t._id,
      "Fecha y Hora": esMoment(t.__createdtime__).format("DD/MM/YYYY HH:mm:ss"),
      Usuario: t.username,
      Tipo: t.type === "recharge" ? "Carga" : "Compra",
      Estado: t.annulled ? "Anulada" : t.status === "success" ? "Exitosa" : "Rechazada",
      "Monto ($)": amountOf(t),
      Descripción: t.description || "N/A",
      "Método de Pago": METHODS[t.payment_method]?.label || t.payment_method || "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
    XLSX.writeFile(wb, `Transacciones_${username}_${esMoment().format("YYYYMMDD_HHmmss")}.xlsx`);
  };

  if (loading || error) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Transacciones del cajero" />
        <MDBox py={3}>
          <StateMessage
            state={loading ? "loading" : "error"}
            message={loading ? "Cargando transacciones…" : undefined}
          />
        </MDBox>
      </DashboardLayout>
    );
  }

  const initials = username.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase();
  const share = (v) => (stats.gross ? `${formatPercent((v / stats.gross) * 100)} del total` : "—");

  return (
    <DashboardLayout>
      <DashboardNavbar main_title={`Transacciones · ${username}`} />

      <MDBox py={3}>
        {/* Contexto del cajero */}
        <Card>
          <MDBox p={2.5}>
            <MDBox
              display="flex"
              alignItems="flex-start"
              justifyContent="space-between"
              gap={2}
              flexWrap="wrap"
            >
              <MDBox display="flex" alignItems="center" gap={1.5} minWidth={0}>
                <MDBox
                  display="grid"
                  sx={({ palette, borders }) => ({
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    placeItems: "center",
                    borderRadius: borders.borderRadius.lg,
                    backgroundColor: palette.badgeColors.info.background,
                    color: palette.badgeColors.info.text,
                  })}
                >
                  <MDTypography variant="button" fontWeight="bold" color="inherit">
                    {initials}
                  </MDTypography>
                </MDBox>
                <MDBox minWidth={0}>
                  <MDTypography variant="h5" fontWeight="semiBold" color="dark">
                    {username}
                  </MDTypography>
                  <MDBox display="flex" alignItems="center" gap={1} mt={0.25} flexWrap="wrap">
                    <CashierRoleTag role={roleFromUsername(username)} />
                    <MonoId value={id_user} />
                  </MDBox>
                </MDBox>
              </MDBox>

              <MDBox display="flex" alignItems="center" gap={1}>
                <MDButton
                  variant="gradient"
                  color="info"
                  size="small"
                  onClick={handleDownloadExcel}
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
                  onClick={() => navigate("/tokens_admin")}
                  startIcon={<Icon>arrow_back</Icon>}
                >
                  Volver
                </MDButton>
              </MDBox>
            </MDBox>

            {/* KPIs del cajero */}
            <MDBox
              display="grid"
              gap={1.5}
              mt={2.5}
              sx={{ gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" } }}
            >
              {[
                {
                  label: "Total cargado",
                  value: formatCurrency(stats.gross),
                  caption: `${formatNumber(stats.count)} transacciones`,
                },
                {
                  label: "Efectivo",
                  value: formatCurrency(stats.cash),
                  caption: share(stats.cash),
                  dot: "success",
                },
                {
                  label: "Tarjeta",
                  value: formatCurrency(stats.card),
                  caption: share(stats.card),
                  dot: "info",
                },
                { label: "Ticket promedio", value: formatCurrency(stats.avg), caption: "por recarga" },
                {
                  label: "Tasa de éxito",
                  value: formatPercent(stats.successRate),
                  caption: `${formatNumber(stats.rejected)} rechazadas · ${formatNumber(stats.annulled)} anuladas`,
                },
              ].map((k) => (
                <MDBox
                  key={k.label}
                  px={1.75}
                  py={1.5}
                  sx={({ palette, borders }) => ({
                    backgroundColor: palette.grey[100],
                    borderRadius: borders.borderRadius.lg,
                  })}
                >
                  <MDBox display="flex" alignItems="center" gap={0.75}>
                    {k.dot && (
                      <MDBox
                        sx={({ palette }) => ({
                          width: 8,
                          height: 8,
                          borderRadius: "2px",
                          backgroundColor: palette[k.dot].main,
                        })}
                      />
                    )}
                    <MDTypography variant="caption" color="text" fontWeight="medium">
                      {k.label}
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="h5" fontWeight="bold" color="dark" sx={{ mt: 0.5, lineHeight: 1.1 }}>
                    {k.value}
                  </MDTypography>
                  <MDTypography variant="caption" color="text" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
                    {k.caption}
                  </MDTypography>
                </MDBox>
              ))}
            </MDBox>
          </MDBox>
        </Card>

        <SectionHeader title="Historial de transacciones" mt={4} />

        <Card sx={{ overflow: "hidden" }}>
          {/* Filtros */}
          <MDBox
            px={3}
            py={2}
            display="flex"
            alignItems="center"
            gap={1.5}
            flexWrap="wrap"
            sx={({ palette }) => ({ borderBottom: `1px solid ${palette.grey[200]}` })}
          >
            <TextField
              size="small"
              placeholder="Buscar pulsera…"
              value={search}
              onChange={resetPage(setSearch)}
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
            <TextField select size="small" value={method} onChange={resetPage(setMethod)} sx={{ minWidth: 150 }} SelectProps={{ displayEmpty: true }}>
              <MenuItem value="">Todo medio</MenuItem>
              <MenuItem value="cash">Efectivo</MenuItem>
              <MenuItem value="credit_card">Tarjeta</MenuItem>
              <MenuItem value="transfer">Transferencia</MenuItem>
            </TextField>
            <TextField select size="small" value={status} onChange={resetPage(setStatus)} sx={{ minWidth: 150 }} SelectProps={{ displayEmpty: true }}>
              <MenuItem value="">Todo estado</MenuItem>
              <MenuItem value="success">Exitosa</MenuItem>
              <MenuItem value="rejected">Rechazada</MenuItem>
              <MenuItem value="annulled">Anulada</MenuItem>
            </TextField>
            <TextField select size="small" value={kind} onChange={resetPage(setKind)} sx={{ minWidth: 140 }} SelectProps={{ displayEmpty: true }}>
              <MenuItem value="">Todo tipo</MenuItem>
              <MenuItem value="recharge">Carga</MenuItem>
              <MenuItem value="order">Compra</MenuItem>
            </TextField>
          </MDBox>

          {slice.length === 0 ? (
            <StateMessage state="empty" message="Ninguna transacción coincide con los filtros" />
          ) : (
            <TransactionRows rows={slice} />
          )}

          {/* Paginación */}
          <MDBox
            px={3}
            py={1.75}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            flexWrap="wrap"
            sx={({ palette }) => ({ borderTop: `1px solid ${palette.grey[200]}` })}
          >
            <MDTypography variant="caption" color="text">
              {filtered.length === 0
                ? "0 transacciones"
                : `${current * PER_PAGE + 1}–${Math.min(filtered.length, current * PER_PAGE + PER_PAGE)} de ${formatNumber(filtered.length)} transacciones`}
            </MDTypography>
            <MDBox display="flex" gap={1}>
              <MDButton
                variant="outlined"
                color="secondary"
                size="small"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                Anterior
              </MDButton>
              <MDButton
                variant="outlined"
                color="secondary"
                size="small"
                disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)}
              >
                Siguiente
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

/** Filas agrupadas por día, con las excepciones resaltadas. */
function TransactionRows({ rows }) {
  const GRID = "minmax(80px, 0.9fr) minmax(80px, 0.8fr) minmax(120px, 1.1fr) minmax(120px, 1.2fr) minmax(110px, 1fr) minmax(90px, 0.9fr)";
  let lastDay = null;

  return (
    <MDBox sx={{ overflowX: "auto" }}>
      <MDBox sx={{ minWidth: 820 }}>
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
          {["Hora", "Tipo", "Medio", "Pulsera", "Estado", "Monto"].map((h, i) => (
            <MDTypography
              key={h}
              variant="caption"
              fontWeight="semiBold"
              color="text"
              textTransform="uppercase"
              sx={{ letterSpacing: "0.04em", fontSize: "11px", textAlign: i === 5 ? "right" : "left" }}
            >
              {h}
            </MDTypography>
          ))}
        </MDBox>

        {rows.map((t) => {
          const day = formatDay(t.__createdtime__);
          const showDay = day !== lastDay;
          lastDay = day;
          const amount = amountOf(t);
          const isException = t.annulled || t.status === "rejected";
          const methodInfo = METHODS[t.payment_method] || { label: t.payment_method || "—", color: "secondary" };

          return (
            <MDBox key={t._id}>
              {showDay && (
                <MDBox
                  px={3}
                  py={0.875}
                  sx={({ palette }) => ({ backgroundColor: palette.grey[100] })}
                >
                  <MDTypography
                    variant="caption"
                    fontWeight="semiBold"
                    color="text"
                  >
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
                  // Las excepciones se tiñen de fondo para que salten a la vista
                  // sin tener que leer la columna de estado.
                  backgroundColor: t.annulled
                    ? palette.badgeColors.warning.background
                    : t.status === "rejected"
                    ? palette.badgeColors.error.background
                    : "transparent",
                })}
              >
                <MDTypography variant="caption" color="text" sx={{ fontFamily: MONO, fontSize: "12.5px" }}>
                  {esMoment(t.__createdtime__).format("HH:mm:ss")}
                </MDTypography>

                <MDTypography
                  variant="caption"
                  color={t.annulled ? "warning" : "text"}
                  fontWeight={t.annulled ? "semiBold" : "regular"}
                >
                  {t.type === "recharge" ? "Carga" : "Compra"}
                </MDTypography>

                <MDBox display="flex" alignItems="center" gap={0.75}>
                  <MDBox
                    sx={({ palette }) => ({
                      width: 8,
                      height: 8,
                      borderRadius: "2px",
                      flexShrink: 0,
                      backgroundColor: palette[methodInfo.color].main,
                    })}
                  />
                  <MDTypography variant="caption" color="dark">
                    {methodInfo.label}
                  </MDTypography>
                </MDBox>

                <MDTypography
                  variant="caption"
                  color="text"
                  title={t.token_id}
                  sx={{
                    fontFamily: MONO,
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.token_id ? `#${String(t.token_id).slice(0, 8)}` : "—"}
                </MDTypography>

                <MDBox>
                  {isException ? (
                    <MDBox
                      px={1}
                      py={0.125}
                      display="inline-flex"
                      sx={({ palette }) => ({
                        borderRadius: "999px",
                        border: `1px solid ${palette[t.annulled ? "warning" : "error"].main}`,
                        color: palette[t.annulled ? "warning" : "error"].focus,
                        backgroundColor: palette.white.main,
                      })}
                    >
                      <MDTypography variant="caption" fontWeight="semiBold" color="inherit">
                        {t.annulled ? "Anulada" : "Rechazada"}
                      </MDTypography>
                    </MDBox>
                  ) : (
                    <MDBox display="flex" alignItems="center" gap={0.5}>
                      <Icon sx={{ fontSize: "14px !important", color: "success.main" }}>check</Icon>
                      <MDTypography variant="caption" color="text">
                        Exitosa
                      </MDTypography>
                    </MDBox>
                  )}
                </MDBox>

                <MDTypography
                  variant="caption"
                  fontWeight="semiBold"
                  color={amount < 0 ? "error" : "success"}
                  sx={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                >
                  {amount < 0 ? "−" : "+"}
                  {formatCurrency(Math.abs(amount))}
                </MDTypography>
              </MDBox>
            </MDBox>
          );
        })}
      </MDBox>
    </MDBox>
  );
}

TransactionRows.propTypes = {
  rows: PropTypes.array.isRequired,
};

export default TokenAdminTransactions;

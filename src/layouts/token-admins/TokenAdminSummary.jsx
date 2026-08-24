import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SectionHeader from "examples/SectionHeader";
import StateMessage from "examples/StateMessage";
import StatCard from "examples/Cards/StatisticsCards/StatCard";
import TableSection from "examples/TableSection";

import CashierRoleTag, { roleFromUsername } from "layouts/token-admins/components/CashierRoleTag";
import MonoId from "components/MonoId";
import PaymentSplitBar from "layouts/token-admins/components/PaymentSplitBar";

import useAxios from "hooks/useAxios";
import { formatCurrency, formatNumber, formatPercent } from "utils/format";
import { API_BASE_URL } from "config";

const COLUMNS = [
  { key: "username", label: "Cajero", align: "left" },
  { key: "total_cash", label: "Efectivo", align: "right" },
  { key: "total_credit_card", label: "Tarjeta", align: "right" },
  { key: "total_recharged", label: "Recargado · composición", align: "right" },
  { key: "num_transactions", label: "Transac.", align: "right" },
];

const GRID = "minmax(220px, 2.2fr) repeat(4, minmax(96px, 1fr)) 32px";

/** Cifra en cero: se atenúa para que la vista destaque lo que sí tiene movimiento. */
function Money({ value, tone = "dark", weight = "medium" }) {
  if (!value) {
    return (
      <MDTypography variant="button" color="text" sx={{ opacity: 0.45, fontVariantNumeric: "tabular-nums" }}>
        {formatCurrency(0)}
      </MDTypography>
    );
  }
  return (
    <MDTypography variant="button" color={tone} fontWeight={weight} sx={{ fontVariantNumeric: "tabular-nums" }}>
      {formatCurrency(value)}
    </MDTypography>
  );
}

Money.propTypes = {
  value: PropTypes.number,
  tone: PropTypes.string,
  weight: PropTypes.string,
};

function SortableHeader({ column, sort, onSort }) {
  const active = sort.key === column.key;
  return (
    <MDBox
      component="button"
      type="button"
      onClick={() => onSort(column.key)}
      display="flex"
      alignItems="center"
      gap={0.5}
      justifyContent={column.align === "right" ? "flex-end" : "flex-start"}
      sx={{
        border: "none",
        background: "transparent",
        p: 0,
        cursor: "pointer",
        width: "100%",
      }}
    >
      <MDTypography
        variant="caption"
        fontWeight="semiBold"
        color={active ? "info" : "text"}
        textTransform="uppercase"
        sx={{ letterSpacing: "0.04em", fontSize: "11px", whiteSpace: "nowrap" }}
      >
        {column.label}
      </MDTypography>
      <Icon
        sx={{
          fontSize: "14px !important",
          color: active ? "info.main" : "text.main",
          opacity: active ? 1 : 0,
        }}
      >
        {sort.dir === 1 ? "arrow_upward" : "arrow_downward"}
      </Icon>
    </MDBox>
  );
}

SortableHeader.propTypes = {
  column: PropTypes.object.isRequired,
  sort: PropTypes.object.isRequired,
  onSort: PropTypes.func.isRequired,
};

function TokenAdminSummary() {
  const event_id = localStorage.getItem("eventId");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState({ key: "total_recharged", dir: -1 });

  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/transaction/summarize_by_users?event_id=${event_id}`
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const term = search.trim().toLowerCase();
    return list
      .filter((u) =>
        term ? `${u.username || ""} ${u.user_id || ""}`.toLowerCase().includes(term) : true
      )
      .sort((a, b) => {
        if (sort.key === "username") {
          return sort.dir * String(a.username || "").localeCompare(String(b.username || ""));
        }
        return sort.dir * ((a[sort.key] || 0) - (b[sort.key] || 0));
      });
  }, [data, search, sort]);

  const totals = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const cash = list.reduce((acc, u) => acc + (u.total_cash || 0), 0);
    const card = list.reduce((acc, u) => acc + (u.total_credit_card || 0), 0);
    const tx = list.reduce((acc, u) => acc + (u.num_transactions || 0), 0);
    return { cash, card, total: cash + card, tx, cashiers: list.length };
  }, [data]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: key === "username" ? 1 : -1 }));

  if (loading || error) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Resumen de saldo por cajero" />
        <MDBox py={3}>
          <StateMessage
            state={loading ? "loading" : "error"}
            message={loading ? "Cargando resumen de cajeros…" : undefined}
          />
        </MDBox>
      </DashboardLayout>
    );
  }

  const share = (v) => (totals.total ? `${formatPercent((v / totals.total) * 100)} del total` : "—");

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Resumen de saldo por cajero" />

      <MDBox py={3}>
        <SectionHeader title="Totales del evento" />

        <MDBox
          display="grid"
          gap={2}
          mb={4}
          sx={{
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              lg: "1.3fr repeat(4, 1fr)",
            },
          }}
        >
          <StatCard
            valueVariant="h4"
            label="Total recargado"
            value={formatCurrency(totals.total)}
            valueColor="info"
            caption={`${formatNumber(totals.cashiers)} cajeros · ${formatNumber(totals.tx)} transacciones`}
          />
          <StatCard
            valueVariant="h4"
            icon="payments"
            color="success"
            label="Efectivo"
            value={formatCurrency(totals.cash)}
            caption={share(totals.cash)}
          />
          <StatCard
            valueVariant="h4"
            icon="credit_card"
            label="Tarjeta"
            value={formatCurrency(totals.card)}
            caption={share(totals.card)}
          />
          <StatCard
            valueVariant="h4"
            label="Transacciones"
            value={formatNumber(totals.tx)}
            caption="en toda la jornada"
          />
          <StatCard
            valueVariant="h4"
            label="Recarga promedio"
            value={formatCurrency(totals.tx ? totals.total / totals.tx : 0)}
            caption="por transacción"
          />
        </MDBox>

        <SectionHeader title="Detalle por cajero" />

        <TableSection
          title="Recargas por cajero"
          count={rows.length}
          countLabel={["cajero", "cajeros"]}
          search={{
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Buscar por nombre o ID…",
          }}
          actions={
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
          }
        >
          <MDBox sx={{ overflowX: "auto" }}>
            <MDBox sx={{ minWidth: 760 }}>
              {/* Cabecera */}
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
                {COLUMNS.map((c) => (
                  <SortableHeader key={c.key} column={c} sort={sort} onSort={toggleSort} />
                ))}
                <MDBox />
              </MDBox>

              {rows.length === 0 ? (
                <StateMessage state="empty" message={`Sin resultados para "${search}"`} />
              ) : (
                rows.map((u) => (
                  <MDBox
                    key={u.user_id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/tokens_admin_details/${u.user_id}`)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      navigate(`/tokens_admin_details/${u.user_id}`)
                    }
                    display="grid"
                    gap={2}
                    alignItems="center"
                    px={3}
                    py={1.5}
                    sx={({ palette, transitions }) => ({
                      gridTemplateColumns: GRID,
                      cursor: "pointer",
                      borderBottom: `1px solid ${palette.grey[200]}`,
                      transition: transitions.create("background-color"),
                      "&:hover": { backgroundColor: palette.grey[100] },
                      "&:focus-visible": { outline: `2px solid ${palette.info.main}`, outlineOffset: -2 },
                    })}
                  >
                    <MDBox minWidth={0}>
                      <MDBox display="flex" alignItems="center" gap={1} mb={0.25}>
                        <MDTypography variant="button" fontWeight="semiBold" color="dark">
                          {u.username || u.user_id}
                        </MDTypography>
                        <CashierRoleTag role={roleFromUsername(u.username)} />
                      </MDBox>
                      <MonoId value={u.user_id} truncate />
                    </MDBox>

                    <MDBox textAlign="right">
                      <Money value={u.total_cash} />
                    </MDBox>
                    <MDBox textAlign="right">
                      <Money value={u.total_credit_card} />
                    </MDBox>

                    <MDBox textAlign="right">
                      <Money value={u.total_recharged} tone="success" weight="semiBold" />
                      <PaymentSplitBar cash={u.total_cash || 0} card={u.total_credit_card || 0} />
                    </MDBox>

                    <MDTypography
                      variant="button"
                      color="dark"
                      textAlign="right"
                      sx={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatNumber(u.num_transactions)}
                    </MDTypography>

                    <Icon fontSize="small" sx={{ color: "text.main", opacity: 0.4, display: "block" }}>
                      chevron_right
                    </Icon>
                  </MDBox>
                ))
              )}

              {/* Totales */}
              {rows.length > 0 && (
                <MDBox
                  display="grid"
                  gap={2}
                  alignItems="center"
                  px={3}
                  py={2}
                  sx={({ palette }) => ({
                    gridTemplateColumns: GRID,
                    backgroundColor: palette.grey[100],
                    borderTop: `2px solid ${palette.grey[300]}`,
                  })}
                >
                  <MDTypography variant="button" fontWeight="semiBold" color="text">
                    Total · {formatNumber(totals.cashiers)} cajeros
                  </MDTypography>
                  <MDBox textAlign="right">
                    <Money value={totals.cash} weight="semiBold" />
                  </MDBox>
                  <MDBox textAlign="right">
                    <Money value={totals.card} weight="semiBold" />
                  </MDBox>
                  <MDBox textAlign="right">
                    <Money value={totals.total} tone="success" weight="bold" />
                  </MDBox>
                  <MDTypography
                    variant="button"
                    fontWeight="semiBold"
                    color="dark"
                    textAlign="right"
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatNumber(totals.tx)}
                  </MDTypography>
                  <MDBox />
                </MDBox>
              )}
            </MDBox>
          </MDBox>
        </TableSection>
      </MDBox>
    </DashboardLayout>
  );
}

export default TokenAdminSummary;

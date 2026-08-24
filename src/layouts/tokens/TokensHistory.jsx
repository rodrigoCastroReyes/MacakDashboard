import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MonoId, { MONO } from "components/MonoId";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SectionHeader from "examples/SectionHeader";
import StateMessage from "examples/StateMessage";
import StatCard from "examples/Cards/StatisticsCards/StatCard";
import TableSection from "examples/TableSection";

import useAxios from "hooks/useAxios";
import { formatCurrency, formatNumber, formatPercent } from "utils/format";
import { esMoment, formatDay } from "utils/datetime";
import { API_BASE_URL } from "config";

const PER_PAGE = 15;

/** El único estado "sano" del token; cualquier otro es una incidencia. */
const REGISTERED = "registered";

const STATUS_LABELS = {
  [REGISTERED]: "Registrado",
  annulled: "Anulado",
  blocked: "Bloqueado",
};

const statusLabel = (status) => STATUS_LABELS[status] || "Anulado";

/**
 * Los saldos arrastran residuos de coma flotante: en el evento de octubre hay
 * dos tokens con saldo 1,67e-16. Por debajo de medio céntimo no se puede ni
 * mostrar ni reclamar, así que no cuenta como saldo; si no, el filtro "Con
 * saldo" acababa listando filas de "$0,00".
 */
const MIN_BALANCE = 0.005;
const hasBalance = (token) => Number(token.balance) >= MIN_BALANCE;

const COLUMNS = [
  { key: "date", label: "Fecha de registro", sortable: true },
  { key: "code", label: "Código", sortable: true },
  { key: "status", label: "Estado" },
  { key: "balance", label: "Saldo", sortable: true, align: "right" },
  { key: "actions", label: "Acciones", align: "right" },
];

const GRID =
  "minmax(190px, 1.3fr) minmax(160px, 1.1fr) minmax(120px, 0.9fr) minmax(90px, 0.7fr) minmax(100px, 0.6fr)";

function TokensHistory() {
  const event_id = localStorage.getItem("eventId");
  const navigate = useNavigate();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: -1 });
  const [page, setPage] = useState(0);

  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/event/tokens?id=${event_id}`
  );

  const tokens = useMemo(() => data?.tokens || [], [data?.tokens]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const withBalance = tokens.filter(hasBalance);
    const pending = withBalance.reduce((acc, t) => acc + Number(t.balance), 0);
    return {
      total: tokens.length,
      pending,
      withBalance: withBalance.length,
      share: tokens.length ? (withBalance.length / tokens.length) * 100 : 0,
      avg: withBalance.length ? pending / withBalance.length : 0,
      flagged: tokens.filter((t) => t.status !== REGISTERED).length,
    };
  }, [tokens]);

  // Solo se ofrecen los estados que existen en los datos: un filtro que no puede
  // devolver nada es ruido, y en la mayoría de eventos todos están registrados.
  const statuses = useMemo(
    () => [...new Set(tokens.map((t) => t.status))].filter(Boolean),
    [tokens]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = tokens.filter((t) => {
      if (term && !String(t.code || "").toLowerCase().includes(term)) return false;
      if (balanceFilter === "con" && !hasBalance(t)) return false;
      if (balanceFilter === "sin" && hasBalance(t)) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      return true;
    });

    const { key, dir } = sort;
    return rows.sort((a, b) => {
      if (key === "code") return dir * String(a.code).localeCompare(String(b.code));
      if (key === "balance") return dir * (Number(a.balance) - Number(b.balance));
      return dir * (a.__createdtime__ - b.__createdtime__);
    });
  }, [tokens, search, balanceFilter, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount - 1);

  // Se cortan las filas antes de construirlas: montar los ~7.000 tokens del
  // evento en cada render costaba segundos aunque la tabla solo mostrara unos pocos.
  const slice = useMemo(
    () => filtered.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE),
    [filtered, current]
  );

  const toggleSort = (key) => {
    // Primer clic: descendente (lo más reciente y los saldos más altos arriba);
    // el código, en cambio, se lee mejor de la A a la Z.
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: key === "code" ? 1 : -1 }));
    setPage(0);
  };

  const onFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  if (loading || error) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Registro de Tokens" />
        <MDBox py={3}>
          <StateMessage
            state={loading ? "loading" : "error"}
            message={loading ? "Cargando tokens…" : undefined}
          />
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Registro de Tokens" />

      <MDBox py={3}>
        <SectionHeader title="Resumen del evento" />

        <MDBox
          display="grid"
          gap={2}
          mb={4}
          sx={{
            gridTemplateColumns: { xs: "repeat(2, 1fr)", lg: "1fr 1.3fr 1fr 1fr 1fr" },
          }}
        >
          <StatCard
            valueVariant="h4"
            label="Total de tokens"
            value={formatNumber(stats.total)}
            caption="registrados en el evento"
          />
          <StatCard
            valueVariant="h4"
            label="Saldo pendiente"
            value={formatCurrency(stats.pending)}
            valueColor="info"
            caption="sin consumir · por reclamar"
          />
          <StatCard
            valueVariant="h4"
            label="Con saldo"
            value={formatNumber(stats.withBalance)}
            caption={`${formatPercent(stats.share)} del total`}
          />
          <StatCard
            valueVariant="h4"
            label="Saldo promedio"
            value={formatCurrency(stats.avg)}
            caption="entre los que tienen saldo"
          />
          <StatCard
            valueVariant="h4"
            label="Anulados"
            value={formatNumber(stats.flagged)}
            valueColor={stats.flagged ? "warning" : "dark"}
            caption={stats.flagged ? "requieren revisión" : "sin incidencias"}
          />
        </MDBox>

        <SectionHeader title="Detalle por token" />

        <TableSection
          title="Historial de registro"
          count={filtered.length}
          countLabel={["token", "tokens"]}
          search={{
            value: search,
            onChange: onFilterChange(setSearch),
            placeholder: "Buscar por código…",
          }}
          actions={
            <>
              <TextField
                select
                size="small"
                value={balanceFilter}
                onChange={onFilterChange(setBalanceFilter)}
                sx={{ minWidth: 140 }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">Todo saldo</MenuItem>
                <MenuItem value="con">Con saldo</MenuItem>
                <MenuItem value="sin">Sin saldo</MenuItem>
              </TextField>

              {statuses.length > 1 && (
                <TextField
                  select
                  size="small"
                  value={statusFilter}
                  onChange={onFilterChange(setStatusFilter)}
                  sx={{ minWidth: 140 }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Todo estado</MenuItem>
                  {statuses.map((s) => (
                    <MenuItem key={s} value={s}>
                      {statusLabel(s)}
                    </MenuItem>
                  ))}
                </TextField>
              )}

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
            </>
          }
        >
          {slice.length === 0 ? (
            <StateMessage state="empty" message="Ningún token coincide con los filtros" />
          ) : (
            <TokenRows
              rows={slice}
              sort={sort}
              onSort={toggleSort}
              onOpen={(id) => navigate(`/token/${id}`)}
            />
          )}

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
                ? "0 tokens"
                : `${formatNumber(current * PER_PAGE + 1)}–${formatNumber(
                    Math.min(filtered.length, current * PER_PAGE + PER_PAGE)
                  )} de ${formatNumber(filtered.length)} ${
                    filtered.length === 1 ? "token" : "tokens"
                  }`}
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
        </TableSection>
      </MDBox>
    </DashboardLayout>
  );
}

/** Filas agrupadas por día cuando el orden es cronológico. */
function TokenRows({ rows, sort, onSort, onOpen }) {
  // Agrupar por día solo tiene sentido si las filas vienen en orden de fecha;
  // ordenadas por saldo, las cabeceras de día se repetirían sin aportar nada.
  const grouped = sort.key === "date";
  let lastDay = null;

  return (
    <MDBox sx={{ overflowX: "auto" }}>
      <MDBox sx={{ minWidth: 780 }}>
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
          {COLUMNS.map((col) => {
            const active = sort.key === col.key;
            return (
              <MDBox
                key={col.key}
                display="flex"
                alignItems="center"
                gap={0.25}
                justifyContent={col.align === "right" ? "flex-end" : "flex-start"}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
                sx={{
                  cursor: col.sortable ? "pointer" : "default",
                  userSelect: "none",
                  "&:hover .col-label": { color: col.sortable ? "info.main" : undefined },
                }}
              >
                <MDTypography
                  className="col-label"
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

        {rows.map((token) => {
          const day = formatDay(token.__createdtime__);
          const showDay = grouped && day !== lastDay;
          lastDay = day;

          const balance = Number(token.balance) || 0;
          const positive = hasBalance(token);
          const isFlagged = token.status !== REGISTERED;

          return (
            <MDBox key={token._id}>
              {showDay && (
                <MDBox px={3} py={0.875} sx={({ palette }) => ({ backgroundColor: palette.grey[100] })}>
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
                onClick={() => onOpen(token._id)}
                sx={({ palette }) => ({
                  gridTemplateColumns: GRID,
                  borderBottom: `1px solid ${palette.grey[200]}`,
                  cursor: "pointer",
                  // Solo se tiñen las incidencias. El saldo no se resalta con
                  // fondo porque lo tiene más de un tercio de los tokens: dejaría
                  // de leerse como excepción.
                  backgroundColor: isFlagged ? palette.badgeColors.warning.background : "transparent",
                  "&:hover": {
                    backgroundColor: isFlagged
                      ? palette.badgeColors.warning.background
                      : palette.grey[100],
                  },
                })}
              >
                <MDTypography
                  variant="caption"
                  color="text"
                  sx={{ fontFamily: MONO, fontSize: "12.5px", whiteSpace: "nowrap" }}
                >
                  {grouped
                    ? esMoment(token.__createdtime__).format("HH:mm:ss")
                    : esMoment(token.__createdtime__).format("DD/MM/YY HH:mm:ss")}
                </MDTypography>

                <MonoId value={token.code} color="info" fontSize="14px" fontWeight="semiBold" />

                <MDBox>
                  {isFlagged ? (
                    <MDBox
                      px={1}
                      py={0.125}
                      display="inline-flex"
                      sx={({ palette }) => ({
                        borderRadius: "999px",
                        border: `1px solid ${palette.warning.main}`,
                        color: palette.warning.focus,
                        backgroundColor: palette.white.main,
                      })}
                    >
                      <MDTypography variant="caption" fontWeight="semiBold" color="inherit">
                        {statusLabel(token.status)}
                      </MDTypography>
                    </MDBox>
                  ) : (
                    <MDBox display="flex" alignItems="center" gap={0.75}>
                      <MDBox
                        sx={({ palette }) => ({
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          flexShrink: 0,
                          backgroundColor: palette.success.main,
                        })}
                      />
                      <MDTypography variant="caption" color="text">
                        Registrado
                      </MDTypography>
                    </MDBox>
                  )}
                </MDBox>

                <MDTypography
                  variant="caption"
                  fontWeight={positive ? "semiBold" : "regular"}
                  color={positive ? "success" : "text"}
                  sx={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    opacity: positive ? 1 : 0.5,
                  }}
                >
                  {formatCurrency(balance)}
                </MDTypography>

                <MDBox display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  <Tooltip title="Descargar reporte del token">
                    <IconButton
                      size="small"
                      component="a"
                      href={`${API_BASE_URL}/report/generate_report_of_token?token_code=${token.code}`}
                      target="_blank"
                      rel="noreferrer"
                      download
                      // La fila entera navega al detalle, y descargar no debe
                      // arrastrar al usuario fuera de la lista.
                      onClick={(e) => e.stopPropagation()}
                      sx={{ color: "text.main", "&:hover": { color: "info.main" } }}
                    >
                      <Icon sx={{ fontSize: "18px !important" }}>download</Icon>
                    </IconButton>
                  </Tooltip>
                  <Icon sx={{ color: "text.main", opacity: 0.4, fontSize: "18px !important" }}>
                    chevron_right
                  </Icon>
                </MDBox>
              </MDBox>
            </MDBox>
          );
        })}
      </MDBox>
    </MDBox>
  );
}

TokenRows.propTypes = {
  rows: PropTypes.array.isRequired,
  sort: PropTypes.shape({ key: PropTypes.string, dir: PropTypes.number }).isRequired,
  onSort: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default TokensHistory;

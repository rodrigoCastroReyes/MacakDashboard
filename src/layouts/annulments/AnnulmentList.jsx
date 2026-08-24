import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

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

const PER_PAGE = 15;

const METHOD_LABELS = {
  cash: "Efectivo",
  credit_card: "Tarjeta",
  transfer: "Transferencia",
};

/** Importe revertido: el salto de saldo que la operación había provocado. */
const amountOf = (t) => Math.abs((t.token_new_balance || 0) - (t.token_last_balance || 0));

/**
 * Listado de operaciones anuladas.
 *
 * Anulaciones (recargas) y Reembolsos (compras) comparten endpoint, forma de
 * respuesta y pantalla: solo cambian el origen de los datos y cómo se llama al
 * actor. Antes eran dos archivos de ~190 líneas casi idénticos.
 */
function AnnulmentList({
  mainTitle,
  endpoint,
  tableTitle,
  countLabel,
  totalLabel,
  totalCaption,
  actorLabel,
  actorPluralLabel,
  emptyMessage,
}) {
  const navigate = useNavigate();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: -1 });
  const [page, setPage] = useState(0);

  const { data, loading, error, refetch } = useAxios(endpoint);

  const rows = useMemo(() => data?.transactions || [], [data?.transactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    // `total_value` lo calcula el servidor; se usa tal cual para no mostrar una
    // cifra distinta de la que reporta el backend.
    const total = typeof data?.total_value === "number"
      ? data.total_value
      : rows.reduce((acc, t) => acc + amountOf(t), 0);

    const byActor = rows.reduce((acc, t) => {
      const key = t.username || "—";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const ranked = Object.entries(byActor).sort((a, b) => b[1] - a[1]);

    return {
      total,
      count: rows.length,
      average: rows.length ? total / rows.length : 0,
      tokens: new Set(rows.map((t) => t.token_id?._id).filter(Boolean)).size,
      actors: ranked.length,
      topActor: ranked[0] || null,
    };
  }, [data?.total_value, rows]);

  // Solo se ofrece el filtro cuando hay más de un origen que elegir.
  const actorOptions = useMemo(
    () => [...new Set(rows.map((t) => t.username).filter(Boolean))].sort(),
    [rows]
  );

  // "token" no es un medio de pago, es la propia pulsera: la columna solo aporta
  // en las recargas anuladas, donde sí hubo efectivo o tarjeta de por medio.
  const showMethod = useMemo(
    () => rows.some((t) => t.payment_method && t.payment_method !== "token"),
    [rows]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = rows.filter((t) => {
      if (term && !String(t.token_id?.code || "").toLowerCase().includes(term)) return false;
      if (actorFilter && t.username !== actorFilter) return false;
      return true;
    });
    const { key, dir } = sort;
    return list.sort((a, b) =>
      key === "amount" ? dir * (amountOf(a) - amountOf(b)) : dir * (a.__createdtime__ - b.__createdtime__)
    );
  }, [rows, search, actorFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount - 1);
  const slice = useMemo(
    () => filtered.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE),
    [filtered, current]
  );

  const onFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: -1 }));
    setPage(0);
  };

  if (loading || error) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title={mainTitle} />
        <MDBox py={3}>
          <StateMessage
            state={loading ? "loading" : "error"}
            message={loading ? `Cargando ${countLabel[1]}…` : undefined}
          />
        </MDBox>
      </DashboardLayout>
    );
  }

  const [singular, plural] = countLabel;

  return (
    <DashboardLayout>
      <DashboardNavbar main_title={mainTitle} />

      <MDBox py={3}>
        <SectionHeader title="Resumen del evento" />

        <MDBox
          display="grid"
          gap={2}
          mb={4}
          sx={{ gridTemplateColumns: { xs: "repeat(2, 1fr)", lg: "1.3fr 1fr 1fr 1fr" } }}
        >
          <StatCard
            valueVariant="h4"
            label={totalLabel}
            value={formatCurrency(stats.total)}
            valueColor="info"
            caption={totalCaption}
          />
          <StatCard
            valueVariant="h4"
            label="Operaciones"
            value={formatNumber(stats.count)}
            caption={`${formatNumber(stats.tokens)} ${
              stats.tokens === 1 ? "pulsera afectada" : "pulseras afectadas"
            }`}
          />
          <StatCard
            valueVariant="h4"
            label="Importe medio"
            value={formatCurrency(stats.average)}
            caption="por operación"
          />
          <StatCard
            valueVariant="h4"
            label={actorPluralLabel}
            value={formatNumber(stats.actors)}
            caption={
              stats.topActor
                ? `${stats.topActor[0]} concentra ${formatPercent(
                    (stats.topActor[1] / stats.count) * 100
                  )}`
                : "sin actividad"
            }
          />
        </MDBox>

        <SectionHeader title={`Detalle por ${singular}`} />

        <TableSection
          title={tableTitle}
          count={filtered.length}
          countLabel={countLabel}
          search={{
            value: search,
            onChange: onFilterChange(setSearch),
            placeholder: "Buscar por código…",
          }}
          actions={
            <>
              {actorOptions.length > 1 && (
                <TextField
                  select
                  size="small"
                  value={actorFilter}
                  onChange={onFilterChange(setActorFilter)}
                  sx={{ minWidth: 190 }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Todo {actorLabel.toLowerCase()}</MenuItem>
                  {actorOptions.map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
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
            <StateMessage
              state="empty"
              message={rows.length === 0 ? emptyMessage : `Ninguna operación coincide con los filtros`}
            />
          ) : (
            <AnnulmentRows
              rows={slice}
              sort={sort}
              onSort={toggleSort}
              actorLabel={actorLabel}
              showMethod={showMethod}
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
                ? `0 ${plural}`
                : `${formatNumber(current * PER_PAGE + 1)}–${formatNumber(
                    Math.min(filtered.length, current * PER_PAGE + PER_PAGE)
                  )} de ${formatNumber(filtered.length)} ${
                    filtered.length === 1 ? singular : plural
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

AnnulmentList.propTypes = {
  mainTitle: PropTypes.string.isRequired,
  endpoint: PropTypes.string.isRequired,
  tableTitle: PropTypes.string.isRequired,
  countLabel: PropTypes.arrayOf(PropTypes.string).isRequired,
  totalLabel: PropTypes.string.isRequired,
  totalCaption: PropTypes.string.isRequired,
  actorLabel: PropTypes.string.isRequired,
  actorPluralLabel: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
};

/** Filas agrupadas por día cuando el orden es cronológico. */
function AnnulmentRows({ rows, sort, onSort, actorLabel, showMethod, onOpen }) {
  const grouped = sort.key === "date";
  let lastDay = null;

  const columns = [
    { key: "date", label: "Fecha y hora", sortable: true },
    { key: "token", label: "Token" },
    { key: "actor", label: actorLabel },
    ...(showMethod ? [{ key: "method", label: "Medio" }] : []),
    { key: "amount", label: "Monto", sortable: true, align: "right" },
  ];

  const grid = showMethod
    ? "minmax(150px, 1.1fr) minmax(150px, 1.1fr) minmax(150px, 1.1fr) minmax(110px, 0.8fr) minmax(100px, 0.7fr)"
    : "minmax(160px, 1.2fr) minmax(160px, 1.1fr) minmax(170px, 1.2fr) minmax(100px, 0.7fr)";

  return (
    <MDBox sx={{ overflowX: "auto" }}>
      <MDBox sx={{ minWidth: showMethod ? 780 : 660 }}>
        <MDBox
          display="grid"
          gap={2}
          px={3}
          py={1.5}
          sx={({ palette }) => ({
            gridTemplateColumns: grid,
            borderBottom: `1px solid ${palette.grey[200]}`,
          })}
        >
          {columns.map((col) => {
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

        {rows.map((t) => {
          const day = formatDay(t.__createdtime__);
          const showDay = grouped && day !== lastDay;
          lastDay = day;
          const code = t.token_id?.code;

          return (
            <MDBox key={t._id}>
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
                // Se navega con el _id del token, no con el código: el detalle
                // busca por id y con el código siempre caía en "sin datos".
                onClick={() => t.token_id?._id && onOpen(t.token_id._id)}
                sx={({ palette }) => ({
                  gridTemplateColumns: grid,
                  borderBottom: `1px solid ${palette.grey[200]}`,
                  cursor: t.token_id?._id ? "pointer" : "default",
                  "&:hover": { backgroundColor: palette.grey[100] },
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

                {code ? (
                  <MonoId value={code} color="info" fontSize="14px" fontWeight="semiBold" />
                ) : (
                  <MDTypography variant="caption" color="text" sx={{ opacity: 0.5 }}>
                    —
                  </MDTypography>
                )}

                <MDTypography
                  variant="caption"
                  color="dark"
                  title={t.username}
                  sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {t.username || "—"}
                </MDTypography>

                {showMethod && (
                  <MDTypography variant="caption" color="text">
                    {METHOD_LABELS[t.payment_method] || t.payment_method || "—"}
                  </MDTypography>
                )}

                <MDTypography
                  variant="caption"
                  fontWeight="semiBold"
                  color="dark"
                  sx={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                >
                  {formatCurrency(amountOf(t))}
                </MDTypography>
              </MDBox>
            </MDBox>
          );
        })}
      </MDBox>
    </MDBox>
  );
}

AnnulmentRows.propTypes = {
  rows: PropTypes.array.isRequired,
  sort: PropTypes.shape({ key: PropTypes.string, dir: PropTypes.number }).isRequired,
  onSort: PropTypes.func.isRequired,
  actorLabel: PropTypes.string.isRequired,
  showMethod: PropTypes.bool,
  onOpen: PropTypes.func.isRequired,
};

export default AnnulmentList;

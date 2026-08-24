import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import StateMessage from "examples/StateMessage";

import useAxios from "hooks/useAxios";
import { formatCurrency } from "utils/format";
import { API_BASE_URL } from "config";

import "./style.css";

function StoreRow({ rank, name, total, onClick }) {
  const isTop = rank <= 3;

  return (
    <MDBox
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      display="flex"
      alignItems="center"
      gap={2}
      px={3}
      py={1.5}
      sx={({ palette, transitions }) => ({
        cursor: "pointer",
        transition: transitions.create("background-color"),
        "&:hover": { backgroundColor: palette.grey[100] },
        "&:focus-visible": { outline: `2px solid ${palette.info.main}`, outlineOffset: -2 },
      })}
    >
      <MDTypography
        variant="button"
        fontWeight="semiBold"
        color={isTop ? "info" : "text"}
        sx={{ width: 22, flexShrink: 0, textAlign: "right" }}
      >
        {rank}
      </MDTypography>

      <MDTypography
        variant="button"
        fontWeight="medium"
        color="dark"
        sx={{
          flex: 1,
          minWidth: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </MDTypography>

      {/* Ancho fijo + tabular-nums: si la columna se ajusta al texto, los importes
          quedan desalineados de una fila a otra. */}
      <MDTypography
        variant="button"
        fontWeight="semiBold"
        color="dark"
        sx={{
          width: 112,
          flexShrink: 0,
          textAlign: "right",
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatCurrency(total)}
      </MDTypography>

      <Icon fontSize="small" sx={{ flexShrink: 0, color: "text.main", opacity: 0.5 }}>
        chevron_right
      </Icon>
    </MDBox>
  );
}

const SalesSummary = ({ refreshToken = 0 }) => {
  const event_id = localStorage.getItem("eventId");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/summary_per_store?event_id=${event_id}`
  );

  // El botón "Actualizar" del Resumen incrementa refreshToken; el primer valor
  // (0) es el montaje, que ya resuelve useAxios con o sin caché.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    refetch();
  }, [refreshToken, refetch]);

  const ranking = useMemo(() => {
    const stores = data?.stores_summary || [];
    const term = search.trim().toLowerCase();
    return [...stores]
      .filter((s) => (term ? (s.name || "").toLowerCase().includes(term) : true))
      .sort((a, b) => (b.total || 0) - (a.total || 0));
  }, [data, search]);

  const renderBody = () => {
    if (loading) return <StateMessage state="loading" message="Cargando tiendas…" />;
    if (error) return <StateMessage state="error" />;
    if (!ranking.length) {
      return (
        <StateMessage
          state="empty"
          message={search ? `Sin resultados para "${search}"` : "Todavía no hay ventas registradas"}
        />
      );
    }
    return ranking.map((store, i) => (
      <MDBox
        key={store.store_id}
        sx={({ palette }) => ({
          borderTop: i === 0 ? "none" : `1px solid ${palette.grey[200]}`,
        })}
      >
        <StoreRow
          rank={i + 1}
          name={store.name}
          total={store.total}
          onClick={() => navigate(`/transaccion/${store.store_id}`)}
        />
      </MDBox>
    ));
  };

  return (
    <Card
      sx={{ overflow: "hidden" }}
    >
      <MDBox
        px={3}
        py={2.5}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
      >
        <MDBox display="flex" alignItems="baseline" gap={1}>
          <MDTypography variant="h6" fontWeight="semiBold" color="dark">
            Ranking de ventas
          </MDTypography>
          {!loading && !error && (
            <MDTypography variant="button" color="text">
              · {ranking.length} {ranking.length === 1 ? "tienda" : "tiendas"}
            </MDTypography>
          )}
        </MDBox>

        <TextField
          size="small"
          placeholder="Buscar tienda…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: "100%", sm: 260 } }}
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
      </MDBox>

      <Divider sx={{ m: 0 }} />

      {renderBody()}
    </Card>
  );
};

SalesSummary.propTypes = {
  refreshToken: PropTypes.number,
};

export default SalesSummary;

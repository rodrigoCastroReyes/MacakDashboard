import { useMemo, useState } from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import StateMessage from "examples/StateMessage";
import TableSection from "examples/TableSection";

import useAxios from "hooks/useAxios";
import { formatCurrency } from "utils/format";
import { API_BASE_URL } from "config";

const GRID = "minmax(200px, 1.5fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(150px, 1.2fr) minmax(100px, 1fr)";

function PrechargesSummary({ refreshToken }) {
  const event_id = localStorage.getItem("eventId");

  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/precharges_summary?event_id=${event_id}`
  );

  const precharges = useMemo(() => data?.precharges_list || [], [data?.precharges_list]);
  const [search, setSearch] = useState("");

  const filteredPrecharges = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return precharges;
    return precharges.filter((p) => String(p.full_name || "").toLowerCase().includes(term));
  }, [precharges, search]);

  // Si nos pasan un refreshToken (desde el botón "Actualizar" global),
  // se fuerza el recálculo (re-fetch) de este componente.
  useMemo(() => {
    if (refreshToken > 0) refetch();
  }, [refreshToken, refetch]);

  if (loading || error) {
    return (
      <Card sx={{ mt: 4 }}>
        <MDBox py={4}>
          <StateMessage
            state={loading ? "loading" : "error"}
            message={loading ? "Cargando precargas…" : "Error al cargar las precargas"}
          />
        </MDBox>
      </Card>
    );
  }

  return (
    <TableSection
      title="Precargas por Asistente"
      count={filteredPrecharges.length}
      countLabel={["persona", "personas"]}
      mt={4}
      search={{
        value: search,
        onChange: (e) => setSearch(e.target.value),
        placeholder: "Buscar por asistente…",
      }}
    >
      {filteredPrecharges.length === 0 ? (
        <StateMessage state="empty" message={precharges.length === 0 ? "Nadie ha realizado precargas aún" : "Nadie coincide con tu búsqueda"} />
      ) : (
        <PrechargesRows rows={filteredPrecharges} />
      )}
    </TableSection>
  );
}

PrechargesSummary.propTypes = {
  refreshToken: PropTypes.number,
};

function PrechargesRows({ rows }) {
  const headers = [
    { key: "attender", label: "Asistente" },
    { key: "document", label: "Documento" },
    { key: "total", label: "Total Precargado", align: "right" },
    { key: "tokens", label: "Tokens Asignados" },
    { key: "status", label: "Estado" },
  ];

  return (
    <MDBox sx={{ overflowX: "auto" }}>
      <MDBox sx={{ minWidth: 700 }}>
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
          {headers.map((col) => (
            <MDBox
              key={col.key}
              display="flex"
              alignItems="center"
              justifyContent={col.align === "right" ? "flex-end" : "flex-start"}
            >
              <MDTypography
                variant="caption"
                fontWeight="semiBold"
                color="text"
                textTransform="uppercase"
                sx={{ letterSpacing: "0.04em", fontSize: "11px" }}
              >
                {col.label}
              </MDTypography>
            </MDBox>
          ))}
        </MDBox>

        {rows.map((row) => {
          const isActivated = row.status === "Activado";

          return (
            <MDBox
              key={row.attender_id}
              display="grid"
              gap={2}
              alignItems="center"
              px={3}
              py={1.5}
              sx={({ palette }) => ({
                gridTemplateColumns: GRID,
                borderBottom: `1px solid ${palette.grey[200]}`,
                "&:hover": { backgroundColor: palette.grey[50] },
              })}
            >
              <MDBox minWidth={0}>
                <MDTypography variant="caption" fontWeight="semiBold" color="dark" display="block">
                  {row.full_name}
                </MDTypography>
                {row.email && (
                  <MDTypography variant="caption" color="text">
                    {row.email}
                  </MDTypography>
                )}
              </MDBox>

              <MDTypography variant="caption" color="text">
                {row.id_document || "-"}
              </MDTypography>

              <MDTypography
                variant="caption"
                fontWeight="semiBold"
                color="dark"
                sx={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
              >
                {formatCurrency(row.total_precharged)}
              </MDTypography>

              <MDTypography variant="caption" color="text" sx={{ whiteSpace: "nowrap" }}>
                {row.assigned_tokens || "Ninguno"}
              </MDTypography>

              <MDBox>
                <MDBox
                  px={1.25}
                  py={0.25}
                  display="inline-flex"
                  alignItems="center"
                  gap={0.5}
                  sx={({ palette }) => ({
                    borderRadius: "999px",
                    border: `1px solid ${isActivated ? palette.success.main : palette.warning.main}`,
                    color: isActivated ? palette.success.main : palette.warning.focus,
                    backgroundColor: palette.white.main,
                  })}
                >
                  <MDTypography variant="caption" fontWeight="semiBold" color="inherit">
                    {row.status}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          );
        })}
      </MDBox>
    </MDBox>
  );
}

PrechargesRows.propTypes = {
  rows: PropTypes.array.isRequired,
};

export default PrechargesSummary;

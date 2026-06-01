import React, { useMemo } from "react";
import useAxios from "hooks/useAxios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Divider } from "@mui/material";
import { API_BASE_URL } from '../../../config';

function StoreHero({ id_store, store_name }) {
  const { data, loading } = useAxios(
    `${API_BASE_URL}/dashboard/sales_by_hour?store_id=${id_store}`
  );

  const stats = useMemo(() => {
    if (!data?.sales_by_hour) return null;
    const hours = [...data.sales_by_hour].sort((a, b) => a.hora - b.hora);
    const total = hours.reduce((acc, d) => acc + d.total_ventas, 0);
    const ordenes = hours.reduce((acc, d) => acc + d.num_ordenes, 0);
    const pico = hours.reduce((a, b) => a.total_ventas > b.total_ventas ? a : b);
    const HL = (h) => h === 0 ? "00:00" : `${String(h).padStart(2, "0")}:00`;
    const nextHour = pico.hora === 23 ? 0 : pico.hora + 1;
    const picoRange = `${HL(pico.hora)} - ${HL(nextHour)}`;
    const horasActivas = hours.map((h) => HL(h.hora));
    const primeraHora = horasActivas[0];
    const ultimaHora = horasActivas[horasActivas.length - 1];

    return { total, ordenes, pico, HL, picoRange, primeraHora, ultimaHora };
  }, [data]);

  if (loading || !stats) return null;

  return (
    <MDBox
      px={3}
      pt={3}
      pb={2}
      mb={2}
      sx={{ borderBottom: "2px solid rgba(0,0,0,0.1)" }}
    >
      <MDTypography
        variant="caption"
        fontWeight="medium"
        textTransform="uppercase"
        color="text"
        display="block"
        mb={1}
        sx={{ letterSpacing: "0.08em" }}
      >
        MACAK · {store_name} · reporte de ventas
      </MDTypography>

      <MDBox display="flex" alignItems="center" gap={3} flexWrap="wrap">
        <MDBox>
          <MDTypography variant="caption" color="text">
            ingresos totales
          </MDTypography>
          <MDTypography variant="h2" fontWeight="medium" lineHeight={1}>
            ${stats.total.toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </MDTypography>
        </MDBox>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 1 }}
        />

        <MDBox display="flex" flexDirection="column" gap={0.5}>
          <MDBox>
            <MDTypography variant="caption" color="text">órdenes </MDTypography>
            <MDTypography variant="h5" fontWeight="medium" component="span">
              {stats.ordenes}
            </MDTypography>
          </MDBox>
          <MDBox>
            <MDTypography variant="caption" color="text">hora pico </MDTypography>
            <MDTypography variant="button" color="text" component="span">
              {stats.picoRange} · ${stats.pico.total_ventas.toFixed(2)} · {stats.pico.num_ordenes} órdenes
            </MDTypography>
          </MDBox>
          <MDBox>
            <MDTypography variant="caption" color="text">horas activas </MDTypography>
            <MDTypography variant="button" color="text" component="span">
              {stats.primeraHora}–{stats.ultimaHora}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

export default StoreHero;
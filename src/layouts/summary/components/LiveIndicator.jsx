import PropTypes from "prop-types";
import moment from "moment";

import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

/** "En vivo · actualizado 15:48:15" junto con el botón para actualizar ya. */
function LiveIndicator({ updatedAt, loading = false, error = false, onRefresh }) {
  let text = "Cargando…";
  if (error) text = "Sin conexión · se muestran los últimos datos";
  else if (updatedAt) text = `actualizado ${moment(updatedAt).format("HH:mm:ss")}`;

  return (
    <MDBox
      display="inline-flex"
      alignItems="center"
      gap={1}
      pl={1.5}
      pr={0.5}
      py={0.25}
      sx={({ palette, borders }) => ({
        backgroundColor: palette.white.main,
        border: `1px solid ${palette.grey[300]}`,
        borderRadius: borders.borderRadius.xl,
      })}
    >
      <MDBox
        component="span"
        sx={({ palette }) => ({
          width: 8,
          height: 8,
          borderRadius: "50%",
          flexShrink: 0,
          backgroundColor: error ? palette.error.main : palette.success.main,
        })}
      />
      <MDTypography variant="caption" color="text" sx={{ whiteSpace: "nowrap" }}>
        <MDTypography component="span" variant="caption" fontWeight="bold" color="dark">
          En vivo
        </MDTypography>
        {" · "}
        {text}
      </MDTypography>
      <Tooltip title="Actualizar ahora">
        <span>
          <IconButton size="small" onClick={onRefresh} disabled={loading} aria-label="Actualizar">
            <Icon
              fontSize="small"
              sx={{
                color: "info.main",
                animation: loading ? "live-indicator-spin 1s linear infinite" : "none",
                "@keyframes live-indicator-spin": {
                  from: { transform: "rotate(0deg)" },
                  to: { transform: "rotate(360deg)" },
                },
              }}
            >
              refresh
            </Icon>
          </IconButton>
        </span>
      </Tooltip>
    </MDBox>
  );
}

LiveIndicator.propTypes = {
  updatedAt: PropTypes.number,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
};

export default LiveIndicator;

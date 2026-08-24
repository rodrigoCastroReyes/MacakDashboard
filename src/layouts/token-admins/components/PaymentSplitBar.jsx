import PropTypes from "prop-types";

import Tooltip from "@mui/material/Tooltip";

import MDBox from "components/MDBox";

/**
 * Composición efectivo / tarjeta de una fila. Verde = efectivo, azul de marca =
 * tarjeta; los mismos dos colores que usan los puntos de las cabeceras de KPI,
 * para que la lectura sea inmediata sin leyenda por fila.
 */
function PaymentSplitBar({ cash, card, width = 120 }) {
  const total = cash + card;
  const cashPct = total > 0 ? (cash / total) * 100 : 0;
  const cardPct = 100 - cashPct;

  return (
    <Tooltip
      title={`Efectivo ${cashPct.toFixed(0)}% · Tarjeta ${cardPct.toFixed(0)}%`}
      arrow
    >
      <MDBox
        display="flex"
        mt={0.75}
        ml="auto"
        sx={({ palette }) => ({
          width,
          height: 5,
          borderRadius: "3px",
          overflow: "hidden",
          backgroundColor: palette.grey[200],
        })}
      >
        <MDBox sx={({ palette }) => ({ width: `${cashPct}%`, backgroundColor: palette.success.main })} />
        <MDBox sx={({ palette }) => ({ width: `${cardPct}%`, backgroundColor: palette.info.main })} />
      </MDBox>
    </Tooltip>
  );
}

PaymentSplitBar.propTypes = {
  cash: PropTypes.number.isRequired,
  card: PropTypes.number.isRequired,
  width: PropTypes.number,
};

export default PaymentSplitBar;

/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Material Dashboard 2 React Base Styles
import colors from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";

const { white, grey } = colors;
const { borderWidth, borderRadius } = borders;

const card = {
  styleOverrides: {
    root: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      minWidth: 0,
      wordWrap: "break-word",
      backgroundColor: white.main,
      backgroundClip: "border-box",
      // Estándar de tarjeta: borde fino y sin sombra. Se define aquí para que
      // las ~39 tarjetas de la app sean consistentes sin repetir `sx` en cada una.
      // `overflow` sigue en visible porque algunas tarjetas tienen iconos que
      // sobresalen por arriba; quien necesite recortar lo pide en su propio sx.
      border: `${borderWidth[1]} solid ${grey[300]}`,
      borderRadius: borderRadius.xl,
      boxShadow: "none",
      overflow: "visible",
    },
  },
};

export default card;

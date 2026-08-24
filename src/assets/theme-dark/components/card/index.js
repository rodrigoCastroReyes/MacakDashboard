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
import colors from "assets/theme-dark/base/colors";
import borders from "assets/theme-dark/base/borders";

// Material Dashboard 2 React Helper Function
import rgba from "assets/theme-dark/functions/rgba";

const { white, background } = colors;
const { borderWidth, borderRadius } = borders;

const card = {
  styleOverrides: {
    root: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      minWidth: 0,
      wordWrap: "break-word",
      backgroundImage: "none",
      backgroundColor: background.card,
      backgroundClip: "border-box",
      // Mismo estándar que el tema claro (ver assets/theme/components/card).
      border: `${borderWidth[1]} solid ${rgba(white.main, 0.12)}`,
      borderRadius: borderRadius.xl,
      boxShadow: "none",
      overflow: "visible",
    },
  },
};

export default card;

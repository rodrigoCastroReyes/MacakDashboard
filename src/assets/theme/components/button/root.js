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
import typography from "assets/theme/base/typography";
import borders from "assets/theme/base/borders";

// Material Dashboard 2 React Helper Functions
import pxToRem from "assets/theme/functions/pxToRem";

const { fontWeightSemiBold, size } = typography;
const { borderRadius } = borders;

const root = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: size.sm,
  fontWeight: fontWeightSemiBold,
  borderRadius: borderRadius.lg,
  padding: `${pxToRem(9)} ${pxToRem(20)}`,
  lineHeight: 1.4,
  letterSpacing: "0.01em",
  textAlign: "center",
  // Antes iba en `uppercase` con peso 700: se leía pesado y gritón. En sentence
  // case y semibold el botón resulta más limpio sin perder jerarquía.
  textTransform: "none",
  userSelect: "none",
  backgroundSize: "150% !important",
  backgroundPositionX: "25% !important",
  boxShadow: "none",
  transition: "background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",

  "&:active": {
    transform: "translateY(1px)",
  },

  "&:focus-visible": {
    outline: "2px solid rgba(0, 83, 209, 0.55)",
    outlineOffset: "2px",
  },

  "&:disabled": {
    pointerEvent: "none",
    opacity: 0.65,
  },

  "& .material-icons": {
    fontSize: pxToRem(15),
    marginTop: pxToRem(-2),
  },
};

export default root;

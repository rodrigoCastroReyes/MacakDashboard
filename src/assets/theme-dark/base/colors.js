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

/**
 * The base colors for the Material Dashboard 2 React.
 * You can add new color using this file.
 * You can customized the colors for the entire Material Dashboard 2 React using thie file.
 */

// Misma paleta de marca que el tema claro (ver assets/theme/base/colors.js),
// adaptada a superficies oscuras.
export const brand = {
  blue: "#3b82f6",
  blueDark: "#0053D1",
  blueLight: "#60a5fa",
  cyan: "#0EE3E1",
  green: "#69F091",
  lime: "#BCFC3A",
  navy: "#0d1a35",
};

const colors = {
  background: {
    default: "#0d1a35",
    sidenav: "#132244",
    card: "#152C5B",
  },

  text: {
    main: "#ffffffcc",
    focus: "#ffffffcc",
  },

  transparent: {
    // Must stay a parseable color: MUI v7 runs alpha() over every palette entry's
    // `main` when generating component variants, and the keyword "transparent" throws.
    main: "rgba(0, 0, 0, 0)",
  },

  white: {
    main: "#ffffff",
    focus: "#ffffff",
  },

  black: {
    light: "#000000",
    main: "#000000",
    focus: "#000000",
  },

  primary: {
    main: brand.blue,
    focus: brand.blueLight,
  },

  secondary: {
    main: "#8f9bb3",
    focus: "#a6b1c5",
  },

  info: {
    main: brand.blue,
    focus: brand.blueLight,
  },

  success: {
    main: "#0e9f6e",
    focus: "#10b981",
  },

  warning: {
    main: "#f59e0b",
    focus: "#fbbf24",
  },

  error: {
    main: "#e02424",
    focus: "#ef4444",
  },

  light: {
    main: "#f0f2f566",
    focus: "#f0f2f566",
  },

  dark: {
    main: "#344767",
    focus: "#2c3c58",
  },

  grey: {
    100: "#f8f9fa",
    200: "#f0f2f5",
    300: "#dee2e6",
    400: "#ced4da",
    500: "#adb5bd",
    600: "#6c757d",
    700: "#495057",
    800: "#343a40",
    900: "#212529",
  },

  gradients: {
    brand: {
      main: brand.cyan,
      state: brand.lime,
    },

    primary: {
      main: brand.blueLight,
      state: brand.blue,
    },

    secondary: {
      main: "#747b8a",
      state: "#495361",
    },

    info: {
      main: brand.blueLight,
      state: brand.blue,
    },

    success: {
      main: "#66BB6A",
      state: "#43A047",
    },

    warning: {
      main: "#FFA726",
      state: "#FB8C00",
    },

    error: {
      main: "#EF5350",
      state: "#E53935",
    },

    light: {
      main: "#EBEFF4",
      state: "#CED4DA",
    },

    dark: {
      main: "#323a54",
      state: "#1a2035",
    },
  },

  socialMediaColors: {
    facebook: {
      main: "#3b5998",
      dark: "#344e86",
    },

    twitter: {
      main: "#55acee",
      dark: "#3ea1ec",
    },

    instagram: {
      main: "#125688",
      dark: "#0e456d",
    },

    linkedin: {
      main: "#0077b5",
      dark: "#00669c",
    },

    pinterest: {
      main: "#cc2127",
      dark: "#b21d22",
    },

    youtube: {
      main: "#e52d27",
      dark: "#d41f1a",
    },

    vimeo: {
      main: "#1ab7ea",
      dark: "#13a3d2",
    },

    slack: {
      main: "#3aaf85",
      dark: "#329874",
    },

    dribbble: {
      main: "#ea4c89",
      dark: "#e73177",
    },

    github: {
      main: "#24292e",
      dark: "#171a1d",
    },

    reddit: {
      main: "#ff4500",
      dark: "#e03d00",
    },

    tumblr: {
      main: "#35465c",
      dark: "#2a3749",
    },
  },

  badgeColors: {
    primary: {
      background: "#d6e4ff",
      text: "#0043a8",
    },

    secondary: {
      background: "#e2e6ee",
      text: "#48566d",
    },

    info: {
      background: "#d6e4ff",
      text: "#0043a8",
    },

    success: {
      background: "#cdf3e4",
      text: "#036249",
    },

    warning: {
      background: "#fdeac6",
      text: "#8a5a06",
    },

    error: {
      background: "#fcdcdc",
      text: "#b01b1b",
    },

    light: {
      background: "#ffffff",
      text: "#5a6a85",
    },

    dark: {
      background: "#d5deef",
      text: "#152c5b",
    },
  },

  coloredShadows: {
    primary: "#0053d1",
    secondary: "#5a6a85",
    info: "#0053d1",
    success: "#047857",
    warning: "#f59e0b",
    error: "#e02424",
    light: "#adb5bd",
    dark: "#152c5b",
  },

  inputBorderColor: "#d2d6da",

  tabs: {
    indicator: { boxShadow: "#ddd" },
  },
};

export default colors;

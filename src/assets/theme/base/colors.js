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

/**
 * Paleta de marca Macak, extraída del logo:
 *   azul wordmark  #0053D1
 *   degradado del ícono: cyan #0EE3E1 → verde #69F091 → lima #BCFC3A
 *
 * Los tonos cyan/verde/lima son muy claros (contraste ~1.5 con texto blanco), así que
 * se usan solo como acentos decorativos o con texto oscuro encima, nunca como fondo
 * de un botón con texto blanco. Para eso está el azul de marca (contraste 6.65).
 */
export const brand = {
  blue: "#0053D1",
  blueDark: "#003FA3",
  blueLight: "#0B6BE8",
  cyan: "#0EE3E1",
  green: "#69F091",
  lime: "#BCFC3A",
  navy: "#152C5B",
};

const colors = {
  background: {
    default: "#f4f6fb",
    card: "#ffffff",
  },

  text: {
    // Subido desde #7b809a, que sobre el fondo claro daba 3.69 de contraste (< 4.5).
    main: "#5a6a85",
    focus: "#5a6a85",
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
    focus: brand.blueDark,
  },

  secondary: {
    main: "#5a6a85",
    focus: "#48566d",
  },

  info: {
    main: brand.blue,
    focus: brand.blueDark,
  },

  // Verde oscurecido respecto al del logo para que el texto blanco encima sea legible
  // (5.48 de contraste). El verde y el lima del logo viven en `gradients.brand`.
  success: {
    main: "#047857",
    focus: "#036249",
  },

  warning: {
    main: "#f59e0b",
    focus: "#d97f06",
  },

  error: {
    main: "#e02424",
    focus: "#c01d1d",
  },

  light: {
    main: "#eef1f7",
    focus: "#e4e8f0",
  },

  dark: {
    main: brand.navy,
    focus: "#0f2047",
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
    // El degradado del ícono del logo. Decorativo: solo con texto oscuro encima.
    brand: {
      main: brand.cyan,
      state: brand.lime,
    },

    primary: {
      main: brand.blueLight,
      state: brand.blue,
    },

    secondary: {
      main: "#6b7a94",
      state: "#48566d",
    },

    // Ambos extremos son lo bastante oscuros para mantener el texto blanco legible.
    info: {
      main: brand.blueLight,
      state: brand.blue,
    },

    success: {
      main: "#0e9f6e",
      state: "#047857",
    },

    warning: {
      main: "#fbbf24",
      state: "#f59e0b",
    },

    error: {
      main: "#ef4444",
      state: "#e02424",
    },

    light: {
      main: "#eef1f7",
      state: "#dde3ed",
    },

    dark: {
      main: "#1e3a70",
      state: brand.navy,
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

  inputBorderColor: "#d5dce8",

  tabs: {
    indicator: { boxShadow: "#ddd" },
  },
};

export default colors;

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav } from "context";
import Sidenav from "examples/Sidenav";
import GlobalLoadingBar from "examples/GlobalLoadingBar";
import brandWhite from "assets/images/macak.png";
import brandDark from "assets/images/macak.png";

function getRoutes(allRoutes, authToken) {
  return allRoutes.flatMap((route) => {
    if (route.collapse) return getRoutes(route.collapse, authToken);
    if (!route.route) return [];
    const key = route.key || route.route;
    const el =
      route.route !== "/authentication/sign-in"
        ? authToken
          ? route.component
          : <Navigate to="/authentication/sign-in" />
        : route.component;
    return <Route path={route.route} element={el} key={key} />;
  });
}

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, layout, sidenavColor, transparentSidenav, whiteSidenav, darkMode } =
    controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  // Read synchronously on first render: reading it in an effect made the very first
  // render see `null` and redirect to sign-in before the token was ever loaded,
  // which logged the user out on every page refresh.
  const [authToken] = useState(() => localStorage.getItem("authToken"));

  const { pathname } = useLocation();

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      <GlobalLoadingBar />
      {layout === "resumen" && (
        <Sidenav
          color={sidenavColor}
          brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
          brandName="Macak"
          routes={routes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}
      <Routes>
        {getRoutes(routes, authToken)}
        <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
      </Routes>
    </ThemeProvider>
  );
}

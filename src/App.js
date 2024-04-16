import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";
import { CacheProvider } from "@emotion/react";
import routes from "routes";
import { useAuth } from 'context/authProvider';
import { useMaterialUIController, setMiniSidenav } from "context";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, direction, layout, sidenavColor, transparentSidenav, whiteSidenav, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  //const { authToken, userId, managerAdminUserId } = useAuth();
  const [authToken, setAuthToken ] = useState(null);
  
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
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    async function checkAuthentication(){
      let jwtoken = await localStorage.getItem('authToken');
      setAuthToken(jwtoken);
    };
    checkAuthentication();
  },[setAuthToken]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const isAuthenticated = !!authToken;

  function getRoutes(allRoutes, authToken) {
    return allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse, authToken);
      }
      if (route.route) {
        if (route.route !== "/authentication/sign-in") {
          if (!authToken && route.route === "/resumen") {
            return null;
          }
          return <Route exact path={route.route} element={authToken ? route.component : <Navigate to="/authentication/sign-in" />} key={route.key} />;
        }
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }
      return null;
    });
  }

  return direction === "rtl" ? (
    <CacheProvider>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "resumen" && (
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="Token NFC"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(routes, authToken)}
          <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "resumen" && (
        <Sidenav
          color={sidenavColor}
          brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
          brandName="Virtual Cash"
          routes={routes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes, authToken)}
        <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
      </Routes>
    </ThemeProvider>
  );
}
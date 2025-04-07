import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// @mui/material
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

// Componentes del dashboard
import MDBox from "components/MDBox";
import Breadcrumbs from "examples/Breadcrumbs";

// Estilos
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Contexto
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
} from "context";
import { useAuth } from "context/authProvider";

import "css/styles.css";

function DashboardNavbar({ absolute, light, isMini, main_title }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;
  const route = useLocation().pathname.split("/").slice(1);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(
        dispatch,
        (fixedNavbar && window.scrollY === 0) || !fixedNavbar
      );
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

  const handleLogoutConfirm = () => {
    logout();
    setOpenDialog(false);
    navigate("/authentication/sign-in");
  };

  const iconsStyle = ({
    palette: { dark, white, text },
    functions: { rgba },
  }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;
      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }
      return colorValue;
    },
  });

  return (
    <>
      <AppBar
        position={absolute ? "absolute" : navbarType}
        color="inherit"
        sx={(theme) =>
          navbar(theme, { transparentNavbar, absolute, light, darkMode })
        }
      >
        <Toolbar sx={(theme) => navbarContainer(theme)}>
          <MDBox
            color="inherit"
            mb={{ xs: 1, md: 0 }}
            sx={(theme) => navbarRow(theme, { isMini })}
          >
            <Breadcrumbs
              icon="home"
              title={main_title}
              route={route}
              light={light}
            />
          </MDBox>

          {!isMini && (
            <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
              <MDBox color={light ? "white" : "inherit"}>
                <button
                  className="logout-button"
                  onClick={() => setOpenDialog(true)}
                >
                  <Icon sx={{ alignSelf: "center", color: "white" }}>
                    logout
                  </Icon>
                  &nbsp; Cerrar Sesión
                </button>

                <IconButton
                  size="large"
                  disableRipple
                  color="inherit"
                  sx={navbarMobileMenu}
                  onClick={handleMiniSidenav}
                >
                  <Icon sx={iconsStyle} fontSize="medium">
                    {miniSidenav ? "menu_open" : "menu"}
                  </Icon>
                </IconButton>
              </MDBox>
            </MDBox>
          )}
        </Toolbar>
      </AppBar>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>¿Estás seguro de que quieres cerrar sesión?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleLogoutConfirm} color="warning" autoFocus >
            Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;

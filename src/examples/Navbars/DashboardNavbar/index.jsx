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

// Componentes del dashboard
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
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

function DashboardNavbar({ absolute = false, light = false, isMini = false, main_title, onPrint = null }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;
  const route = useLocation().pathname.split("/").slice(1);
  // Se lee en cada render para que refleje el evento actual sin estado extra.
  const eventName = localStorage.getItem("eventName") || "";
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
        sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
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
              <MDBox color={light ? "white" : "inherit"} display="flex" alignItems="center" gap={1}>

                {/* Evento activo. Antes vivía en la cabecera del sidenav, donde se
                    partía en varias líneas al colapsarlo. */}
                {eventName && (
                  <MDBox
                    display={{ xs: "none", md: "flex" }}
                    alignItems="center"
                    gap={0.75}
                    mr={1}
                    px={1.5}
                    py={0.75}
                    sx={({ palette, borders }) => ({
                      borderRadius: borders.borderRadius.lg,
                      backgroundColor: palette.grey[100],
                      border: `1px solid ${palette.grey[300]}`,
                      maxWidth: 260,
                    })}
                  >
                    <Icon fontSize="small" sx={{ color: "info.main" }}>
                      event
                    </Icon>
                    <MDTypography
                      variant="button"
                      fontWeight="semiBold"
                      color="dark"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.6,
                      }}
                      title={eventName}
                    >
                      {eventName}
                    </MDTypography>
                  </MDBox>
                )}

                {/* Botón imprimir — solo aparece si se pasa onPrint */}
                {onPrint && (
                  <MDButton
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={onPrint}
                    startIcon={<Icon>download</Icon>}
                  >
                    Descargar PDF
                  </MDButton>
                )}

                <MDButton
                  variant="gradient"
                  color="info"
                  size="small"
                  onClick={() => setOpenDialog(true)}
                  startIcon={<Icon>logout</Icon>}
                >
                  Cerrar sesión
                </MDButton>

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

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: { xs: "auto", sm: 380 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <MDTypography variant="h6" fontWeight="semiBold" color="dark">
            Cerrar sesión
          </MDTypography>
          <MDTypography variant="button" color="text" fontWeight="regular">
            ¿Seguro que quieres salir del panel?
          </MDTypography>
        </DialogTitle>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <MDButton variant="text" color="secondary" onClick={() => setOpenDialog(false)}>
            Cancelar
          </MDButton>
          <MDButton variant="gradient" color="error" onClick={handleLogoutConfirm}>
            Cerrar sesión
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  onPrint: PropTypes.func,
};

export default DashboardNavbar;

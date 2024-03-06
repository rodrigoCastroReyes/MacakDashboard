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

import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
//import Menu from "@mui/material/Menu";
//import MenuItem from "@mui/material/MenuItem";
//import ListItemIcon from "@mui/material/ListItemIcon";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
//import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
//import Item from "examples/Items/Item";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
} from "context";
import { useAuth } from "context/authProvider";
import "css/styles.css";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;
  //const [openMenu, setOpenMenu] = useState(false);
  //const [openAccountMenu, setOpenAccountMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);
  const { logout } = useAuth();

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(
        dispatch,
        (fixedNavbar && window.scrollY === 0) || !fixedNavbar
      );
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  //const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  //const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  //const handleCloseMenu = () => setOpenMenu(false);
  //const handleOpenAccountMenu = (event) =>
    //setOpenAccountMenu(event.currentTarget);
  //const handleCloseAccountMenu = () => setOpenAccountMenu(false);

  const handleLogout = () => {
    logout(); // Llamar a la función de logout
    console.log("Cerrando sesion");
  };

  // Render the notifications menu
  {
    /*const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <Item icon={<Icon>email</Icon>} title="Check new messages" />
      <Item icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
      <Item icon={<Icon>shopping_cart</Icon>} title="Payment successfully completed" />
    </Menu>
    );

  const renderAccountMenu = () => (
    <Menu
      anchorEl={openAccountMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openAccountMenu)}
      onClose={handleCloseAccountMenu}
      sx={{ mt: 2 }}
    >
      <Link to="/profile">
        <MenuItem onClick={handleCloseAccountMenu}> <ListItemIcon>
          <Icon lineHeight={0.75}>person_search</Icon>
        </ListItemIcon>View Profile</MenuItem>
    </Link>
      <Link to="/authentication/sign-in">
        <MenuItem onClick={handleLogout}>
          {" "}
          <ListItemIcon>
            <Icon lineHeight={0.75}>logout</Icon>
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Link>
    </Menu>
  );*/}

  // Styles for the navbar icons
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
            title={route[route.length - 1]}
            route={route}
            light={light}
          />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox color={light ? "white" : "inherit"}>
              <Link to="/authentication/sign-in">
                <MDButton
                  
                  variant="contained"
                  color="info"
                  fontFamily="montserrat-semibold"
                  onClick={handleLogout}
                >
                  <Icon>logout</Icon>&nbsp; Cerrar Sesión
                </MDButton>
              </Link>
              {/*<IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                aria-controls="profile-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenAccountMenu}
              >
                  <Icon sx={iconsStyle}>account_circle</Icon>
                </IconButton>
        {renderAccountMenu()}*/}
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              {/*<IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                aria-controls="notification-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenMenu}
              >
              <Icon sx={iconsStyle}>notifications</Icon>
              </IconButton>
        {renderMenu()}*/}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;

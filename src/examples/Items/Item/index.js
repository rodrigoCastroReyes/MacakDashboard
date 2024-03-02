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

import { forwardRef } from "react";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// custom styles for the NotificationItem
import menuItem from "examples/Items/Item/styles";

const Item = forwardRef(({ icon, title, to, ...rest }, ref) => (
  <MenuItem {...rest} ref={ref} sx={(theme) => menuItem(theme)}>
    <MDBox py={0.5} display="flex" alignItems="center" lineHeight={1}>
      <MDTypography component={Link} to ={to}variant="body1" color="secondary" lineHeight={0.75}>
        {icon}
      </MDTypography>
      <MDTypography variant="button" fontWeight="regular" sx={{ ml: 1 }}>
        {title}
      </MDTypography>
    </MDBox>
  </MenuItem>
));

// Typechecking props for the Item
Item.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

export default Item;

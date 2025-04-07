// react-router-dom components
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import 'css/styles.css';

function Breadcrumbs({ icon, title, route, light }) {
  const routes = route.slice(0, -1);

  const routeLabels = {
    "attender-details": "Asistentes",
  };

  return (
    <MDBox mr={{ xs: 0, xl: 8 }}>
      <MuiBreadcrumbs
        sx={{
          "& .MuiBreadcrumbs-separator": {
            color: ({ palette: { white, grey } }) => (light ? white.main : grey[600]),
          },
        }}
      >
        {/* Ícono Home clickeable */}
        <Link to="/resumen">
          <MDTypography
            component="span"
            variant="body2"
            color={light ? "white" : "dark"}
            opacity={light ? 0.8 : 0.5}
            sx={{ lineHeight: 0 }}
          >
            <Icon>{icon}</Icon>
          </MDTypography>
        </Link>

        {/* Segmentos intermedios no clickeables */}
        {routes.map((el) => (
          <MDTypography
            key={el}
            component="span"
            variant="button"
            fontWeight="regular"
            fontFamily="montserrat"
            textTransform="capitalize"
            color={light ? "white" : "dark"}
            opacity={light ? 0.8 : 0.5}
            sx={{ lineHeight: 0 }}
          >
            {routeLabels[el] || el}
          </MDTypography>
        ))}

        {/* Último segmento (título actual de la página) */}
        <MDTypography
          variant="button"
          fontWeight="regular"
          fontFamily="montserrat"
          textTransform="capitalize"
          color={light ? "white" : "dark"}
          sx={{ lineHeight: 0 }}
        >
          {title}
        </MDTypography>
      </MuiBreadcrumbs>

      {/* Título grande debajo del breadcrumb */}
      <MDTypography
        fontWeight="bold"
        textTransform="capitalize"
        variant="h6"
        fontFamily="montserrat-semibold"
        fontSize="20px"
        color={light ? "white" : "dark"}
        noWrap
      >
        {title}
      </MDTypography>
    </MDBox>
  );
}

// Default props
Breadcrumbs.defaultProps = {
  light: false,
};

// Prop types
Breadcrumbs.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  light: PropTypes.bool,
};

export default Breadcrumbs;

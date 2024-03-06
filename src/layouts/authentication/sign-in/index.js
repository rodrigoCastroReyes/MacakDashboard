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

import { useState } from "react";

// react-router-dom components
import { Navigate } from "react-router-dom";
import { useAuth } from 'context/authProvider';

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

import "css/styles.css";

function Basic() {
   const { login } = useAuth(); // Utilizar la función useAuth para acceder a la función login del AuthProvider
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password); // Llamar a la función login del AuthProvider con las credenciales
      setError('');
      setLoggedIn(true);
      console.log('Inicio de sesión exitoso'); 

    } catch (error) {
      setError('Credenciales incorrectas. Inténtalo de nuevo.'); // Manejar el error de inicio de sesión
    }
  };

  const alertContent = (errorText) => (
    <MDTypography variant="body2" fontFamily="poppins" fontSize="12px" color="white">
      {errorText}
    </MDTypography>
  );

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  if (loggedIn) {
    return <Navigate to="/resumen" />;
  }

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" fontFamily="montserrat-semibold" color="white" mt={1}>
            Inicio de sesión
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
        <form onSubmit={handleSubmit}>
          <MDBox mb={2}>
            <MDInput type="text" label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required={true} fullWidth />
          </MDBox>
          <MDBox mb={2}>
            <MDInput type={showPassword ? "text" : "password"} label="Contraseña" value={password}
            onChange={(e) => setPassword(e.target.value)} InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }} required={true} fullWidth />
          </MDBox>
          <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fontFamily="montserrat" onClick={handleSubmit} fullWidth>
                Iniciar sesión
              </MDButton>
            </MDBox>
            {error && <MDAlert color="error" dismissible>
                  {alertContent(error)}
                </MDAlert>}
          </form>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;

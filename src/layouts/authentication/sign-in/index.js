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

import { useEffect, useState } from "react";

// react-router-dom components
import { useAuth } from 'context/authProvider';
import { useNavigate } from 'react-router-dom';

// @mui material components
import Card from "@mui/material/Card";
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
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario ya está autenticado (isAuthenticated del contexto), redirigir
    if (isAuthenticated) {
      navigate('/resumen');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowError(false);
    try {
      const response = await login(username, password);
      console.log("Respuesta del login:", response);
      if (response && response === "manager_admin") {
        // Esperar a que el token esté en localStorage antes de navegar
        setUsername('');
        setPassword('');
        setTimeout(() => {
          navigate("/resumen");
        }, 100); // pequeño delay para asegurar persistencia
      } else if (response && response !== "manager_admin") {
        setError("Solo los organizadores del evento pueden iniciar sesión.");
        setShowError(true);
      } else {
        setError("Credenciales incorrectas. Inténtalo de nuevo.");
        setShowError(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("Contraseña incorrecta. Por favor, revisa tus credenciales.");
        setShowError(true);
      } else {
        setError("Error al intentar iniciar sesión. Por favor, inténtalo de nuevo.");
        setShowError(true);
      }
    }
  };
  // Ocultar el error automáticamente después de unos segundos
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
        setError('');
      }, 4000); // 4 segundos
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const alertContent = (errorText) => (
    <MDTypography variant="body2" fontFamily="poppins" fontSize="12px" color="white">
      {errorText}
    </MDTypography>
  );

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDTypography variant="h4" component="div" align="center" fontWeight="medium" fontFamily="montserrat" mt={1}>
        </MDTypography>
        <MDBox pt={4} pb={3} px={3}>
          <form onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={true}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
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
                }}
                required={true}
                fullWidth
              />
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" type="submit" fullWidth>
                Iniciar sesión
              </MDButton>
            </MDBox>
            {showError && error && (
              <MDAlert color="error">
                {alertContent(error)}
              </MDAlert>
            )}
          </form>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
import { useEffect, useState } from "react";

import { useAuth } from "context/authProvider";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

import BasicLayout from "layouts/authentication/components/BasicLayout";

import macakLogo from "assets/images/macak.png";

import "css/styles.css";

function Basic() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/resumen");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowError(false);
    setSubmitting(true);
    try {
      const response = await login(username, password);
      if (response && response === "manager_admin") {
        setUsername("");
        setPassword("");
        setTimeout(() => {
          navigate("/resumen");
        }, 100); // pequeño delay para asegurar la persistencia del token
      } else if (response && response !== "manager_admin") {
        setError("Solo los organizadores del evento pueden iniciar sesión.");
        setShowError(true);
      } else {
        setError("Credenciales incorrectas. Inténtalo de nuevo.");
        setShowError(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Contraseña incorrecta. Por favor, revisa tus credenciales.");
        setShowError(true);
      } else {
        setError("Error al intentar iniciar sesión. Por favor, inténtalo de nuevo.");
        setShowError(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
        setError("");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  return (
    <BasicLayout>
      <MDBox display="flex" justifyContent="center" mb={3}>
        <MDBox
          component="img"
          src={macakLogo}
          alt="Macak event solutions"
          sx={{ height: { xs: 38, sm: 44 }, width: "auto" }}
        />
      </MDBox>

      <Card sx={{ borderRadius: 3, boxShadow: "0 12px 40px rgba(21, 44, 91, 0.10)" }}>
        {/* Filo superior con el degradado del ícono del logo */}
        <MDBox
          sx={{
            height: 4,
            background: "linear-gradient(90deg, #0EE3E1 0%, #69F091 50%, #BCFC3A 100%)",
          }}
        />

        <MDBox px={{ xs: 3, sm: 4 }} pt={4} pb={4}>
          <MDTypography variant="h4" fontWeight="semiBold" color="dark" textAlign="center">
            Bienvenido
          </MDTypography>
          <MDTypography variant="button" color="text" textAlign="center" display="block" mt={0.5}>
            Ingresa tus credenciales para acceder al panel
          </MDTypography>

          <MDBox component="form" onSubmit={handleSubmit} mt={4}>
            <MDBox mb={2.5}>
              <MDInput
                type="text"
                label="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
                autoComplete="username"
              />
            </MDBox>

            <MDBox mb={1}>
              <MDInput
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </MDBox>

            <Collapse in={showError && Boolean(error)}>
              <MDBox mt={2}>
                <MDAlert color="error" dismissible={false}>
                  <MDTypography variant="caption" color="white" fontWeight="medium">
                    {error}
                  </MDTypography>
                </MDAlert>
              </MDBox>
            </Collapse>

            <MDBox mt={3.5}>
              <MDButton
                variant="gradient"
                color="info"
                size="large"
                type="submit"
                fullWidth
                disabled={submitting}
              >
                {submitting ? "Ingresando…" : "Iniciar sesión"}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      <MDTypography variant="caption" color="text" textAlign="center" display="block" mt={3}>
        Macak event solutions
      </MDTypography>
    </BasicLayout>
  );
}

export default Basic;

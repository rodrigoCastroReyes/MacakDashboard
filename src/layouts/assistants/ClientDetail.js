import React from "react";
import { useParams } from "react-router-dom";
import { Card, Box, Typography } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Importar los datos de los clientes
import clientsData from 'layouts/assistants/clients.json'; // Asegúrate de que la ruta sea correcta

const ClientDetail = () => {
  // Obtener el ID del cliente desde los parámetros de la URL
  const { id } = useParams();
  
  // Buscar el cliente que corresponde al ID
  const client = clientsData.find(client => client.id === parseInt(id));

  if (!client) {
    return (
      <Box>
        <Typography variant="h5">Cliente no encontrado</Typography>
      </Box>
    );
  }

  return (
    <MDBox pt={3} pr={2} pl={2} pb={3}>
      <Card sx={{ padding: 3 }}>
        <MDTypography variant="h4">Detalles del Cliente</MDTypography>
        <MDBox mt={2}>
          <Typography variant="h6">ID: {client.id}</Typography>
          <Typography variant="h6">Nombre: {client.name}</Typography>
          <Typography variant="h6">Tokens:</Typography>
          <ul>
            {client.tokens.map((token, index) => (
              <li key={index}>
                <Typography variant="body1">{token}</Typography>
              </li>
            ))}
          </ul>
        </MDBox>
      </Card>
    </MDBox>
  );
};

export default ClientDetail;

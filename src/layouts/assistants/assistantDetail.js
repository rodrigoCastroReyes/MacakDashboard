import React from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Card, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const ClientDetail = () => {
  const { clientId } = useParams(); // Obtiene el ID del cliente desde la URL

  const ClientList = () => {
    const clients = [
      { id: 1, name: "Maria", tokens: ["AB12CD34", "EF56GH78"] },
      { id: 2, name: "Jose", tokens: ["IJ90KL12", "MN34OP56"] },
      { id: 3, name: "Pamela", tokens: ["28EJTS96", "UV12WX34", "YZ56AB78"] },
      { id: 4, name: "Roberta", tokens: ["CD12EF34"] },
      { id: 5, name: "Karen", tokens: ["GH56IJ78", "KL90MN12", "OP34QR56"] },
      { id: 6, name: "Ricardo", tokens: ["RS12TU34", "VW56XY78"] },
      { id: 7, name: "Pedro", tokens: ["YZ34AB56"] },
      { id: 8, name: "Isaac", tokens: ["CD78EF90", "GH12IJ34", "KL56MN78"] },
      { id: 9, name: "Thiago", tokens: ["OP34QR56", "ST78UV90"] },
      { id: 10, name: "Martin", tokens: ["WX12YZ34", "AB56CD78", "EF90GH12"] },
      { id: 11, name: "Ana", tokens: ["LM12OP34", "PQ56RS78"] },
      { id: 12, name: "Luis", tokens: ["TU12VW34", "XY56ZA78"] },
      { id: 13, name: "Sofia", tokens: ["GH34IJ56", "KL78MN90"] },
      { id: 14, name: "Carlos", tokens: ["AB34CD56"] },
      { id: 15, name: "Gabriela", tokens: ["IJ12KL34", "MN56OP78"] },
      { id: 16, name: "Marifer", tokens: ["ST12UV34", "WX56YZ78"] },
      { id: 17, name: "Valentina", tokens: ["PQ12RS34"] },
      { id: 18, name: "Jorge", tokens: ["AB78CD90", "EF12GH34"] },
      { id: 19, name: "Emilia", tokens: ["IJ90KL12", "MN34OP56", "TU56VW78"] },
      { id: 20, name: "Hector", tokens: ["QR12ST34", "UV56WX78"] },
      { id: 21, name: "Julia", tokens: ["YZ12AB34", "CD56EF78"] },
      { id: 22, name: "Raul", tokens: ["GH34IJ56", "KL78MN90", "EF78GH90"] }
    ];

  // Encuentra el cliente correspondiente al ID
  const client = clients.find(client => client.id === parseInt(clientId));

  return (
    <DashboardLayout>
      <DashboardNavbar main_title="Detalle del Cliente" />
      <Box sx={{ padding: 3 }}>
        {client ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h5">{client.name}</Typography>
                <Typography variant="body1">Tokens:</Typography>
                <ul>
                  {client.tokens.map((token, index) => (
                    <li key={index}>{token}</li>
                  ))}
                </ul>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="h6">Cliente no encontrado</Typography>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default ClientDetail;

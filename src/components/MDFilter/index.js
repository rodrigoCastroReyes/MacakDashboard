import React, { useState, useEffect } from "react";
import { FormGroup, FormControlLabel, Checkbox, Typography } from "@mui/material";

const Filtro = ({ onFilterChange }) => {
  const [selected, setSelected] = useState({
    activacion: true,
    carga: true,
    compra: true,
  });

  useEffect(() => {
    onFilterChange(selected);
  }, []);

  const handleChange = (event) => {
    const { name, checked } = event.target;
    const newSelected = { ...selected, [name]: checked };
    setSelected(newSelected);
    onFilterChange(newSelected);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>
        Filtrar por:
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              name="activacion"
              checked={selected.activacion}
              onChange={handleChange}
            />
          }
          label="Activación"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="carga"
              checked={selected.carga}
              onChange={handleChange}
            />
          }
          label="Carga"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="compra"
              checked={selected.compra}
              onChange={handleChange}
            />
          }
          label="Compra"
        />
      </FormGroup>
    </div>
  );
};

export default Filtro;

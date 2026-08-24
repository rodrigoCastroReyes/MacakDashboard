import React, { useState, useEffect } from "react";
import { FormGroup, FormControlLabel, Checkbox, Typography } from "@mui/material";

const Filter = ({ onFilterChange }) => {
  const [selected, setSelected] = useState({
    activation: true,
    recharge: true,
    purchase: true,
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
              name="activation"
              checked={selected.activation}
              onChange={handleChange}
            />
          }
          label="Activación"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="recharge"
              checked={selected.recharge}
              onChange={handleChange}
            />
          }
          label="Carga"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="purchase"
              checked={selected.purchase}
              onChange={handleChange}
            />
          }
          label="Compra"
        />
      </FormGroup>
    </div>
  );
};

export default Filter;

import React, { useState, useRef } from "react";
import { Box, TextField, Button, DialogTitle, DialogContent, InputAdornment, IconButton, Typography } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';

import { API_BASE_URL } from "config";

const AddProductForm = ({ handleClose, storeId, onRefresh }) => {
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    img: "",
  });

  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (e.target.name === "img") {
      setFilePreview(null); // limpiar preview si se pega una URL
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        img: reader.result,
      }));
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      store_id: storeId,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al agregar el producto");

      console.log("Producto agregado exitosamente");
      handleClose();
      if (onRefresh) onRefresh();

    } catch (err) {
      console.error("Error en el POST:", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={2}>
      <DialogTitle>Agregar Nuevo Producto</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Descripción"
          name="description"
          value={formData.description}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Precio"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Imagen (URL o subir)"
          name="img"
          value={formData.img}
          onChange={handleChange}
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => fileInputRef.current.click()}>
                  <InsertPhotoIcon />
                  <Typography variant="caption" fontSize={11}>
                    Subir imagen
                  </Typography>
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Input file oculto */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />

        {filePreview && (
          <Box mt={2}>
            <Typography variant="caption">Vista previa:</Typography>
            <Box
              component="img"
              src={filePreview}
              alt="Preview"
              sx={{ height: 120, mt: 1, borderRadius: 1 }}
            />
          </Box>
        )}

        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button onClick={handleClose} sx={{ mr: 2 }}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar
          </Button>
        </Box>
      </DialogContent>
    </Box>
  );
};

export default AddProductForm;

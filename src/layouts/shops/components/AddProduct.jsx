import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  DialogTitle,
  DialogContent,
  InputAdornment,
  IconButton,
  Typography,
  Chip,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/material";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";

import { API_BASE_URL } from "config";
import productCatalog from "../../../assets/productCatalog.json";

const { CATEGORIES, FLAG_GROUPS } = productCatalog;

const AddProductForm = ({
  handleClose,
  storeId,
  onRefresh,
  existingProducts = [],
}) => {
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    img: "",
    category: "",
    flags: [],
  });
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  const [categoryTouched, setCategoryTouched] = useState(false);

  const fileInputRef = useRef(null);

  // 🔍 Validar duplicados en tiempo real
  useEffect(() => {
    const desc = formData.description.trim().toLowerCase();
    const exists = existingProducts.some(
      (p) =>
        typeof p.description === "string" &&
        p.description.trim().toLowerCase() === desc
    );
    if (desc && exists) {
      setDescriptionError("Ya existe un producto con esta descripción.");
    } else {
      setDescriptionError("");
    }
  }, [formData.description, existingProducts]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (e.target.name === "img") {
      setFilePreview(null);
    }
  };

  const handleCategorySelect = (value) => {
    setCategoryTouched(true);
    setFormData((prev) => ({
      ...prev,
      category: prev.category === value ? "" : value,
    }));
  };

  const handleFlagToggle = (flag) => {
    setFormData((prev) => {
      const current = prev.flags;
      const updated = current.includes(flag)
        ? current.filter((f) => f !== flag)
        : [...current, flag];
      return { ...prev, flags: updated };
    });
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

    if (!formData.category) {
      setCategoryTouched(true);
      return;
    }

    const payload = {
      description: formData.description,
      price: formData.price,
      img: formData.img,
      category: formData.category,
      ...(formData.flags.length > 0 && { flags: formData.flags }),
      store_id: storeId,
    };

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Desactivar botón de guardar si hay error o campos vacíos
  const isSaveDisabled =
    !formData.description.trim() ||
    !formData.price ||
    !formData.category ||
    !!descriptionError ||
    loading;

  const categoryError = categoryTouched && !formData.category;

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
          error={!!descriptionError}
          helperText={descriptionError || " "}
        />
        <TextField
          fullWidth
          label="Precio"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          margin="normal"
          error={!formData.price && formData.price !== ""}
          helperText={
            !formData.price && formData.price !== ""
              ? "El precio es obligatorio"
              : " "
          }
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

        {/* ── Categoría (obligatoria) ── */}
        <FormControl
          fullWidth
          margin="normal"
          error={categoryError}
        >
          <FormLabel
            sx={{
              mb: 1,
              fontWeight: 600,
              fontSize: "0.875rem",
              color: categoryError ? "error.main" : "text.secondary",
            }}
          >
            Categoría *
          </FormLabel>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.value}
                label={cat.label}
                clickable
                onClick={() => handleCategorySelect(cat.value)}
                color={formData.category === cat.value ? "primary" : "default"}
                variant={formData.category === cat.value ? "filled" : "outlined"}
                sx={{
                  fontWeight: formData.category === cat.value ? 600 : 400,
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </Box>
          <FormHelperText>
            {categoryError
              ? "Debes seleccionar una categoría"
              : " "}
          </FormHelperText>
        </FormControl>

        {/* ── Flags (opcionales) ── */}
        {FLAG_GROUPS.map((group) => (
          <FormControl
            key={group.groupLabel}
            fullWidth
            margin="dense"
          >
            <FormLabel
              sx={{
                mb: 0.5,
                fontWeight: 600,
                fontSize: "0.8rem",
                color: "text.secondary",
              }}
            >
              {group.groupLabel}
              <Typography
                component="span"
                variant="caption"
                sx={{ ml: 1, fontWeight: 400, color: "text.disabled" }}
              >
                (opcional)
              </Typography>
            </FormLabel>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {group.flags.map((f) => {
                const selected = formData.flags.includes(f.flag);
                return (
                  <Chip
                    key={f.flag}
                    label={f.label}
                    clickable
                    size="small"
                    onClick={() => handleFlagToggle(f.flag)}
                    color={selected ? "info" : "default"}
                    variant={selected ? "filled" : "outlined"}
                    sx={{
                      fontWeight: selected ? 600 : 400,
                      transition: "all 0.2s ease",
                    }}
                  />
                );
              })}
            </Box>
          </FormControl>
        ))}

        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button
            onClick={handleClose}
            sx={{ mr: 2 }}
            color="secondary"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" color="primary" disabled={isSaveDisabled}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </Box>
      </DialogContent>
    </Box>
  );
};

export default AddProductForm;

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  FormControl,
  FormLabel,
  Box,
  Typography,
} from "@mui/material";

import productCatalog from "../../../assets/productCatalog.json";
const { CATEGORIES, FLAG_GROUPS } = productCatalog;

const EditProductDialog = ({ open, product, onClose, onChange, onSave }) => {
  if (!product) return null;

  const handleCategorySelect = (value) => {
    onChange({ target: { name: "category", value } });
  };

  const handleFlagToggle = (flag) => {
    const currentFlags = product.flags || [];
    const updatedFlags = currentFlags.includes(flag)
      ? currentFlags.filter((f) => f !== flag)
      : [...currentFlags, flag];
    onChange({ target: { name: "flags", value: updatedFlags } });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Producto</DialogTitle>
      <DialogContent>
        <TextField
          label="Descripción"
          name="description"
          value={product.description || ""}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Precio"
          name="price"
          type="number"
          value={product.price || ""}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Imagen (URL)"
          name="img"
          value={product.img || ""}
          onChange={onChange}
          fullWidth
          margin="normal"
        />

        {/* ── Categoría ── */}
        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1, fontWeight: 600, fontSize: "0.875rem", color: "text.secondary" }}>
            Categoría
          </FormLabel>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.value}
                label={cat.label}
                clickable
                onClick={() => handleCategorySelect(cat.value)}
                color={product.category === cat.value ? "primary" : "default"}
                variant={product.category === cat.value ? "filled" : "outlined"}
                sx={{
                  fontWeight: product.category === cat.value ? 600 : 400,
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </Box>
        </FormControl>

        {/* ── Flags ── */}
        {FLAG_GROUPS.map((group) => (
          <FormControl key={group.groupLabel} fullWidth margin="dense">
            <FormLabel sx={{ mb: 0.5, fontWeight: 600, fontSize: "0.8rem", color: "text.secondary" }}>
              {group.groupLabel}
              <Typography component="span" variant="caption" sx={{ ml: 1, fontWeight: 400, color: "text.disabled" }}>
                (opcional)
              </Typography>
            </FormLabel>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {group.flags.map((f) => {
                const selected = (product.flags || []).includes(f.flag);
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSave} color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductDialog;

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const EditProductDialog = ({ open, product, onClose, onChange, onSave }) => {
  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Producto</DialogTitle>
      <DialogContent>
        <TextField
          label="Descripción"
          name="description"
          value={product.description}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Precio"
          name="price"
          type="number"
          value={product.price}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Imagen (URL)"
          name="img"
          value={product.img}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
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

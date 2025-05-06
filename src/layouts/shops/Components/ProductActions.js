import React from "react";
import { Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ProductActions = ({ product, onEdit, onDelete }) => (
  <Box display="flex" justifyContent="center" gap={1}>
    <IconButton title="Editar Producto" onClick={() => onEdit(product)}>
      <EditIcon fontSize="small" />
    </IconButton>
    <IconButton title="Eliminar Producto" onClick={() => onDelete(product)}>
      <DeleteIcon fontSize="small" sx={{ color: "red", opacity: 0.4 }} />
    </IconButton>
  </Box>
);

export default ProductActions;

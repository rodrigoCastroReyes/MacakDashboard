import React from "react";
import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";

const ConfirmDeleteDialog = ({ open, onClose, onConfirm, productName }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        ¿Seguro que deseas eliminar {productName || "este producto"}?
      </DialogTitle>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} color="secondary">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;

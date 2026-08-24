import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";

import { API_BASE_URL } from "config";

const AddShop = ({ open, onClose, onRefresh, existingStores = [] }) => {
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧠 Validación automática mientras escribe
  useEffect(() => {
    const trimmed = storeName.trim().toLowerCase();
    const duplicate = existingStores.some(
      (store) => store.name.trim().toLowerCase() === trimmed
    );
    if (duplicate) {
      setError("Ya existe una tienda con ese nombre.");
    } else {
      setError("");
    }
  }, [storeName, existingStores]);

  const handleSave = async () => {
    const eventId = localStorage.getItem("eventId");

    const payload = {
      event_id: eventId,
      name: storeName,
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al agregar la tienda");

      if (onRefresh) onRefresh();
      onClose();
      setStoreName("");
    } catch (err) {
      console.error("Error en el POST:", err);
    } finally {
      setLoading(false);
    }
  };

  const isSaveDisabled = loading || !storeName.trim() || !!error;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Agregar Nueva Tienda</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Nombre de la Tienda"
            fullWidth
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            disabled={loading}
            error={!!error}
            helperText={error}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" disabled={isSaveDisabled}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddShop;

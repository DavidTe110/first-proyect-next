"use client";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress
} from "@mui/material";

interface Props {
  open: boolean;
  loading: boolean;           // 🟩 loading viene del padre
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  name?: string;
}

export default function DeleteConfirmDialog({
  open,
  loading,
  onClose,
  onConfirm,
  title = "Eliminar registro",
  message = "¿Estás seguro que deseas eliminar este elemento? Esta acción no se puede deshacer?",
  name = "",
}: Props) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText>{message}</DialogContentText>

        {name && (
          <p style={{ marginTop: 10, fontWeight: "bold" }}>
            Producto: <span style={{ color: "#d32f2f" }}>{name}</span>
          </p>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="error"
          disabled={loading}
          onClick={onConfirm}
          startIcon={
            loading ? <CircularProgress color="inherit" size={18} /> : null
          }
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

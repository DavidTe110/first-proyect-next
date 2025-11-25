// QRModal.tsx
import React, { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import QRCode from "react-qr-code";
import * as htmlToImage from "html-to-image";

interface QRModalProps {
  open: boolean;
  value: string;       // texto / URL que quieres convertir a QR
  title?: string;
  onClose: () => void;
}

const QRModal = ({ open, value, title = "Código QR", onClose }:QRModalProps) => {
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      // Simulamos una pequeña carga para mostrar el spinner
      setLoading(true);
      const timeout = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timeout);
    } else {
      setLoading(true);
    }
  }, [open]);

  const handleDownloadPNG = async () => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(qrRef.current, {
        cacheBust: true,
        backgroundColor: "white",
      });

      const link = document.createElement("a");
      link.download = "qr-code.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error al generar PNG del QR:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        className: "rounded-2xl", // tailwind
      }}
    >
      <DialogTitle>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">{title}</span>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent>
        <div className="flex flex-col items-center justify-center py-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CircularProgress />
              <span className="text-sm text-gray-500">
                Generando código QR...
              </span>
            </div>
          ) : (
            <div
              ref={qrRef}
              className="bg-white p-4 rounded-xl shadow-md inline-block"
            >
              <QRCode value={value} size={200} />
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions>
        <div className="flex w-full justify-between gap-2 px-2 pb-2">
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={onClose}
          >
            Cerrar
          </Button>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleDownloadPNG}
            disabled={loading}
          >
            Descargar PNG
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default QRModal;

import React, { useEffect, useState } from "react";
import { useZxing } from "react-zxing";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";

interface ReadQRProps {
  open: boolean;
  onClose: () => void;
  onScan: (value: string) => void;   // 👈 callback al padre
}

const ReadQR: React.FC<ReadQRProps> = ({ open, onClose, onScan }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) setReady(false);
  }, [open]);

  const { ref } = useZxing(
    ready
      ? {
          onDecodeResult(result) {
            const qrValue = result.getText();
            console.log("QR detectado:", qrValue);

            onScan(qrValue); // 🔥 ENVÍA EL QR AL PADRE

            // opcional: cerrar después del escaneo
            // onClose();
          },
          constraints: {
            video: { facingMode: "environment" }
          }
        }
      : undefined
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{
        onEntered: () => setReady(true),
      }}
    >
      <DialogTitle className="text-center font-semibold">Escanear QR</DialogTitle>

      <DialogContent className="flex flex-col items-center">
        {ready && (
          <video
            ref={ref}
            className="w-full max-w-xs rounded-lg border border-gray-300"
          />
        )}
      </DialogContent>

      <DialogActions className="justify-center pb-4">
        <Button variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReadQR;

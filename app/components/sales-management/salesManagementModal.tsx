import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  DialogActions,
  Button
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  items: any[];
}

const SalesManagementModal = ({ open, onClose, items }: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalle de venta</DialogTitle>

      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Cant.</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Subtotal</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((it, idx) => (
              <TableRow key={idx}>
                <TableCell>{it.name}</TableCell>
                <TableCell>{it.quantity}</TableCell>
                <TableCell>S/ {it.price.toFixed(2)}</TableCell>
                <TableCell>S/ {it.subtotal.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>

      {/* BOTÓN CERRAR */}
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SalesManagementModal;

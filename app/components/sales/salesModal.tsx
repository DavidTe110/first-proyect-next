"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Button,
    TextField,
    CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface Product {
    id?: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    status: boolean;
    createdAt?: Date;
    active: boolean;
}
interface CartItem extends Product {

    quantity: number;
}

interface Props {
    open: boolean;
    cart: CartItem[];
    setCart: (value: CartItem[]) => void;
    onClose: () => void;
    onPurchase: () => void;
    loadingSales: boolean;
}

const SalesModal = ({ open, cart, setCart, onClose, onPurchase, loadingSales }: Props) => {

    const handleQuantity = (id: string, qty: number) => {
        if (qty < 1) return;

        setCart(cart.map((p) =>
            p.id === id ? { ...p, quantity: qty } : p
        ));
    };

    const handleDelete = (id: string) => {
        setCart(cart.filter((p) => p.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);


    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Carrito de compras</DialogTitle>

            <DialogContent dividers>
                {cart.length === 0 ? (
                    <p className="text-center py-4">El carrito está vacío.</p>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Producto</TableCell>
                                <TableCell>Precio</TableCell>
                                <TableCell>Cantidad</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Eliminar</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {cart.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>S/ {item.price}</TableCell>

                                    <TableCell>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleQuantity(item.id ?? "", Number(e.target.value))
                                            }
                                            inputProps={{ min: 1, className: "w-16" }}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        S/ {(item.price * item.quantity).toFixed(2)}
                                    </TableCell>

                                    <TableCell>
                                        <IconButton color="error" onClick={() => handleDelete(item.id ?? "")}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>

            <DialogActions>
                <div className="flex-1 text-lg font-bold px-4">
                    Total: S/ {total.toFixed(2)}
                </div>

                <Button onClick={onClose}>Cerrar</Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={cart.length === 0 || loadingSales}
                    onClick={onPurchase}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                    Finalizar compra
                    {loadingSales && <CircularProgress size={20} color="inherit" />}
                </Button>

            </DialogActions>
        </Dialog>
    );
};

export default SalesModal;

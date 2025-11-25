"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box,
    CircularProgress
} from "@mui/material";
import { useEffect, useState } from "react";

interface Product {
    id?: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    status: boolean;
    createdAt?: Date;
    active:boolean
}

interface Props {
    open: boolean;
    onClose: () => void;
    editingProduct: Product | null;
    onSave: (data: Product) => void;
    loading: boolean;
    categories: string[];
}

const ProductModal = ({
    open,
    onClose,
    editingProduct,
    onSave,
    loading,
    categories = []
}: Props) => {
    
    const [name, setName] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const [category, setCategory] = useState<string>("");
    const [stock, setStock] = useState<number>(0);
    const [status, setStatus] = useState<boolean>(true);

    // Cargar datos al abrir modal
    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name);
            setPrice(editingProduct.price);
            setCategory(editingProduct.category);
            setStock(editingProduct.stock);
            setStatus(editingProduct.status);
        } else {
            setName("");
            setPrice(0);
            setCategory("");
            setStock(0);
            setStatus(true);
        }
    }, [editingProduct]);

    // Guardar producto
    const handleSave = (e: any) => {
        e.preventDefault();

        const product: Product = {
            id: editingProduct?.id, // si edita → se envía el ID
            name,
            price,
            category,
            stock,
            status,
            active : true
        };

        onSave(product);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle className="font-semibold">
                {editingProduct ? "Editar Producto" : "Agregar Producto"}
            </DialogTitle>

            <form onSubmit={handleSave}>
                <DialogContent className="space-y-4 mt-3">

                    {/* Nombre */}
                    <Box>
                        <TextField
                            label="Nombre"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Box>

                    {/* Precio */}
                    <Box>
                        <TextField
                            label="Precio"
                            type="number"
                            fullWidth
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                    </Box>

                    {/* Categoría */}
                    <Box>
                        <TextField
                            select
                            fullWidth
                            label="Seleccionar categoría"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map((cat: string) => (
                                <MenuItem key={cat} value={cat}>
                                    {cat}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    {/* Stock */}
                    <Box>
                        <TextField
                            label="Stock"
                            type="number"
                            fullWidth
                            value={stock}
                            onChange={(e) => setStock(Number(e.target.value))}
                        />
                    </Box>

                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>

                    <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Guardar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ProductModal;

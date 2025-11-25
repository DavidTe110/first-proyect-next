"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import SalesTable from "../../components/sales/salesTales";
import { Alert, Box, Button, Snackbar } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SalesModal from "@/app/components/sales/salesModal";
import ReadQR from "@/app/components/sales/readQr";

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

const Sales = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
    const [cart, setCart] = useState<CartItem[]>([]);

    // MODALES
    const [openCartModal, setOpenCartModal] = useState<boolean>(false);
    const [openQRModal, setOpenQRModal] = useState<boolean>(false);

    // SNACKBAR
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<
        "success" | "error" | "warning" | "info"
    >("success");

    // ======================================
    // CARGAR PRODUCTOS
    // ======================================
    useEffect(() => {
        const ref = collection(db, "products");
        const q = query(ref, where("active", "==", true));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Product[];

            setProducts(list);
            setLoadingProducts(false);
        });

        return () => unsubscribe();
    }, []);

    // ======================================
    // AÑADIR AL CARRITO
    // ======================================
    const handleAddCar = (product: Product) => {
        setCart((prev: CartItem[]) => {
            const exist = prev.find((p) => p.id === product.id);

            if (exist) {
                return prev.map((p) =>
                    p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
                );
            }

            return [...prev, { ...product, quantity: 1 }];
        });

        setSnackbarMessage(`✔ ${product.name} agregado al carrito`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    };

    //   READ QR
    const handleScanQR = (qrValue: string) => {
        const product = products.find(p => p.id === qrValue);

        if (!product) {
            setSnackbarMessage("❌ Producto no encontrado");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // si lo encuentra → lo agrega al carrito
        handleAddCar(product);

        setSnackbarMessage(`✔ ${product.name} agregado por QR`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    };
    return (
        <>
            {/* HEADER */}
            <Box className="flex items-center justify-between mb-4">
                {/* IZQUIERDA - TÍTULO */}
                <h1 className="text-2xl font-bold">Productos disponibles</h1>

                {/* DERECHA - BOTONES */}
                <div className="flex gap-3">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => setOpenCartModal(true)}
                    >
                        Carrito
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PhotoCameraIcon />}
                        onClick={() => setOpenQRModal(true)}
                    >
                        Activar cámara
                    </Button>
                </div>
            </Box>

            {/* TABLA VENTAS */}
            <SalesTable
                products={products}
                loadingProducts={loadingProducts}
                onAddCar={handleAddCar}
            />

            {/* MODAL DEL CARRITO */}
            <SalesModal
                open={openCartModal}
                cart={cart}
                setCart={setCart}
                onClose={() => setOpenCartModal(false)}
            />

            {/* MODAL DEL LECTOR QR */}
            <ReadQR
                open={openQRModal}
                onClose={() => setOpenQRModal(false)}
                onScan={handleScanQR}
            />

            {/* SNACKBAR */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Sales;

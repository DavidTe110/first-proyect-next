"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import SalesTable from "../../components/sales/salesTales";
import { Alert, Box, Button, Snackbar } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SalesModal from "@/app/components/sales/salesModal";
import ReadQR from "@/app/components/sales/readQr";
import WithAuthProtect from "@/app/helpers/WithAuthProtect";
import { onAuthStateChanged } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";


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
    const [loadingSales, setLoadingSales] = useState<boolean>(false);
    // SNACKBAR
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<
        "success" | "error" | "warning" | "info"
    >("success");
    const [currentUser, setCurrentUser] = useState<any>();

    // ======================================
    // CARGAR PRODUCTOS
    // ======================================
    useEffect(() => {
        const ref = collection(db, "products");
        const q = query(ref, where("active", "==", true));

        const unsub = onAuthStateChanged(auth, (currentUser: any) => {
            console.log(auth, "--", currentUser)
            setCurrentUser(currentUser);
        });
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
        const audio = new Audio('/beep.mp3')

        if (!product) {
            setSnackbarMessage("❌ Producto no encontrado");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // si lo encuentra → lo agrega al carrito
        handleAddCar(product);

        setSnackbarMessage(`✔ ${product.name} agregado por QR`);
        audio.play();
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    };



    // Create ID
    const generateShortTicketId = () => {
        const fullUuid = uuidv4();          // ejemplo: d52a1e09-bf34-4cc1-b59b-4a6f18ffae19
        const shortUuid = fullUuid.slice(0, 6);  // ejemplo: d52a1e
        return `s-${shortUuid}`;
    };

    const handlePurchase = async () => {
        try {
            if (!currentUser) {
                setSnackbarMessage("❌ No estás autenticado");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }

            if (cart.length === 0) {
                setSnackbarMessage("❌ El carrito está vacío");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }
            setLoadingSales(true)

            const totalAmount = cart.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );

            // ==============================
            // 1. Crear la venta principal
            // ==============================
            const saleRef = await addDoc(collection(db, "sales"), {
                totalAmount,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                createdAt: serverTimestamp(),
                // createdBy: currentUser.uid,
            });

            const saleId = saleRef.id;

            // ==============================
            // 2. Crear SOLO UN detalle por venta
            // ==============================
            await addDoc(collection(db, "salesDetails"), {
                saleId,
                // items: cart.map(item => ({
                //     productId: item.id,
                //     quantity: item.quantity,
                //     price: item.price,
                // })),
                createdAt: serverTimestamp(),
                createdById: currentUser.uid,
                createdByEmail: currentUser.email,
                updatedBy: null,
                deletedBy: null,
            });

            // ==============================
            // Crear boleta imprimible (ticket)
            // ==============================
            const ticketId = generateShortTicketId();

            const printableItems = cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.quantity * item.price,
            }));

            await setDoc(doc(db, "tickets", ticketId), {
                ticketId,
                saleId,
                items: printableItems,
                totalAmount,
                createdAt: serverTimestamp(),
            });

            // ==============================
            // 3. Limpieza + mensaje
            // ==============================
            setCart([]);
            setOpenCartModal(false);
            setLoadingSales(false)

            setSnackbarMessage("✔ Venta registrada correctamente");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

        } catch (error) {
            console.error(error);
            setSnackbarMessage("❌ Error al registrar la venta");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
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
            {/* <SalesModal
                open={openCartModal}
                cart={cart}
                setCart={setCart}
                onClose={() => setOpenCartModal(false)}
            /> */}
            <SalesModal
                open={openCartModal}
                cart={cart}
                setCart={setCart}
                onClose={() => setOpenCartModal(false)}
                onPurchase={handlePurchase}
                loadingSales={loadingSales}
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

// export default Sales;
export default WithAuthProtect(Sales);

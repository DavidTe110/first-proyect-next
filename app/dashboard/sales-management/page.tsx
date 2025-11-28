"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { Box, Snackbar, Alert } from "@mui/material";
import SalesManagementTable from "../../components/sales-management/salesManagementTable";
import SaleManagementModal from "../../components/sales-management/salesManagementModal";
import WithAuthProtect from "@/app/helpers/WithAuthProtect";

interface Sale {
  id: string;
  totalAmount: number;
  createdAt: any;
  createdByEmail: string;
  ticketId: string;
}

interface TicketItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

const SalesManagement=()=> {

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailItems, setDetailItems] = useState<TicketItem[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // ============================================
  // Cargar ventas UNA VEZ con getDocs()
  // ============================================
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const q = query(collection(db, "sales"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Sale[];

        setSales(list);
      } catch (error) {
        console.error(error);
        setSnackbarMessage("Error al cargar ventas");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  // ============================================
  // Ver detalle → cargar ticket en tiempo real
  // ============================================
  const handleViewDetail = (saleId: string) => {
    const q = query(collection(db, "tickets"), where("saleId", "==", saleId));

    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setSnackbarMessage("No se encontró el ticket de esta venta");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      const doc = snapshot.docs[0].data();
      setDetailItems(doc.items);
      setDetailModalOpen(true);
    });

    return unsub;
  };

  return (
    <>
      <Box className="p-4">
        <h1 className="text-2xl font-bold mb-4">Gestión de ventas</h1>

        <SalesManagementTable
          sales={sales}
          loading={loading}
          onViewDetail={handleViewDetail}
        />
      </Box>

      <SaleManagementModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        items={detailItems}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
export default WithAuthProtect(SalesManagement)
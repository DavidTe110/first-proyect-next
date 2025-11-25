"use client";

import { useEffect, useState } from "react";
import ProductTable from "../../components/products/productTable";
import ProductModal from "../../components/products/productModal";
import CategoriesModal from "../../components/category/categoryModal";
import CategoryIcon from '@mui/icons-material/Category';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { Snackbar, Alert } from "@mui/material";

import { addDoc, collection, query, where, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { Button, Box } from "@mui/material";
import DeleteConfirmDialog from "@/app/components/utils/modal-delete/page";
import WithAuthProtect from "@/app/helpers/WithAuthProtect";
import QRModal from "@/app/components/products/qrModal";

// 🔹 Tipo único del producto
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
export interface Category {
  id?: string;
  name: string;
  createdAt: Date | null;
  active: boolean;
}

const   ProductsPage=()=> {

  // --- STATES ---
  const [openProductModal, setOpenProductModal] = useState<boolean>(false);
  const [openCategoriesModal, setOpenCategoriesModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openQr, setOpenQr] = useState<boolean>(false);

  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
 const [idProductQr, setIdProductQr] = useState<string>("");
 const [nameProductQr, setNameProductQr] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");



  const [status, setStatus] = useState<boolean>(true);
  useEffect(() => {
    if (editingProduct) {
      setStatus(editingProduct.status);
    } else {
      setStatus(true);
    }
  }, [editingProduct]);

  // ============================
  // 🔸 FETCH PRODUCTS
  // ============================
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {

      const q = query(
        collection(db, "products"),
        where("active", "==", true)   // 🔥 solo productos activos
      );

      const snap = await getDocs(q);
      const list: Product[] = [];

      snap.forEach(docSnap => {
        const data = docSnap.data();

        list.push({
          id: docSnap.id,
          name: data.name,
          price: data.price,
          category: data.category,
          stock: data.stock,
          status: data.status ?? true,
          active: data.active ?? true,
          createdAt: data.createdAt?.toDate?.() ?? null,
        });
      });

      setProducts(list);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ============================
  // 🔸 FETCH CATEGORIES
  // ============================
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      // setDeleteLoading(true);
      const q = query(
        collection(db, "categories"),
        where("active", "==", true)   // 🔥 solo productos activos
      );
      const snap = await getDocs(q);
      const list: string[] = [];

      snap.forEach(doc => list.push(doc.data().name));

      setCategories(list);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };


  // ============================
  // 🔸 SAVE PRODUCT (CREATE / UPDATE)
  // ============================
  const saveProduct = async (product: Product) => {
    try {
      setLoadingProducts(true);

      if (product.id) {
        // --- UPDATE ---
        const { id, createdAt, ...cleanData } = product;

        await updateDoc(doc(db, "products", id), cleanData);
        showSnackbar("Agregado correctamente", "success");

      } else {
        // --- CREATE (NO ENVIAR id NI createdAt) ---
        const { id, createdAt, ...cleanData } = product;

        await addDoc(collection(db, "products"), {
          ...cleanData,
          createdAt: new Date(),
        });
        showSnackbar("Actualizado correctamente", "success");

      }

      setOpenProductModal(false);
      await fetchProducts();

    } catch (err) {
      console.error("Error saving product:", err);
      showSnackbar("Error al guardar", "error");
    } finally {
      setLoadingProducts(false);
    }
  };

  // ============================
  // 🔸 DELETE PRODUCT
  // ============================

  const deleteProduct = async () => {
    if (!productToDelete?.id) return;

    try {
      setDeleteLoading(true);

      await updateDoc(doc(db, "products", productToDelete.id), {
        active: false,   // 🔥 eliminación lógica
        status: false    // opcional, si usas status
      });
      showSnackbar("Eliminado correctamente", "success");

      await fetchProducts();  // refrescar lista

      setOpenDelete(false);   // cerrar modal
    } catch (error) {
      showSnackbar("Error al guardar", "error");
      console.error("Error al eliminar producto:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================
  // 🔸 SAVE CATEGORY
  // ============================
  const saveCategory = async (category: Category) => {
    try {

      setLoadingCategories(true);
        const { id, createdAt, ...cleanData } = category;
        await addDoc(collection(db, "categories"), {
          ...cleanData,
          createdAt: new Date(),
          
        });

      showSnackbar("Actualizado correctamente", "success");
      setOpenCategoriesModal(false);
      await fetchCategories(); // Refresh categories

    } catch (err) {
      showSnackbar("Error al guardar", "error");
      console.error("Error saving category:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ============================
  // 🔸 NOTIFICATION
  // ============================
  const showSnackbar = (message: string, type: "success" | "error" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(type);
    setSnackbarOpen(true);
  };




  // ============================
  // 🔸 GENERATE QR
  // ============================

  const generateQR=(product: Product)=>{
    const idProduct:string = product.id ?? ""
    const nameProduct:string = product.name ?? ""
    setIdProductQr(idProduct)
    setNameProductQr(nameProduct)
    setOpenQr(true)
  }

  // ============================
  // 🔸 INIT LOAD
  // ============================
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);


  return (
    <>
      {/* TOP BAR */}
      <Box className="flex justify-between mb-4">

        <h2 className="text-xl font-semibold">Gestión de productos</h2>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CategoryIcon />}
            onClick={() => setOpenCategoriesModal(true)}
          >
            Agregar Categoría
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Inventory2Icon />}
            onClick={() => {
              setEditingProduct(null);
              setOpenProductModal(true);
            }}
          >
            Agregar Producto
          </Button>
        </Box>
      </Box>


      {/* PRODUCT TABLE */}
      <ProductTable
        products={products}
        categories={categories}
        loadingProducts={loadingProducts}
        loadingCategories={loadingCategories}
        onEdit={(p: Product) => {
          setEditingProduct(p);
          setOpenProductModal(true);
        }}
        onQr = {(p:Product)=>{
          generateQR(p)
        }}
        onDelete={(p: Product) => {
          setProductToDelete(p);
          setOpenDelete(true);
        }}
      />


      {/* PRODUCT MODAL */}
      <ProductModal
        open={openProductModal}
        onClose={() => setOpenProductModal(false)}
        editingProduct={editingProduct}
        categories={categories}
        loading={loadingProducts}
        onSave={saveProduct}
      />


      {/* CATEGORY MODAL */}
      <CategoriesModal
        open={openCategoriesModal}
        onClose={() => setOpenCategoriesModal(false)}
        loading={loadingCategories}
        // onSaveCategory={saveCategory}   // 🟩 ESTA ES LA FUNCIÓN NUEVA
        onEdit={saveCategory}
        editCategory={editingCategory}
      />

      {/* DELETE PRODUCT */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={deleteProduct}
        name={productToDelete?.name}
        loading={deleteLoading}
      />

      {/* GENERAR QR */}
      <QRModal
        open = {openQr}
        value = {idProductQr}
        title={nameProductQr}
        onClose={() => setOpenQr(false)}
      />
      

      {/* NOTIFICATION */}
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
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
export default WithAuthProtect(ProductsPage)

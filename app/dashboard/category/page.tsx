"use client";

import { useEffect, useState } from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import { collection, getDocs, setDoc, updateDoc, doc, query, where, addDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

import CategoryTable from "../../components/category/categoryTable";
import CategoriesModal from "../../components/category/categoryModal";
import DeleteConfirmDialog from "@/app/components/utils/modal-delete/page";

import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import WithAuthProtect from "@/app/helpers/WithAuthProtect";

export interface Category {
  id?: string;
  name: string;
  createdAt: Date | null;
  active: boolean;
}

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openCategoriesModal, setOpenCategoriesModal] = useState<boolean>(false);

  // Modal Agregar
  const [openModal, setOpenModal] = useState<boolean>(false);

  // Delete modal
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Refresh
  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);

  // Notifications (TU NUEVO SISTEMA)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<"success" | "error" | "info" | "warning">("success");

  // 📌 CARGAR CATEGORÍAS
  const loadCategories = async () => {
    setLoading(true);

    try {
      const q = query(collection(db, "categories"), where("active", "==", true));
      const snap = await getDocs(q);

      const data: Category[] = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
        createdAt: d.data().createdAt?.toDate?.() ?? null,
        active: d.data().active,
      }));

      setCategories(data);
    } catch (err) {
      console.error(err);
      showMessage("No se pudieron cargar las categorías 💔", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [refreshFlag]);

  // 📌 Mostrar snackbar
  const showMessage = (msg: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 📌 ABRIR MODAL AGREGAR
  // const handleAdd = () => {
  //   setOpenModal(true);
  // };

  // 📌 GUARDAR CATEGORÍA (solo agrega)
  const handleSaveCategory = async (category: Category) => {
    setLoading(true);
    try {
      if (category.id) {

        const { id, createdAt, ...cleanData } = category;
        await updateDoc(doc(db, "categories", id), cleanData);
        showSnackbar("Agregado correctamente", "success");

      } else {

        const { id, createdAt, ...cleanData } = category;
        await addDoc(collection(db, "categories"), {
          ...cleanData,
          createdAt: new Date(),

        });
        showSnackbar("Actualizado correctamente", "success");


        // const newRef = doc(collection(db, "categories"));
        // await setDoc(newRef, {
        //   name,
        //   createdAt: new Date(),
        //   active: true,
        // });

      }

      showMessage("Nueva categoría creada 💛", "success");
      setOpenModal(false);
      setRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error(err);
      showMessage("Error al guardar categoría 💔", "error");
    } finally {
      setLoading(false);
    }
  };


  // 📌 SOLICITAR DELETE
  const handleDeleteRequest = (category:Category) => {
    const selected = categories.find((c) => c.id === category.id) || null;
    setCategoryToDelete(selected);
    setOpenDelete(true);
  };


  // ============================
  // 🔸 NOTIFICATION
  // ============================
  const showSnackbar = (message: string, type: "success" | "error" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(type);
    setSnackbarOpen(true);
  };

  // 📌 CONFIRMAR DELETE
  const deleteCategory = async () => {
    try {
      if (!categoryToDelete?.id) return;
      setDeleteLoading(true);

      await updateDoc(doc(db, "categories", categoryToDelete.id), {
        active: false,
      });

      showMessage("Categoría eliminada correctamente ✨", "success");
      setRefreshFlag((prev) => !prev);
      setOpenDelete(false);
    } catch (err) {
      console.error(err);
      showMessage("Error al eliminar categoría 💔", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Gestión de Categorías</h2>

        <Button
          variant="contained"
          color="primary"
          onClick={()=>{
            setOpenModal(true);
            setEditingCategory(null)
         }}
          startIcon={<CategoryRoundedIcon />}
          disabled={loading}
          
        >
          Agregar Categoría
        </Button>
      </div>

      {/* TABLA */}
<CategoryTable
  categories={categories}
  loading={loading}
  onEdit={(cat: Category) => {
    setEditingCategory(cat);  // ✔ almacenar lo que vamos a editar
    setOpenModal(true);       // ✔ abrir modal
  }}
  onDelete={handleDeleteRequest}
/>
      {/* MODAL AGREGAR */}
<CategoriesModal
  open={openModal}
  onClose={() => {
    setEditingCategory(null);
    setOpenModal(false);
  }}
  onEdit={handleSaveCategory}
  editCategory={editingCategory}
  loading={loading}
/>

      {/* MODAL DELETE */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={deleteCategory}
        name={categoryToDelete?.name ?? ""}
        loading={deleteLoading}
      />

      {/* NOTIFICACIONES */}
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
};

export default WithAuthProtect(CategoryPage);

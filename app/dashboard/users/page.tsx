
"use client";

import { useState, useEffect } from "react";
import { Button, Snackbar, Alert, Dialog, DialogContent, DialogActions, DialogTitle } from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, updateDoc, doc, getDocs, collection, query, where } from "firebase/firestore";
import { auth, db, functions } from "../../firebase/firebaseConfig";

import UserTable, { User as TableUser } from "../../components/users/userTable";
import UserModal from "../../components/users/userModal";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteConfirmDialog from "@/app/components/utils/modal-delete/page";
import { httpsCallable } from "firebase/functions";
import WithAuthProtect from "@/app/helpers/WithAuthProtect";
import { callWithAuth } from "@/app/helpers/ValidateCreationUser";

export interface User {
  id: string;
  email: string;
  role: "Empleado" | "Admin";
  status: boolean;
  name: string;
  active: boolean;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [openDelete, setOpenDelete] = useState<boolean>(false);


  // ➤ Traer usuarios desde Firestore
  useEffect(() => {
    // const fetchUsers = async () => {
    //   setLoading(true);
    //   try {
    //     const snapshot = await getDocs(collection(db, "users"));
    //     const usersData: User[] = [];
    //     snapshot.forEach((doc) => {
    //       const data = doc.data();
    //       usersData.push({
    //         id: doc.id,
    //         email: data.email,
    //         role: data.role,
    //         status: data.status ?? true,
    //         name:data.name || ""
    //       });
    //     });
    //     setUsers(usersData);
    //   } catch (err) {
    //     console.error(err);
    //     setError("No se pudieron cargar los usuarios 💔");
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    fetchUsers();
  }, [refreshFlag]);


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("active", "==", true)   // 🔥 solo users activos
      );
      const snapshot = await getDocs((q));
      const usersData: User[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          email: data.email,
          role: data.role,
          status: data.status ?? true,
          name: data.name || "",
          active: true
        });
      });
      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios 💔");
    } finally {
      setLoading(false);
    }
  };
  const handleAdd = () => {
    setEditingUser(null);
    setOpenModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setOpenModal(true);
  };

  // const handleSaveUser = async (data: any) => {
  //   setLoading(true);
  //   setError("");
  //   // setSuccess("");

  //   try {
  //     if (!editingUser) {
  //       // Crear usuario en Auth
  //       const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
  //       const uid = cred.user.uid;

  //       // Guardar en Firestore
  //       await setDoc(doc(db, "users", uid), {
  //         email: data.email,
  //         role: data.role,
  //         status: true,
  //         name:data.name,
  //         createdAt: new Date(),
  //         active:true
  //       });

  //       // setSuccess("Usuario creado correctamente ✨");
  //       showSnackbar("Agregado correctamente", "success");
  //     } else {
  //       // Editar usuario existente
  //       await updateDoc(doc(db, "users", editingUser.id), {
  //         role: data.role,
  //         status: data.status,
  //         name:data.name
  //       });
  //       showSnackbar("Actualizado correctamente", "success");

  //       // setSuccess("Usuario actualizado correctamente 💛");
  //     }

  //     setRefreshFlag(prev => !prev);
  //     setOpenModal(false);
  //   } catch (err) {
  //     console.error(err);
  //     setError("Hubo un error, my love 💔");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSaveUser = async (data: any) => {
    setError("");

    if (!editingUser) {
      // Abrir el modal y guardar temporalmente los datos
      setPendingUserData(data);
      setOpenConfirm(true);
      return;
    }

    // 🔹 Si es edición normal → sigue igual
    try {
      setLoading(true);

      await updateDoc(doc(db, "users", editingUser.id), {
        role: data.role,
        status: data.status,
        name: data.name
      });

      showSnackbar("Usuario actualizado correctamente 💛", "success");
      setRefreshFlag(prev => !prev);
      setOpenModal(false);

    } catch (err) {
      console.error(err);
      setError("Hubo un error 💔");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCreate = async () => {
    setOpenConfirm(false);
    setLoading(true);

    try {
      const data = pendingUserData;

      // Crear usuario
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = cred.user.uid;

      await setDoc(doc(db, "users", uid), {
        email: data.email,
        role: data.role,
        status: true,
        name: data.name,
        createdAt: new Date(),
        active: true,
      });

      showSnackbar("Usuario creado correctamente ✨", "success");
      setRefreshFlag(prev => !prev);
      setOpenModal(false);
      window.location.reload();

    } catch (err) {
      console.error(err);
      setError("Hubo un error al crear el usuario 💔");
    } finally {
      setLoading(false);
      setPendingUserData(null);
    }
  };


  // ============================
  // 🔸 DELETE USER
  // ============================

  //   const handleSaveUser = async (data: any) => {
  //     setLoading(true);
  //     // setSuccess("");
  //     setError("");

  //     try {
  //         if (!editingUser) {
  //             // ============================================
  //             // 🆕 CREACIÓN DE USUARIO USANDO CLOUD FUNCTION
  //             // ============================================

  //             // 1. Define la llamada a la función remota
  //             const createAppUser = httpsCallable(functions, 'createUserNoLogin');

  //             // 2. Ejecuta la función, pasando todos los datos necesarios
  //             await  callWithAuth( createAppUser,{
  //                 email: data.email,
  //                 password: data.password, // Solo se usa al crear
  //                 name: data.name,
  //                 role: data.role,
  //             });

  //             // 🔥 El backend ya creó el usuario en Auth y Firestore
  //             showSnackbar("Usuario agregado correctamente ✨", "success");

  //         } else {
  //             // ============================================
  //             // EDICIÓN DE USUARIO EXISTENTE (Solo se actualiza Firestore)
  //             // ============================================

  //             await updateDoc(doc(db, "users", editingUser.id), {
  //                 role: data.role,
  //                 status: data.status,
  //                 name:data.name
  //             });

  //             showSnackbar("Usuario actualizado correctamente 💛", "success");
  //         }

  //         setRefreshFlag(prev => !prev);
  //         setOpenModal(false);
  //     } catch (err: any) {
  //         console.error("Error al guardar usuario:", err);
  //         // Puedes intentar obtener un mensaje de error más específico de la Cloud Function
  //         const errorMessage = err.message || "Hubo un error al guardar el usuario 💔";
  //         setError(errorMessage);
  //         showSnackbar(errorMessage, "error");
  //     } finally {
  //         setLoading(false);
  //     }
  // }

  const deleteUser = async () => {
    if (!userToDelete?.id) return;

    try {
      setDeleteLoading(true);

      await updateDoc(doc(db, "users", userToDelete.id), {
        active: false,   // 🔥 eliminación lógica
        status: false    // opcional, si usas status
      });
      showSnackbar("Eliminado correctamente", "success");

      await fetchUsers();  // refrescar lista

      setOpenDelete(false);   // cerrar modal
    } catch (error) {
      showSnackbar("Error al guardar", "error");
      console.error("Error al eliminar user:", error);
    } finally {
      setDeleteLoading(false);
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
  return (
    <>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
        <Button onClick={handleAdd} variant="contained" color="primary" disabled={loading} startIcon={<PersonAddIcon />} >
          {loading ? "Cargando..." : "Agregar Usuario"}
        </Button>
      </div>

      <UserTable users={users} loading={loading} onEdit={handleEdit}
        onDelete={(u: User) => {
          setUserToDelete(u);
          setOpenDelete(true);
        }}
      />

      <UserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        editingUser={editingUser}
        onSave={handleSaveUser}
        loading={loading}
      />

      {/* DELETE USER */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={deleteUser}
        name={userToDelete?.name}
        loading={deleteLoading}
      />

      {/* <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")}>
        <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar> */}


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

        {/* ALERT DE CREACION */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmar creación de usuario</DialogTitle>

        <DialogContent>
          Crear este usuario cerrará tu sesión actual y te conectará con el nuevo usuario.
          <br />
          ¿Deseas continuar?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="error">
            Cancelar
          </Button>

          <Button onClick={handleConfirmCreate} color="primary" variant="contained">
            Sí, crear usuario
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default WithAuthProtect(Users);

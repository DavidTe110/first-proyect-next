import React from 'react';
import { Button } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase/firebaseConfig'; // Asegúrate de que la configuración de Firebase esté correcta
import { useRouter } from 'next/navigation'; // Si estás usando Next.js para la navegación
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const LogoutButton = () => {

  const router = useRouter();

  // Función de cerrar sesión usando Firebase (arrow function)
  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra sesión en Firebase
      console.log("Usuario desconectado exitosamente");
      localStorage.removeItem('autentication')
      router.push("/login"); // Redirige al login después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon = {<ExitToAppIcon/>}
      onClick={handleLogout} // Llama a la función de cerrar sesión
    >
      Cerrar sesión
    </Button>
  );
};

export default LogoutButton;

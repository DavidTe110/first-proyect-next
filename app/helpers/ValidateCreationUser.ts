import { auth } from "../firebase/firebaseConfig";

export async function callWithAuth(fn: any, data: any) {
  const user = auth.currentUser;

  if (!user) {
    // Firebase aún no terminó de cargar o no hay sesión
    throw new Error("User no está autenticado todavía 😭");
  }

  // Firebase automáticamente manda el token en la llamada
  return fn(data);
}

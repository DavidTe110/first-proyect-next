// 'use client'
// import { useState, useEffect } from "react";
// import { useRouter } from 'next/navigation';
// import { Button, TextField, Box, CircularProgress, Snackbar } from '@mui/material';
// import { Alert } from '@mui/material';
// import { AccountCircle, LockOutlined } from '@mui/icons-material';
// import { auth, db } from "../firebase/firebaseConfig";
// import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";

// export default function Login() {
//     const [loading, setLoading] = useState(false);
//     const [errorMessage, setErrorMessage] = useState("");
//     const router = useRouter();
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     // Si ya hay sesión activa → chequear estado
//     useEffect(() => {
//         const unsub = onAuthStateChanged(auth, async (user) => {
//             if (user) {
//                 // Revisamos Firestore
//                 const userDoc = await getDoc(doc(db, "users", user.uid));
//                 if (userDoc.exists()) {
//                     const status = userDoc.data().status;
//                     if (status) {
//                         router.push("/dashboard/home");
//                     } else {
//                         await auth.signOut();
//                         setErrorMessage("Usuario no activo ❌");
//                     }
//                 } else {
//                     await auth.signOut();
//                     setErrorMessage("Usuario no registrado ❌");
//                 }
//             }
//         });

//         return () => unsub();
//     }, []);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         setErrorMessage("");

//         try {
//             const cred = await signInWithEmailAndPassword(auth, email, password);

//             // Revisamos si está activo en Firestore
//             const userDoc = await getDoc(doc(db, "users", cred.user.uid));
//             if (userDoc.exists()) {
//                 const status = userDoc.data().status;
//                 if (status) {
//                     router.push("/dashboard/home");
//                 } else {
//                     setErrorMessage("Usuario no activo ❌");
//                     await auth.signOut();
//                 }
//             } else {
//                 setErrorMessage("Usuario no registrado ❌");
//                 await auth.signOut();
//             }

//         } catch (err: any) {
//             setErrorMessage("Credenciales no autorizadas ❌");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
//             <main className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//                 <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white mb-8">
//                     Ingrese sus credenciales
//                 </h2>

//                 <form onSubmit={handleSubmit}>
//                     <Box mb={3}>
//                         <TextField
//                             fullWidth
//                             label="Username"
//                             variant="outlined"
//                             required
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             InputProps={{
//                                 startAdornment: <AccountCircle className="text-gray-400" />
//                             }}
//                         />
//                     </Box>

//                     <Box mb={3}>
//                         <TextField
//                             fullWidth
//                             label="Password"
//                             type="password"
//                             variant="outlined"
//                             required
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             InputProps={{
//                                 startAdornment: <LockOutlined className="text-gray-400" />
//                             }}
//                         />
//                     </Box>

//                     <Box mb={2}>
//                         <Button
//                             type="submit"
//                             variant="contained"
//                             color="primary"
//                             fullWidth
//                             disabled={loading}
//                         >
//                             {loading ? <CircularProgress size={24} /> : "Ingresar"}
//                         </Button>
//                     </Box>
//                 </form>

//                 <Snackbar
//                     open={!!errorMessage}
//                     autoHideDuration={6000}
//                     onClose={() => setErrorMessage("")}
//                 >
//                     <Alert severity="error" onClose={() => setErrorMessage("")}>
//                         {errorMessage}
//                     </Alert>
//                 </Snackbar>
//             </main>
//         </div>
//     );
// }
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button, TextField, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { AccountCircle, LockOutlined } from '@mui/icons-material';
import { auth, db } from "../firebase/firebaseConfig";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [isRegisteringUser, setIsRegisteringUser] = useState(false); // 🔥 NUEVO
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    // 🚨 Listener de sesión, EVITAR que se ejecute mientras hay un registro
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {

            if (isRegisteringUser) return; // ⛔ IMPORTANTE

            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));

                if (userDoc.exists()) {
                    const status = userDoc.data().status;

                    if (status) {
                        router.push("/dashboard/home");
                    } else {
                        await auth.signOut();
                        setErrorMessage("Usuario no activo ❌");
                    }
                } else {
                    await auth.signOut();
                    setErrorMessage("Usuario no registrado ❌");
                }
            }
        });

        return () => unsub();
    }, [isRegisteringUser]); // 👈 IMPORTANTE

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            if (isRegister) {

                // 🔥 Indicamos que se está registrando
                setIsRegisteringUser(true);

                // ============================
                //   REGISTRO
                // ============================
                const cred = await createUserWithEmailAndPassword(auth, email, password);

                await setDoc(doc(db, "users", cred.user.uid), {
                    email,
                    name,
                    role: "Empleado",
                    status: false,   // 🔥 Debe aprobarlo el admin
                    active: true,
                    createdAt: new Date()
                });

                await auth.signOut(); // 🔥 Evita dejar sesión activa

                setSuccessMessage("Cuenta creada ✔ Espera aprobación del administrador.");

                // limpiar formulario
                setEmail("");
                setPassword("");
                setName("");

                setIsRegister(false);

                // 🔥 Rehabilitar el listener
                setTimeout(() => {
                    setIsRegisteringUser(false);
                }, 800);

                setLoading(false);
                return;
            }

            // ============================
            //   LOGIN
            // ============================
            const cred = await signInWithEmailAndPassword(auth, email, password);

            const userDoc = await getDoc(doc(db, "users", cred.user.uid));

            if (!userDoc.exists()) {
                setErrorMessage("Usuario no registrado ❌");
                await auth.signOut();
                return;
            }

            if (!userDoc.data().status) {
                setErrorMessage("Usuario no activo ❌");
                await auth.signOut();
                return;
            }

            router.push("/dashboard/home");

        } catch (err: any) {
            console.error(err);
            setErrorMessage("Credenciales incorrectas ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
            <main className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">

                <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white mb-8">
                    {isRegister ? "Crear cuenta" : "Ingresar"}
                </h2>

                <form onSubmit={handleSubmit}>
                    
                    {isRegister && (
                        <Box mb={3}>
                            <TextField
                                fullWidth
                                label="Nombre completo"
                                variant="outlined"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Box>
                    )}

                    <Box mb={3}>
                        <TextField
                            fullWidth
                            label="Correo"
                            variant="outlined"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputProps={{
                                startAdornment: <AccountCircle className="text-gray-400" />
                            }}
                        />
                    </Box>

                    <Box mb={3}>
                        <TextField
                            fullWidth
                            label="Contraseña"
                            type="password"
                            variant="outlined"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: <LockOutlined className="text-gray-400" />
                            }}
                        />
                    </Box>

                    <Box mb={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : (isRegister ? "Registrar" : "Ingresar")}
                        </Button>
                    </Box>

                    <Box textAlign="center">
                        <Button 
                            variant="text"
                            onClick={() => setIsRegister(!isRegister)}
                        >
                            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "Crear nueva cuenta"}
                        </Button>
                    </Box>
                </form>

                {/* ERRORES */}
                <Snackbar
                    open={!!errorMessage}
                    autoHideDuration={6000}
                    onClose={() => setErrorMessage("")}
                >
                    <Alert severity="error">{errorMessage}</Alert>
                </Snackbar>

                {/* EXITO */}
                <Snackbar
                    open={!!successMessage}
                    autoHideDuration={6000}
                    onClose={() => setSuccessMessage("")}
                >
                    <Alert severity="success">{successMessage}</Alert>
                </Snackbar>

            </main>
        </div>
    );
}

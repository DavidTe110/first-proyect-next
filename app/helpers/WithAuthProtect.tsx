// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { auth, db } from "../firebase/firebaseConfig";

// export default function WithAuthProtect(Component: any) {
//   return function ProtectedComponent(props: any) {
//     const router = useRouter();
//     const [loading, setLoading] = useState(true);
//     const [allowed, setAllowed] = useState(false);

//     useEffect(() => {
//       const unsub = onAuthStateChanged(auth, async (user) => {
//         if (!user) {
//           router.replace("/"); // No está logeado
//           return;
//         }

//         try {
//           // Revisamos el documento en Firestore
//           const userDocRef = doc(db, "users", user.uid);
//           const userDocSnap = await getDoc(userDocRef);

//           if (!userDocSnap.exists()) {
//             router.replace("/"); // No existe en la colección
//             return;
//           }

//           const userData = userDocSnap.data();

//           // Verificamos si está activo
//           if (!userData.status) {
//             router.replace("/"); // No está activo
//             return;
//           }

//           // Todo OK, permitir acceso
//           setAllowed(true);
//         } catch (error) {
//           console.error("Error verificando usuario:", error);
//           router.replace("/");
//         } finally {
//           setLoading(false);
//         }
//       });

//       return () => unsub();
//     }, []);

//     if (loading) return null; // O un spinner si quieres

//     if (!allowed) return null;

//     return <Component {...props} />;
//   };
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function WithAuthProtect(Component: any) {
  return function ProtectedComponent(props: any) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.replace("/");
          return;
        }

        try {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);

          // ❌ No existe en Firestore → cerrar sesión
          if (!snap.exists()) {
            await signOut(auth);
            router.replace("/");
            return;
          }

          const data = snap.data();

          // ❌ ACTIVE FALSE → cerrar sesión
          if (!data.status) {
            await signOut(auth);
            router.replace("/");
            return;
          }

          // 🔥 Todo OK → permitir acceso
          setAllowed(true);

        } catch (error) {
          console.error("Error verificando usuario:", error);
          await signOut(auth);
          router.replace("/");
        } finally {
          setLoading(false);
        }
      });

      return () => unsub();
    }, []);

    if (loading) return null;
    if (!allowed) return null;

    return <Component {...props} />;
  };
}

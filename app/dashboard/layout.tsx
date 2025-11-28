"use client";
// import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline, Skeleton, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import LogoutButton from '../components/utils/logout-button/page';

import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from 'react';
import CategoryIcon from '@mui/icons-material/Category';
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import BarChartIcon from "@mui/icons-material/BarChart";
const drawerWidth = 240;

const LayoutDashboard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        let role = "Empleado";
        if (snap.exists()) {
          role = snap.data().role;
          setUserRole(role);
        }

        // Verificación de ruta según rol
        const adminRoutes = ['/dashboard/users'];

        if (role !== "Admin" && adminRoutes.includes(pathname)) {
          router.replace('/dashboard/home'); // redirige al home
        }
      }

      setLoading(false); // siempre, con o sin usuario
    });

    return () => unsub();
  }, []);


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={true}
      >

        {/* PERFIL DEL USUARIO */}
        {!loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Avatar sx={{ width: 56, height: 56, mb: 1 }}>
              {auth.currentUser?.email?.[0]?.toUpperCase()}
            </Avatar>

            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                {auth.currentUser?.email}
              </Box>

              <Box
                sx={{
                  mt: 0.5,
                  px: 1.5,
                  py: 0.3,
                  fontSize: "0.75rem",
                  bgcolor: userRole === "Admin" ? "success.main" : "primary.main",
                  color: "white",
                  borderRadius: 10,
                  display: "inline-block",
                  textTransform: "uppercase",
                }}
              >
                {userRole || "User"}
              </Box>
            </Box>
          </Box>
        )}

        {/* LISTA DE OPCIONES */}
        <List>
          {loading ? (
            <>
              <ListItem><Skeleton variant="rectangular" width={180} height={30} /></ListItem>
              <ListItem><Skeleton variant="rectangular" width={180} height={30} /></ListItem>
              <ListItem><Skeleton variant="rectangular" width={180} height={30} /></ListItem>
            </>
          ) : (
            <>
              <ListItemButton
                onClick={() => handleNavigation('/dashboard/home')}
                selected={pathname === '/dashboard/home'}
              >
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>

              <ListItemButton
                onClick={() => handleNavigation('/dashboard/category')}
                selected={pathname === '/dashboard/category'}
              >
                <ListItemIcon><CategoryIcon /></ListItemIcon>
                <ListItemText primary="Categorias" />
              </ListItemButton>
              <ListItemButton
                onClick={() => handleNavigation('/dashboard/products')}
                selected={pathname === '/dashboard/products'}
              >
                <ListItemIcon><ShoppingBagIcon /></ListItemIcon>
                <ListItemText primary="Productos" />
              </ListItemButton>

              <ListItemButton
                onClick={() => handleNavigation('/dashboard/sales')}
                selected={pathname === '/dashboard/sales'}
              >
                <ListItemIcon><PointOfSaleIcon /></ListItemIcon>
                <ListItemText primary="Ventas" />
              </ListItemButton>


              <ListItemButton
                onClick={() => handleNavigation('/dashboard/sales-management')}
                selected={pathname === '/dashboard/sales-management'}
              >
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary="Lista de ventas" />
              </ListItemButton>


              {userRole === "Admin" && (
                <ListItemButton
                  onClick={() => handleNavigation('/dashboard/users')}
                  selected={pathname === '/dashboard/users'}
                >
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary="Usuarios" />
                </ListItemButton>
              )}
            </>
          )}
        </List>

        {/* BOTÓN DE LOGOUT */}
        <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}  >
          <LogoutButton />
        </Box>

      </Drawer>

      {/* CONTENIDO PRINCIPAL */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );

};

export default LayoutDashboard;

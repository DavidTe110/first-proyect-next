'use client'
import { redirect } from "next/navigation"
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Redirige a la página de login cuando se carga el componente
    redirect('/login')

  }, []);

  return (
    <></>
  );
}

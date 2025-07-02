// Contenido para: src/components/RutaProtegida.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Loader } from 'lucide-react';

const RutaProtegida = () => {
  const { auth, cargando } = useAuth(); // <-- CAMBIO AQUÍ: Se añadió un punto y coma

  if (cargando) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-fondo text-texto-principal">
            <Loader className="animate-spin text-acento-1" size={48} />
            <p className="mt-4 text-lg">Verificando sesión...</p>
        </div>
    );
  }

  return auth ? <Outlet /> : <Navigate to="/" />;
};

export default RutaProtegida;
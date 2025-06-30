import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// ================================================================
// ARCHIVO: src/components/RutaProtegida.jsx (Versión Corregida)
//
// CAMBIOS:
// 1. Se añade la variable `cargando` desde el contexto.
// 2. Se implementa una pantalla de carga que se muestra mientras
//    `cargando` sea `true`.
// 3. Una vez que `cargando` es `false`, se comprueba el estado `auth`
//    de forma segura.
// ================================================================

const RutaProtegida = () => {
  const { auth, cargando } = useAuth();

  // Si aún estamos verificando el token, mostramos un mensaje.
  // ESTA LÍNEA ES LA CLAVE PARA SOLUCIONAR EL PROBLEMA.
  if (cargando) {
    return (
        <div className="flex justify-center items-center h-screen bg-primario">
            <p className="text-white text-xl">Verificando sesión...</p>
        </div>
    );
  }

  // Cuando la carga termina, si hay un usuario (auth), muestra el contenido (Outlet).
  // Si no, redirige a la página de login.
  return auth ? <Outlet /> : <Navigate to="/" />;
};

export default RutaProtegida;

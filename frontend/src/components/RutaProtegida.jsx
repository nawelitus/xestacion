import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RutaProtegida = () => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div>Cargando...</div>; // O un spinner
  }

  return usuario ? <Outlet /> : <Navigate to="/login" />;
};

export default RutaProtegida;

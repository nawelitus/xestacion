import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RutaProtegida = () => {
  const { usuario} = useAuth();

  
  return usuario ? <Outlet /> : <Navigate to="/" />;
};

export default RutaProtegida;

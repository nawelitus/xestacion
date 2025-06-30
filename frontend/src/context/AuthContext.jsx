import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

// ================================================================
// ARCHIVO: src/context/AuthContext.jsx (Versión Corregida)
//
// CAMBIOS:
// 1. Se renombra el estado `usuario` a `auth` para consistencia.
// 2. Se renombra la función `logout` a `cerrarSesion`.
// 3. El proveedor ahora exporta `auth` y `cerrarSesion`, que es lo que
//    los otros componentes (Sidebar, RutaProtegida) esperan.
// ================================================================

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const autenticarUsuario = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const usuarioDecodificado = jwtDecode(token);
          // Almacenamos el payload del usuario en el estado 'auth'
          setAuth(usuarioDecodificado.usuario);
        } catch (error) {
          console.error("Token inválido, se removerá:", error);
          localStorage.removeItem('token');
          setAuth(null);
        }
      }
      setCargando(false);
    };
    
    autenticarUsuario();
  }, []);

  const login = async (dni, password) => {
    try {
      const respuesta = await api.post('/auth/login', { dni, password });
      const { token } = respuesta.data;
      
      localStorage.setItem('token', token);
      
      const usuarioDecodificado = jwtDecode(token);
      setAuth(usuarioDecodificado.usuario);

    } catch (error) {
      console.error("Error en la función de login del contexto:", error);
      throw error;
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, cargando, login, cerrarSesion }}>
      {/* Prevenimos que la app se renderice antes de verificar el token */}
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

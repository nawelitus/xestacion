// Contenido para: src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [cargando, setCargando] = useState(true);

  // --- LÓGICA DE AUTENTICACIÓN COMPLETAMENTE NUEVA ---
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        // Al cargar la app, llamamos al nuevo endpoint /verify.
        // Si la cookie del token es válida, el backend nos devolverá los datos del usuario.
        const { data } = await api.get('/auth/verify');
        setAuth(data); // Guardamos los datos del usuario en el estado.
      } catch (error) {
        // Si hay un error (ej: token no válido, expirado o inexistente),
        // nos aseguramos de que el estado del usuario quede como nulo.
        console.log('No hay sesión activa o el token no es válido.');
        setAuth(null);
      } finally {
        // Marcamos la carga como finalizada para que la app se renderice.
        setCargando(false);
      }
    };
    
    verificarSesion();
  }, []);

  const login = async (dni, password) => {
    // La petición de login ahora devuelve solo los datos del usuario.
    // La cookie se establece automáticamente en el backend.
    const { data } = await api.post('/auth/login', { dni, password });
    setAuth(data); // Guardamos los datos del usuario en el estado local.
  };

  const cerrarSesion = async () => {
    try {
      // Llamamos al backend para que elimine la cookie de sesión.
      await api.post('/auth/logout');
      setAuth(null); // Limpiamos el estado del usuario en el frontend.
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzamos la limpieza del estado del usuario incluso si hay un error.
      setAuth(null); 
    }
  };

  return (
    <AuthContext.Provider value={{ auth, cargando, login, cerrarSesion }}>
      {/* Ya no usamos !cargando && children, el componente RutaProtegida maneja esto */}
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
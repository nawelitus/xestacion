import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const usuarioDecodificado = jwtDecode(token);
        setUsuario(usuarioDecodificado.usuario);
      } catch (error) {
        console.error("Token inválido:", error);
        localStorage.removeItem('token');
      }
    }
    setCargando(false);
  }, []);

  // CAMBIO: La función de login ahora acepta `dni`
  const login = async (dni, password) => {
    const respuesta = await api.post('/auth/login', { dni, password });
    const { token } = respuesta.data;
    localStorage.setItem('token', token);
    const usuarioDecodificado = jwtDecode(token);
    setUsuario(usuarioDecodificado.usuario);
    return usuarioDecodificado.usuario;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

/**
 * ================================================================
 * ARCHIVO: src/context/AuthContext.jsx
 * DESCRIPCIÓN: Gestiona el estado de autenticación global (usuario, token),
 * y provee las funciones de login/logout a toda la aplicación.
 * VERSIÓN: Corregida y robustecida.
 * ================================================================
 */

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  // Inicia como true, crucial para la lógica de carga inicial.
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Esta función se ejecuta solo una vez cuando la aplicación carga por primera vez.
    const autenticarUsuario = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Si el token es válido, configuramos los datos del usuario en el estado.
          const usuarioDecodificado = jwtDecode(token);
          setUsuario(usuarioDecodificado.usuario);
        } catch (error) {
          // Si el token está corrupto o expirado, lo limpiamos para evitar errores.
          console.error("Token inválido, removiendo:", error);
          localStorage.removeItem('token');
          setUsuario(null);
        }
      }
      // Se asegura de que el estado de 'cargando' se ponga en false
      // SÓLO después de haber intentado verificar el token.
      setCargando(false);
    };
    
    autenticarUsuario();
  }, []); // El array vacío `[]` asegura que se ejecute solo al montar el componente.

  /**
   * @async
   * @function login
   * @description Envía las credenciales al backend, y si son correctas,
   * guarda el token y actualiza el estado del usuario.
   * @param {string} dni - DNI del usuario.
   * @param {string} password - Contraseña del usuario.
   * @throws Lanza un error si las credenciales son incorrectas o hay un fallo de red.
   */
  const login = async (dni, password) => {
    // Envolvemos la llamada a la API en un bloque try...catch.
    try {
      const respuesta = await api.post('/auth/login', { dni, password });
      const { token } = respuesta.data;
      
      // Guardamos el token en el almacenamiento local del navegador para persistir la sesión.
      localStorage.setItem('token', token);
      
      // Decodificamos el token para obtener los datos del usuario.
      const usuarioDecodificado = jwtDecode(token);
      
      // Actualizamos el estado de la aplicación con los datos del usuario.
      setUsuario(usuarioDecodificado.usuario);

    } catch (error) {
      // Si la API devuelve un error (ej: 401 Unauthorized), lo relanzamos
      // para que el componente Login pueda capturarlo y mostrar un mensaje de error.
      console.error("Error en la función de login del contexto:", error);
      throw error;
    }
  };

  /**
   * @function logout
   * @description Cierra la sesión del usuario, eliminando el token
   * y limpiando el estado de usuario.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {/* No renderizamos los componentes hijos (la aplicación en sí) 
          hasta que la carga inicial de autenticación haya terminado. 
          Esto previene parpadeos o redirecciones incorrectas. */}
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
import api from './api';

// ================================================================
// ARCHIVO: src/services/usuarioService.js (NUEVO)
//
// DESCRIPCIÓN:
// Centraliza todas las llamadas a la API del backend relacionadas con
// la gestión de usuarios (CRUD).
// ================================================================

/**
 * Obtiene la lista de todos los usuarios del sistema.
 * @returns {Promise<Array>} La lista de usuarios.
 */
export const listarUsuarios = async () => {
  try {
    const { data } = await api.get('/usuarios');
    return data;
  } catch (error) {
    console.error("Error al listar usuarios:", error.response?.data?.mensaje || error.message);
    throw error;
  }
};

/**
 * Crea un nuevo usuario.
 * @param {object} datosUsuario - Datos del nuevo usuario (nombre_completo, email, dni, password, rol).
 * @returns {Promise<object>} La respuesta del servidor.
 */
export const crearUsuario = async (datosUsuario) => {
  try {
    const { data } = await api.post('/usuarios', datosUsuario);
    return data;
  } catch (error) {
    console.error("Error al crear usuario:", error.response?.data?.mensaje || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Actualiza los datos de un usuario existente.
 * @param {number} id - ID del usuario a actualizar.
 * @param {object} datosUsuario - Nuevos datos (nombre_completo, email, dni, rol).
 * @returns {Promise<object>} La respuesta del servidor.
 */
export const actualizarUsuario = async (id, datosUsuario) => {
  try {
    const { data } = await api.put(`/usuarios/${id}`, datosUsuario);
    return data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error.response?.data?.mensaje || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Actualiza la contraseña de un usuario.
 * @param {number} id - ID del usuario.
 * @param {string} nuevaPassword - La nueva contraseña.
 * @returns {Promise<object>} La respuesta del servidor.
 */
export const actualizarPasswordUsuario = async (id, nuevaPassword) => {
  try {
    const { data } = await api.put(`/usuarios/password/${id}`, { nuevaPassword });
    return data;
  } catch (error) {
    console.error("Error al actualizar contraseña:", error.response?.data?.mensaje || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Cambia el estado (activo/inactivo) de un usuario.
 * @param {number} id - ID del usuario.
 * @param {number} estado - Nuevo estado (1 para activo, 0 para inactivo).
 * @returns {Promise<object>} La respuesta del servidor.
 */
export const cambiarEstadoUsuario = async (id, estado) => {
  try {
    const { data } = await api.put(`/usuarios/estado/${id}`, { estado });
    return data;
  } catch (error) {
    console.error("Error al cambiar estado de usuario:", error.response?.data?.mensaje || error.message);
    throw error.response?.data || error;
  }
};

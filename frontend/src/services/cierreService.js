// Contenido COMPLETO y ACTUALIZADO para: src/services/cierreService.js

import api from './api'; // Importamos la instancia centralizada de Axios

/**
 * @async
 * @function obtenerCierresRecientes
 * @description Realiza una petición GET para obtener los últimos cierres cargados.
 * @returns {Promise<Array>} Una promesa que resuelve a un array de objetos de cierre.
 */
export const obtenerCierresRecientes = async () => {
  try {
    const respuesta = await api.get('/cierres');
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener los cierres recientes:", error.response || error.message);
    throw error;
  }
};

/**
 * @NUEVA_FUNCION
 * @async
 * @function obtenerDetallePorId
 * @description Realiza una petición GET a la API para obtener los detalles completos de un Cierre Z.
 * @param {string|number} id - El ID del cierre a obtener.
 * @returns {Promise<object>} Una promesa que resuelve a un objeto con todos los detalles del cierre.
 * @throws {Error} Lanza un error si la petición a la API falla.
 */
export const obtenerDetallePorId = async (id) => {
  try {
    // Hacemos la petición GET al endpoint con el ID: /api/cierres/123
    const respuesta = await api.get(`/cierres/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error(`Error al obtener el detalle del cierre ${id}:`, error.response || error.message);
    // Relanzamos el error para que el componente que llama pueda manejarlo
    throw error;
  }
};
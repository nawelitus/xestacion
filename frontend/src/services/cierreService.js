// Contenido COMPLETO y ACTUALIZADO para: src/services/cierreService.js
import api from './api';

/**
 * Sube un archivo de Cierre Z al backend para ser procesado.
 * @param {File} archivo - El objeto de archivo seleccionado por el usuario.
 * @returns {Promise<object>} La respuesta del servidor tras procesar el archivo.
 */
export const subirCierre = async (archivo) => {
  const formData = new FormData();
  formData.append('archivoCierre', archivo);

  try {
    const { data } = await api.post('/cierres/subir', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error("Error al subir el archivo de cierre:", error.response || error.message);
    throw error;
  }
};

/**
 * Realiza una petición GET para obtener los últimos cierres cargados.
 * @returns {Promise<Array>} Una promesa que resuelve a un array de objetos de cierre.
 */
export const obtenerCierresRecientes = async () => {
  try {
    const { data } = await api.get('/cierres');
    return data;
  } catch (error) {
    console.error("Error al obtener los cierres recientes:", error.response || error.message);
    throw error;
  }
};

/**
 * Realiza una petición GET a la API para obtener los detalles completos de un Cierre Z.
 * @param {string|number} id - El ID del cierre a obtener.
 * @returns {Promise<object>} Una promesa que resuelve a un objeto con todos los detalles del cierre.
 */
export const obtenerDetallePorId = async (id) => {
  try {
    const { data } = await api.get(`/cierres/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener el detalle del cierre ${id}:`, error.response || error.message);
    throw error;
  }
};

/**
 * Obtiene todos los cierres (para la página de historial CierresZ).
 * @returns {Promise<Array>} Una promesa que resuelve a un array de objetos de cierre.
 */
export async function getCierres() {
  try {
    const { data } = await api.get('/cierres');
    return data;
  } catch (error) {
    console.error("Error al obtener el historial de cierres:", error.response || error.message);
    throw error;
  }
};

// ================================================================
// NUEVA FUNCIONALIDAD: Servicio para eliminar un Cierre Z
// ================================================================
/**
 * Llama a la API para eliminar permanentemente un Cierre Z por su ID.
 * @param {string|number} id - El ID del cierre a eliminar.
 * @returns {Promise<object>} La respuesta del servidor.
 */
export const eliminarCierrePorId = async (id) => {
  try {
    const { data } = await api.delete(`/cierres/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al eliminar el cierre con ID ${id}:`, error.response || error.message);
    // Lanzamos el error para que el componente que llama (CajaDiaria.jsx) pueda manejarlo.
    throw error;
  }
};

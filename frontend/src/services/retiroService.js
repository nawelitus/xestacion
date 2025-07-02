import api from './api';

/**
 * @description Obtiene la lista de retiros de empleados, con filtros de fecha opcionales.
 * @param {object} filtros - Objeto con las fechas de filtro.
 * @param {string} [filtros.fechaDesde] - Fecha de inicio en formato YYYY-MM-DD.
 * @param {string} [filtros.fechaHasta] - Fecha de fin en formato YYYY-MM-DD.
 * @returns {Promise<Array>} Un arreglo con los objetos de retiro.
 */
export const obtenerRetiros = async (filtros = {}) => {
  try {
    // Usamos URLSearchParams para construir la query string de forma segura
    // y solo añadir los parámetros que realmente tienen un valor.
    const params = new URLSearchParams();
    if (filtros.fechaDesde) {
      params.append('fechaDesde', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      params.append('fechaHasta', filtros.fechaHasta);
    }
    
    const { data } = await api.get('/retiros', { params });
    return data;
  } catch (error) {
    console.error("Error al obtener los retiros de empleados:", error);
    throw error;
  }
};
// --- AÑADIR NUEVA FUNCIÓN ---
/**
 * @description Llama a la API para cancelar un adelanto de personal específico.
 * @param {number} id - El ID del adelanto a cancelar.
 * @returns {Promise<object>} La respuesta de la API.
 */
export const cancelarAdelanto = async (id) => {
  try {
    const { data } = await api.patch(`/retiros/cancelar/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al cancelar el adelanto con ID ${id}:`, error);
    throw error;
  }
};
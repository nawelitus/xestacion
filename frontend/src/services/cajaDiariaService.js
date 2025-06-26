import api from './api';

/**
 * @description Obtiene el resumen de caja consolidado para una fecha específica.
 * @param {string} fecha - La fecha en formato YYYY-MM-DD.
 * @returns {Promise<Object>} La respuesta completa de la API, incluyendo el objeto de datos.
 */
export const obtenerResumenCaja = async (fecha) => {
  try {
    // La fecha se pasa como un query param en la URL
    const { data } = await api.get(`/caja?fecha=${fecha}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener el resumen de caja para la fecha ${fecha}:`, error);
    // Relanzamos el error para que el componente que llama pueda manejarlo.
    throw error;
  }
};
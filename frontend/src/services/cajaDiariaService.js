import api from './api';

/**
 * @description Obtiene la lista de Cierres Z que están pendientes de procesar.
 * @returns {Promise<Array>} Un arreglo de objetos de cierres pendientes.
 */
export const listarCierresPendientes = async () => {
  try {
    const { data } = await api.get('/caja/pendientes');
    return data;
  } catch (error) {
    console.error("Error al listar cierres pendientes:", error);
    throw error;
  }
};

/**
 * @description Envía los datos del formulario de caja diaria para procesar un cierre.
 * @param {string|number} cierreId - El ID del cierre que se está procesando.
 * @param {Object} datosCaja - El objeto que contiene los datos de la billetera, créditos y retiros.
 * @returns {Promise<Object>} La respuesta de la API.
 */
export const procesarCajaDiaria = async (cierreId, datosCaja) => {
  try {
    const { data } = await api.post(`/caja/procesar/${cierreId}`, datosCaja);
    return data;
  } catch (error) {
    console.error(`Error al procesar la caja del cierre ${cierreId}:`, error);
    throw error;
  }
};
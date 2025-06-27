import api from './api';

/**
 * Obtiene la lista completa de Cierres Z para la vista de Caja Diaria.
 */
export const listarCierresParaCaja = async () => {
  try {
    const { data } = await api.get('/caja'); // El endpoint ahora es la raíz
    return data;
  } catch (error) {
    console.error("Error al listar cierres para caja:", error);
    throw error;
  }
};

/**
 * @NUEVO
 * Obtiene los detalles completos de una caja ya procesada.
 */
export const obtenerDetalleCajaProcesada = async (cierreId) => {
  try {
    const { data } = await api.get(`/caja/detalle/${cierreId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener detalle de caja procesada para ${cierreId}:`, error);
    throw error;
  }
};

/**
 * Envía los datos del formulario de caja diaria para procesar un cierre.
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
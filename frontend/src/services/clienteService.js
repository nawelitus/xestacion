import api from './api';
/**
 * @description Obtiene la lista completa de clientes con sus saldos actuales.
 * @returns {Promise<Array>} Un arreglo de objetos de clientes.
 */
export const listarClientesConSaldos = async () => {
  try {
    const { data } = await api.get('/clientes');
    return data;
  } catch (error) {
    console.error("Error al listar clientes con saldos:", error);
    throw error;
  }
};

/**
 * @description Obtiene los detalles completos de un cliente y su historial de movimientos.
 * @param {string|number} id - El ID del cliente.
 * @returns {Promise<Object>} Un objeto con los detalles y movimientos del cliente.
 */
export const obtenerDetalleCliente = async (id) => {
  try {
    const { data } = await api.get(`/clientes/${id}/detalle`);
    return data;
  } catch (error) {
    console.error(`Error al obtener el detalle del cliente ${id}:`, error);
    throw error;
  }
};
//-
/**
 * @description Registra un nuevo pago (crédito) en la cuenta de un cliente.
 * @param {string|number} id - El ID del cliente.
 * @param {Object} pagoData - Objeto con los datos del pago.
 * @param {number} pagoData.monto - El monto del pago.
 * @param {string} pagoData.concepto - La descripción o concepto del pago.
 * @returns {Promise<Object>} La respuesta de la API.
 */
export const registrarPagoCliente = async (id, pagoData) => {
  try {
    const { data } = await api.post(`/clientes/${id}/pagos`, pagoData);
    return data;
  } catch (error) {
    console.error(`Error al registrar pago para el cliente ${id}:`, error);
    throw error;
  }
};
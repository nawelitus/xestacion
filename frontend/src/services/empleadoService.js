import api from './api';

/**
 * Obtiene la lista completa de empleados desde la API.
 * @returns {Promise<Array>} Un arreglo con los empleados.
 */
export const obtenerTodosLosEmpleados = async () => {
    try {
        const { data } = await api.get('/empleados');
        return data;
    } catch (error) {
        console.error("Error al obtener la lista de empleados:", error);
        throw error;
    }
}

export const obtenerResumenDeRetiros = async () => {
    try {
        const { data } = await api.get('/empleados/resumen-retiros');
        return data;
    } catch (error) {
        console.error("Error al obtener el resumen de retiros:", error);
        throw error;
    }
};

/**
 * @NUEVO
 * Obtiene el historial detallado de retiros para un solo empleado.
 * @param {string} nombre - El nombre del empleado a consultar.
 * @returns {Promise<Array>}
 */
export const obtenerDetalleDeRetiros = async (nombre) => {
    try {
        // Usamos encodeURIComponent para asegurar que los nombres con espacios o caracteres especiales funcionen en la URL.
        const { data } = await api.get(`/empleados/detalle-retiros/${encodeURIComponent(nombre)}`);
        return data;
    } catch (error) {
        console.error(`Error al obtener el detalle de retiros para ${nombre}:`, error);
        throw error;
    }
    };
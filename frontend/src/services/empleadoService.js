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
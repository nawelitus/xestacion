import api from './api';
/**
 * Obtiene todos los datos consolidados para el dashboard.
 * @returns {Promise<object>} Un objeto con KPIs y actividad reciente.
 */
export const obtenerDatosDashboard = async () => {
    try {
        const { data } = await api.get('/dashboard');
        return data;
    } catch (error) {
        console.error("Error al obtener los datos del dashboard:", error);
        throw error;
    }
};
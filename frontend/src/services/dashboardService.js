// src/services/dashboardService.js
import api from './api';

/**
 * Obtiene todos los datos consolidados para el dashboard,
 * incluyendo los 3 últimos cierres por turno.
 * @returns {Promise<object>} { kpis, actividadReciente, ultimos_por_turno: [] }
 */
export const obtenerDatosDashboard = async () => {
  try {
    const [resResumen, resUltimos] = await Promise.all([
      api.get('/dashboard'),
      api.get('/dashboard/ultimos-por-turno'),
    ]);

    // resUltimos.data = { items: [...] } según el controlador
    return {
      ...resResumen.data,
      ultimos_por_turno: resUltimos?.data?.items ?? [],
    };
  } catch (error) {
    console.error('Error al obtener los datos del dashboard:', error);
    throw error;
  }
};

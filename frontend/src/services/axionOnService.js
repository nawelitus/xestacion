// @NUEVO ARCHIVO: src/services/axionOnService.js

import api from './api';

/**
 * Obtiene el resumen de Axion ON, opcionalmente filtrado por fecha.
 * @param {object} filtros - Objeto con { fechaDesde, fechaHasta }.
 */
export const obtenerResumenAxionOn = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);

    const { data } = await api.get('/axion-on', { params });
    return data;
  } catch (error) {
    console.error("Error al obtener resumen de Axion ON:", error);
    throw error;
  }
};

/**
 * Obtiene el detalle de Axion ON para un Cierre Z específico.
 * @param {string|number} cierreId - El ID del cierre.
 */
export const obtenerDetalleAxionOn = async (cierreId) => {
  try {
    const { data } = await api.get(`/axion-on/detalle/${cierreId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener detalle de Axion ON para el cierre ${cierreId}:`, error);
    throw error;
  }
};
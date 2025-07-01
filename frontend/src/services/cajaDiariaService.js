// Contenido para: src/services/cajaDiariaService.js

import api from './api';

export const listarCierresParaCaja = async () => {
  // ... código existente sin cambios ...
  try {
    const { data } = await api.get('/caja');
    return data;
  } catch (error) {
    console.error("Error al listar cierres para caja:", error);
    throw error;
  }
};

export const obtenerDetalleCajaProcesada = async (cierreId) => {
  // ... código existente sin cambios ...
  try {
    const { data } = await api.get(`/caja/detalle/${cierreId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener detalle de caja procesada para ${cierreId}:`, error);
    throw error;
  }
};

export const procesarCajaDiaria = async (cierreId, datosCaja) => {
  // ... código existente sin cambios ...
  try {
    const { data } = await api.post(`/caja/procesar/${cierreId}`, datosCaja);
    return data;
  } catch (error) {
    console.error(`Error al procesar la caja del cierre ${cierreId}:`, error);
    throw error;
  }
};

// --- AÑADIR NUEVA FUNCIÓN ---
/**
 * Llama a la API para deshacer el proceso de una caja diaria.
 * @param {string|number} cierreId - El ID del cierre a revertir.
 */
export const deshacerProcesoCaja = async (cierreId) => {
  try {
    const { data } = await api.delete(`/caja/procesar/${cierreId}`);
    return data;
  } catch (error) {
    console.error(`Error al deshacer el proceso de caja para el cierre ${cierreId}:`, error);
    throw error;
  }
};
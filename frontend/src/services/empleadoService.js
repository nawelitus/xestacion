// Contenido COMPLETO y ACTUALIZADO para: src/services/empleadoService.js

import api from './api';

export const obtenerTodosLosEmpleados = async () => {
    // ... (sin cambios)
    try {
        const { data } = await api.get('/empleados');
        return data;
    } catch (error) {
        console.error("Error al obtener la lista de empleados:", error);
        throw error;
    }
}

// ================================================================
// ▼▼▼ NUEVA FUNCIÓN DE SERVICIO ▼▼▼
// ================================================================
export const crearNuevoEmpleado = async (nombreCompleto) => {
    try {
        const { data } = await api.post('/empleados', { nombre_completo: nombreCompleto });
        return data; // Devuelve { mensaje, empleado }
    } catch (error) {
        console.error("Error al crear el nuevo empleado:", error);
        throw error;
    }
}

export const obtenerResumenDeRetiros = async () => {
    // ... (sin cambios)
    try {
        const { data } = await api.get('/empleados/resumen-retiros');
        return data;
    } catch (error) {
        console.error("Error al obtener el resumen de retiros:", error);
        throw error;
    }
};

export const obtenerDetalleDeRetiros = async (nombre) => {
    // ... (sin cambios)
    try {
        const { data } = await api.get(`/empleados/detalle-retiros/${encodeURIComponent(nombre)}`);
        return data;
    } catch (error) {
        console.error(`Error al obtener el detalle de retiros para ${nombre}:`, error);
        throw error;
    }
};
// Contenido COMPLETO y ACTUALIZADO para: src/models/empleadoModel.js

import pool from '../config/db.js';

const EmpleadoModel = {
  // ... (la función guardarNuevos se mantiene sin cambios)
  async guardarNuevos(nombres) {
    if (!nombres || nombres.length === 0) return;
    const sql = 'INSERT IGNORE INTO empleados (nombre_completo) VALUES ?';
    const valores = nombres.map(nombre => [nombre]);
    await pool.query(sql, [valores]);
  },

  // ================================================================
  // ▼▼▼ NUEVA FUNCIÓN PARA CREAR UN SOLO EMPLEADO ▼▼▼
  // ================================================================
  async crearUno(nombreCompleto) {
    const sql = 'INSERT INTO empleados (nombre_completo) VALUES (?)';
    const [resultado] = await pool.query(sql, [nombreCompleto]);
    // Devolvemos el objeto del nuevo empleado para usarlo en el frontend
    return { id: resultado.insertId, nombre_completo: nombreCompleto, estado: 'ACTIVO' };
  },

  // ================================================================
  // ▼▼▼ FUNCIÓN MODIFICADA PARA FILTRAR POR ESTADO ACTIVO ▼▼▼
  // ================================================================
  async listarTodos() {
    const [filas] = await pool.query(
        "SELECT id, nombre_completo FROM empleados WHERE estado = 'ACTIVO' ORDER BY nombre_completo ASC"
    );
    return filas;
  },

  // ... (resto de funciones sin cambios)
  async listarConResumenRetiros() {
    const sql = `
      SELECT
          e.id, e.nombre_completo,
          COALESCE(SUM(rp.monto), 0) AS total_retirado
      FROM empleados e
      LEFT JOIN retiros_personal rp ON e.nombre_completo = rp.nombre_empleado AND rp.estado = 'activo'
      GROUP BY e.id, e.nombre_completo
      ORDER BY e.nombre_completo ASC;
    `;
    const [filas] = await pool.query(sql);
    return filas;
  },
  
  async obtenerDetalleRetirosPorNombre(nombreEmpleado) {
    const sql = `
      SELECT id, estado, 'Adelanto Manual' as origen, fecha_registro as fecha, 
             monto, 'Registrado en Caja Diaria' as concepto, cierre_z_id 
      FROM retiros_personal 
      WHERE nombre_empleado = ?
      ORDER BY fecha DESC;
    `;
    const [filas] = await pool.query(sql, [nombreEmpleado]);
    return filas;
  }
};

export default EmpleadoModel;
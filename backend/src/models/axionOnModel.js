// @MODIFICADO: src/models/axionOnModel.js

import pool from '../config/db.js';

const AxionOnModel = {
  /**
   * Obtiene un resumen de los montos de Axion ON agrupados por Cierre Z,
   * con opción de filtrar por rango de fechas.
   */
  async obtenerResumen(filtros) {
    let query = `
      SELECT 
        cz.id as cierre_z_id,
        cz.numero_z,
        cz.fecha_turno,
        SUM(mcz.monto) as total_axion_on
      FROM movimientos_caja_z mcz
      JOIN cierres_z cz ON mcz.cierre_z_id = cz.id
      WHERE mcz.tipo = 'AXION_ON'
    `;

    const params = [];

    if (filtros.fechaDesde && filtros.fechaHasta) {
      query += ' AND cz.fecha_turno BETWEEN ? AND ?';
      params.push(filtros.fechaDesde, filtros.fechaHasta);
    }

    // --- CAMBIO AQUÍ: Se añadió un espacio al inicio de la línea ---
    query += ' GROUP BY cz.id, cz.numero_z, cz.fecha_turno ORDER BY cz.fecha_turno DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  /**
   * Obtiene el detalle de todos los movimientos de Axion ON para un Cierre Z específico.
   */
  async obtenerDetallePorCierreId(cierreId) {
    const query = `
      SELECT id, descripcion, monto 
      FROM movimientos_caja_z 
      WHERE tipo = 'AXION_ON' AND cierre_z_id = ?
      ORDER BY id
    `;
    const [rows] = await pool.query(query, [cierreId]);
    return rows;
  }
};

export default AxionOnModel;

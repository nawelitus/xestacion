import pool from '../config/db.js';

const EmpleadoModel = {
  /**
   * Guarda una lista de nombres de empleados en la BD, ignorando los duplicados.
   * @param {string[]} nombres - Un arreglo de nombres completos de empleados.
   */
  async guardarNuevos(nombres) {
    if (!nombres || nombres.length === 0) {
      return; // No hace nada si no hay nombres
    }
    // "INSERT IGNORE" es una forma eficiente de insertar solo si el registro no existe (gracias a la UNIQUE KEY).
    const sql = 'INSERT IGNORE INTO empleados (nombre_completo) VALUES ?';
    // Mapeamos el array de nombres a un array de arrays para la inserción masiva.
    const valores = nombres.map(nombre => [nombre]);
    await pool.query(sql, [valores]);
  },

  /**
   * Devuelve una lista de todos los empleados guardados.
   * @returns {Promise<Array>} Un arreglo de objetos de empleados.
   */
  async listarTodos() {
    const [filas] = await pool.query('SELECT id, nombre_completo FROM empleados ORDER BY nombre_completo ASC');
    return filas;
  },

  async listarConResumenRetiros() {
    const sql = `
      SELECT
          e.id,
          e.nombre_completo,
          COALESCE(SUM(rp.monto), 0) AS total_retirado
      FROM
          empleados e
      LEFT JOIN
          retiros_personal rp ON e.nombre_completo = rp.nombre_empleado
      GROUP BY
          e.id, e.nombre_completo
      ORDER BY
          e.nombre_completo ASC;
    `;
    const [filas] = await pool.query(sql);
    return filas;
  },

  /**
   * @MODIFICADO
   * Obtiene una lista detallada de todos los retiros manuales de un empleado.
   */
 async obtenerDetalleRetirosPorNombre(nombreEmpleado) {
    const sql = `
      SELECT 
          id,
          estado,
          'Adelanto Manual' as origen, 
          fecha_registro as fecha, 
          monto, 
          'Registrado en Caja Diaria' as concepto, 
          cierre_z_id 
      FROM retiros_personal 
      WHERE nombre_empleado = ?
      ORDER BY fecha DESC;
    `;
    const [filas] = await pool.query(sql, [nombreEmpleado]);
    return filas;
  }
};
export default EmpleadoModel;

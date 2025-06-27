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
  }
};

export default EmpleadoModel;

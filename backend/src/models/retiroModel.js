import pool from '../config/db.js';

const RetiroModel = {
  /**
   * Obtiene una lista de todos los retiros (movimientos de tipo 'TIRADAS')
   * con la capacidad de filtrar por un rango de fechas.
   * @param {object} filtros - Objeto con los filtros a aplicar.
   * @param {string} [filtros.fechaDesde] - Fecha de inicio del filtro (YYYY-MM-DD).
   * @param {string} [filtros.fechaHasta] - Fecha de fin del filtro (YYYY-MM-DD).
   * @returns {Promise<Array>} Un arreglo de objetos, cada uno representando un retiro.
   */
  async listar(filtros = {}) {
    // La base de nuestra consulta SQL
    let sql = `
      SELECT
        mc.id,
        mc.descripcion,
        mc.monto,
        mc.comprobante_nro,
        cz.fecha_turno,
        cz.id AS cierre_z_id,
        cz.numero_z
      FROM movimientos_caja_z mc
      JOIN cierres_z cz ON mc.cierre_z_id = cz.id
      WHERE mc.tipo = 'TIRADAS'
    `;
    
    const params = [];

    // Añadimos los filtros de fecha a la consulta si se proporcionan
    if (filtros.fechaDesde && filtros.fechaHasta) {
      sql += ' AND cz.fecha_turno BETWEEN ? AND ?';
      params.push(filtros.fechaDesde, filtros.fechaHasta);
    } else if (filtros.fechaDesde) {
      sql += ' AND cz.fecha_turno >= ?';
      params.push(filtros.fechaDesde);
    } else if (filtros.fechaHasta) {
      sql += ' AND cz.fecha_turno <= ?';
      params.push(filtros.fechaHasta);
    }

    sql += ' ORDER BY cz.fecha_turno DESC, mc.id DESC';

    try {
      const [filas] = await pool.query(sql, params);
      return filas;
    } catch (error) {
      console.error("Error en el modelo al listar retiros:", error);
      throw new Error('Error al consultar los retiros en la base de datos.');
    }
  },

async cancelar(id) {
    const sql = "UPDATE retiros_personal SET estado = 'inactivo' WHERE id = ?";
    try {
      const [resultado] = await pool.query(sql, [id]);
      return resultado;
    } catch (error) {
      console.error(`Error en el modelo al cancelar el adelanto con ID ${id}:`, error);
      throw new Error('Error en la base de datos al cancelar el adelanto.');
    }
  }
};

export default RetiroModel;
import pool from '../config/db.js';

const CajaDiariaModel = {
  /**
   * Obtiene un resumen consolidado de todos los cierres y sus detalles para una fecha específica.
   * @param {string} fecha - La fecha para la cual se generará el resumen (formato YYYY-MM-DD).
   * @returns {Promise<object|null>} Un objeto con los datos consolidados del día.
   */
  async obtenerResumenPorFecha(fecha) {
    // Primero, obtenemos los IDs de todos los cierres para la fecha dada.
    const [cierresDelDia] = await pool.query('SELECT id FROM cierres_z WHERE fecha_turno = ?', [fecha]);

    // Si no hubo cierres en esa fecha, retornamos null para que el controlador lo maneje.
    if (cierresDelDia.length === 0) {
      return null;
    }

    // Extraemos los IDs en un array para usarlos en las cláusulas IN (...)
    const idsDeCierres = cierresDelDia.map(c => c.id);

    // Ejecutamos todas las consultas de agregación y detalle en paralelo para máxima eficiencia.
    try {
      const [
        resumenAgregado,
        ventasCombustible,
        ventasShop,
        movimientosCaja,
        remitos
      ] = await Promise.all([
        // 1. Resumen de totales agregados (SUM)
        pool.query(`
          SELECT
            COALESCE(SUM(total_bruto), 0) AS total_bruto_dia,
            COALESCE(SUM(total_remitos), 0) AS total_remitos_dia,
            COALESCE(SUM(total_gastos), 0) AS total_gastos_dia,
            COALESCE(SUM(total_a_rendir), 0) AS total_a_rendir_dia,
            COUNT(id) AS cantidad_cierres
          FROM cierres_z
          WHERE id IN (?)
        `, [idsDeCierres]),

        // 2. Detalle de ventas de combustible de todos los cierres del día
        pool.query('SELECT * FROM ventas_combustible_z WHERE cierre_z_id IN (?) ORDER BY producto_nombre', [idsDeCierres]),

        // 3. Detalle de ventas del shop
        pool.query('SELECT * FROM ventas_shop_z WHERE cierre_z_id IN (?) ORDER BY producto_nombre', [idsDeCierres]),
        
        // 4. Detalle de todos los movimientos de caja (gastos, tiradas, etc.)
        pool.query('SELECT * FROM movimientos_caja_z WHERE cierre_z_id IN (?) ORDER BY tipo, descripcion', [idsDeCierres]),

        // 5. Detalle de todos los remitos, incluyendo el nombre del cliente
        pool.query(`
          SELECT m.*, c.nombre AS cliente_nombre
          FROM movimientos_cta_cte m
          JOIN clientes c ON m.cliente_id = c.id
          WHERE m.cierre_z_id IN (?)
          ORDER BY c.nombre
        `, [idsDeCierres])
      ]);

      // Estructuramos la respuesta final en un único objeto
      return {
        fecha_consulta: fecha,
        resumen: resumenAgregado[0][0], // El resultado de la consulta de agregación
        ventasCombustible: ventasCombustible[0],
        ventasShop: ventasShop[0],
        movimientosCaja: movimientosCaja[0],
        remitos: remitos[0]
      };

    } catch (error) {
      console.error(`Error al obtener resumen de caja diaria para la fecha ${fecha}:`, error);
      throw new Error('Error al consultar el resumen diario en la base de datos.');
    }
  }
};

export default CajaDiariaModel;
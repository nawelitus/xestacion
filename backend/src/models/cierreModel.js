// Contenido COMPLETO y ACTUALIZADO para: src/models/cierreModel.js

import pool from '../config/db.js';
import ClienteModel from './clienteModel.js';

const CierreModel = {
  // --- La función insertarCierreCompleto no cambia ---
  async insertarCierreCompleto(datosParseados) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const remitosParaSp = [];
      for (const remito of datosParseados.remitos) {
        const clienteId = await ClienteModel.buscarOCrear(remito.cliente_nombre, connection);
        remitosParaSp.push({
          cliente_id: clienteId,
          concepto: `Remito ${remito.comprobante}`,
          monto: remito.monto,
        });
      }
      const { cabecera, resumenCaja, ventasCombustible, ventasShop, movimientosCaja } = datosParseados;
      const params = [
        cabecera.numero_z, cabecera.fecha_turno, cabecera.hora_inicio, cabecera.hora_fin,
        resumenCaja.total_bruto, resumenCaja.total_remitos, resumenCaja.total_gastos,
        resumenCaja.total_a_rendir, resumenCaja.total_faltante, cabecera.usuario_carga_id,
        JSON.stringify(ventasCombustible), JSON.stringify(ventasShop),
        JSON.stringify(movimientosCaja), JSON.stringify(remitosParaSp)
      ];
      await connection.query('CALL sp_insertar_cierre_completo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', params);
      await connection.commit();
      return { mensaje: `Cierre Z N° ${cabecera.numero_z} guardado exitosamente.` };
    } catch (error) {
      await connection.rollback();
      console.error("Error en la transacción del Cierre Z:", error);
      throw new Error(`Error al guardar en la base de datos: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  // --- La función listarRecientes no cambia ---
  async listarRecientes() {
    const query = `
      SELECT 
        cz.id, cz.numero_z, cz.fecha_turno, cz.total_a_rendir, cz.fecha_carga,
        u.nombre_completo AS usuario_carga_nombre
      FROM cierres_z cz
      JOIN usuarios u ON cz.usuario_carga_id = u.id
      ORDER BY cz.fecha_carga DESC
      LIMIT 10;
    `;
    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error al obtener los cierres recientes:", error);
      throw new Error('Error al consultar los cierres en la base de datos.');
    }
  },

  /**
   * @NUEVO
   * Busca todos los datos detallados de un Cierre Z específico por su ID.
   * @param {number} id - El ID del Cierre Z a buscar.
   * @returns {Promise<object|null>} Un objeto con todos los detalles del cierre, o null si no se encuentra.
   */
  async buscarDetallePorId(id) {
    // Usamos Promise.all para ejecutar todas las consultas en paralelo para mayor eficiencia
    try {
      const [cabeceraResult, ventasCombustible, ventasShop, movimientosCaja, remitos] = await Promise.all([
        // 1. Obtener la cabecera del cierre y datos del usuario
        pool.query(`
          SELECT cz.*, u.nombre_completo as usuario_carga_nombre
          FROM cierres_z cz
          JOIN usuarios u ON cz.usuario_carga_id = u.id
          WHERE cz.id = ?
        `, [id]),
        
        // 2. Obtener ventas de combustible
        pool.query('SELECT * FROM ventas_combustible_z WHERE cierre_z_id = ?', [id]),

        // 3. Obtener ventas del shop
        pool.query('SELECT * FROM ventas_shop_z WHERE cierre_z_id = ?', [id]),

        // 4. Obtener todos los movimientos de caja (gastos, etc.)
        pool.query('SELECT * FROM movimientos_caja_z WHERE cierre_z_id = ?', [id]),

        // 5. Obtener los remitos (movimientos de cta cte) y datos del cliente
        pool.query(`
          SELECT m.*, c.nombre as cliente_nombre
          FROM movimientos_cta_cte m
          JOIN clientes c ON m.cliente_id = c.id
          WHERE m.cierre_z_id = ?
        `, [id])
      ]);

      // Verificamos si encontramos el cierre principal
      if (cabeceraResult[0].length === 0) {
        return null; // Si no hay cabecera, el cierre no existe.
      }

      // Estructuramos la respuesta en un único objeto
      return {
        cabecera: cabeceraResult[0][0],
        ventasCombustible: ventasCombustible[0],
        ventasShop: ventasShop[0],
        movimientosCaja: movimientosCaja[0],
        remitos: remitos[0]
      };

    } catch (error) {
      console.error(`Error al buscar el detalle del cierre con ID ${id}:`, error);
      throw new Error('Error al consultar el detalle del cierre en la base de datos.');
    }
  }
};

export default CierreModel;
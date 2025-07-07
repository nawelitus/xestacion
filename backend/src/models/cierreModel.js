// Contenido COMPLETO y ACTUALIZADO para: src/models/cierreModel.js

import pool from '../config/db.js';
import ClienteModel from './clienteModel.js';

const CierreModel = {
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
        cabecera.cerrado_por, 
        resumenCaja.total_cupones, resumenCaja.total_mercadopago,
        resumenCaja.total_tiradas, resumenCaja.total_axion_on,
        JSON.stringify(ventasCombustible), JSON.stringify(ventasShop),
        JSON.stringify(movimientosCaja), JSON.stringify(remitosParaSp)
      ];
      await connection.query('CALL sp_insertar_cierre_completo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', params);
      
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
  
  async buscarDetallePorId(id) {
    try {
      const [cabeceraResult, ventasCombustible, ventasShop, movimientosCaja, remitos] = await Promise.all([
        pool.query(`
          SELECT cz.*, u.nombre_completo as usuario_carga_nombre
          FROM cierres_z cz
          JOIN usuarios u ON cz.usuario_carga_id = u.id
          WHERE cz.id = ?
        `, [id]),
        pool.query('SELECT * FROM ventas_combustible_z WHERE cierre_z_id = ?', [id]),
        pool.query('SELECT * FROM ventas_shop_z WHERE cierre_z_id = ?', [id]),
        pool.query('SELECT * FROM movimientos_caja_z WHERE cierre_z_id = ?', [id]),
        pool.query(`
          SELECT m.*, c.nombre as cliente_nombre
          FROM movimientos_cta_cte m
          JOIN clientes c ON m.cliente_id = c.id
          WHERE m.cierre_z_id = ?
        `, [id])
      ]);

      if (cabeceraResult[0].length === 0) {
        return null;
      }

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
  },

  // ================================================================
  // NUEVA FUNCIONALIDAD: Eliminar un Cierre Z completo
  // ================================================================
  /**
   * Elimina un Cierre Z y todos sus registros asociados de forma transaccional.
   * @param {number} id - El ID del Cierre Z a eliminar.
   * @returns {Promise<object>} Resultado de la operación.
   */
  async eliminarCierreCompletoPorId(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // El orden es importante para respetar las claves foráneas.
      // Primero se eliminan los registros de las tablas hijas.
      await connection.query('DELETE FROM ventas_combustible_z WHERE cierre_z_id = ?', [id]);
      await connection.query('DELETE FROM ventas_shop_z WHERE cierre_z_id = ?', [id]);
      await connection.query('DELETE FROM movimientos_caja_z WHERE cierre_z_id = ?', [id]);
      await connection.query('DELETE FROM movimientos_cta_cte WHERE cierre_z_id = ?', [id]);
      await connection.query('DELETE FROM caja_diaria_creditos WHERE cierre_z_id = ?', [id]);
      await connection.query('DELETE FROM retiros_personal WHERE cierre_z_id = ?', [id]);
      
      // Finalmente, se elimina el registro de la tabla maestra.
      const [resultado] = await connection.query('DELETE FROM cierres_z WHERE id = ?', [id]);

      await connection.commit();

      // Si affectedRows es 0, significa que no se encontró un cierre con ese ID.
      if (resultado.affectedRows === 0) {
        throw new Error('No se encontró un Cierre Z con el ID proporcionado para eliminar.');
      }

      return resultado;

    } catch (error) {
      await connection.rollback();
      console.error(`Error en la transacción de eliminación del Cierre Z con ID ${id}:`, error);
      // Lanza el error para que el controlador lo capture.
      throw error; 
    } finally {
      connection.release();
    }
  }
};

export default CierreModel;

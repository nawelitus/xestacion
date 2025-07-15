// Contenido COMPLETO y ACTUALIZADO para: src/models/cajaDiariaModel.js

import pool from '../config/db.js';
import CierreModel from './cierreModel.js';

const CajaDiariaModel = {
  async listarTodosParaCaja() {
    // ... (sin cambios en esta función)
    const [filas] = await pool.query(
      `SELECT id, numero_z, fecha_turno, total_a_rendir, caja_procesada 
       FROM cierres_z 
       ORDER BY caja_procesada ASC, fecha_turno DESC, id DESC`
    );
    return filas;
  },

  async obtenerDetalleProcesado(cierreId) {
    // ... (sin cambios en esta función)
     try {
      const [ detalleCierreBase, creditos, retiros ] = await Promise.all([
        CierreModel.buscarDetallePorId(cierreId),
        pool.query('SELECT * FROM caja_diaria_creditos WHERE cierre_z_id = ? ORDER BY id', [cierreId]),
        pool.query('SELECT * FROM retiros_personal WHERE cierre_z_id = ? ORDER BY id', [cierreId])
      ]);
      if (!detalleCierreBase) return null;
      return { ...detalleCierreBase, creditos: creditos[0], retiros: retiros[0] };
    } catch (error) {
      console.error(`Error al obtener detalle de caja procesada para cierre ${cierreId}:`, error);
      throw new Error('Error en la base de datos al obtener el detalle de la caja.');
    }
  },

  async procesarCaja(cierreId, datos) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { billetera, creditos, retiros } = datos;
      
      const [cierreResult] = await connection.query('SELECT total_a_rendir FROM cierres_z WHERE id = ?', [cierreId]);
      if (cierreResult.length === 0) {
        throw new Error(`No se encontró el Cierre Z con ID ${cierreId}.`);
      }
      const cierreOriginal = cierreResult[0];
      
      const totalRendirZ = Number(cierreOriginal.total_a_rendir) || 0;
      const totalCreditos = creditos.reduce((acc, c) => acc + c.importe, 0);
      const diferenciaBilletera = (billetera.entregado || 0) - (billetera.recibido || 0);
      const totalDeclaradoFinal = totalCreditos + diferenciaBilletera;
      const diferenciaFinal = totalDeclaradoFinal - totalRendirZ;

      if (creditos.length > 0) {
        const creditosAInsertar = creditos.filter(c => c.importe > 0).map(c => [cierreId, c.item, c.importe]);
        if (creditosAInsertar.length > 0) {
            await connection.query('INSERT INTO caja_diaria_creditos (cierre_z_id, item, importe) VALUES ?', [creditosAInsertar]);
        }
      }
      
      if (retiros.length > 0) {
        const retirosAInsertar = retiros.map(r => [cierreId, r.nombre_empleado, r.monto]);
        if (retirosAInsertar.length > 0) {
            await connection.query('INSERT INTO retiros_personal (cierre_z_id, nombre_empleado, monto) VALUES ?', [retirosAInsertar]);
        }
      }

      await connection.query(
        `UPDATE cierres_z SET 
           caja_procesada = 1,
           declarado_billetera_recibido = ?,
           declarado_billetera_entregado = ?,
           declarado_total_final = ?,
           diferencia_final = ?
         WHERE id = ?`,
        [billetera.recibido, billetera.entregado, totalDeclaradoFinal, diferenciaFinal, cierreId]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      // ==================================================================
      // ▼▼▼ MEJORA EN EL LOG DE ERRORES ▼▼▼
      // ==================================================================
      console.error(`ERROR EN MODELO al procesar caja (transacción revertida):`, error);
      throw new Error(`Error en la base de datos: ${error.message}`);
      // ==================================================================
    } finally {
      connection.release();
    }
  },

  async deshacerProceso(cierreId) {
    // ... (sin cambios en esta función)
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM caja_diaria_creditos WHERE cierre_z_id = ?', [cierreId]);
      await connection.query('DELETE FROM retiros_personal WHERE cierre_z_id = ?', [cierreId]);
      await connection.query(
        `UPDATE cierres_z SET 
           caja_procesada = 0, declarado_billetera_recibido = NULL, declarado_billetera_entregado = NULL,
           declarado_total_final = NULL, diferencia_final = NULL
         WHERE id = ?`, [cierreId]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw new Error('Error en la base de datos al deshacer el proceso de la caja.');
    } finally {
      connection.release();
    }
  }
};

export default CajaDiariaModel;
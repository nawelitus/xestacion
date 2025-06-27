import pool from '../config/db.js';
import CierreModel from './cierreModel.js'; // Importamos CierreModel para reutilizar su lógica

const CajaDiariaModel = {
  /**
   * @MODIFICADO
   * Lista todos los Cierres Z, indicando su estado de procesamiento de caja.
   * @returns {Promise<Array>} Un arreglo de todos los cierres.
   */
  async listarTodosParaCaja() {
    const [filas] = await pool.query(
      `SELECT id, numero_z, fecha_turno, total_a_rendir, caja_procesada 
       FROM cierres_z 
       ORDER BY caja_procesada ASC, fecha_turno DESC, id DESC`
    );
    return filas;
  },

  /**
   * @NUEVO
   * Obtiene todos los detalles de una caja diaria ya procesada.
   * @param {number} cierreId - El ID del Cierre Z a consultar.
   * @returns {Promise<object|null>} Un objeto con todos los datos o null si no se encuentra.
   */
  async obtenerDetalleProcesado(cierreId) {
    try {
      // Usamos Promise.all para buscar todos los datos en paralelo
      const [
        detalleCierreBase,
        billeteraResult,
        creditos,
        retiros
      ] = await Promise.all([
        // 1. Reutilizamos la función de CierreModel para obtener los datos base del Z
        CierreModel.buscarDetallePorId(cierreId),
        // 2. Buscamos los datos de la billetera
        pool.query('SELECT * FROM caja_diaria_billetera WHERE cierre_z_id = ?', [cierreId]),
        // 3. Buscamos los créditos
        pool.query('SELECT * FROM caja_diaria_creditos WHERE cierre_z_id = ? ORDER BY id', [cierreId]),
        // 4. Buscamos los retiros de personal
        pool.query('SELECT * FROM retiros_personal WHERE cierre_z_id = ? ORDER BY id', [cierreId])
      ]);

      if (!detalleCierreBase) {
        return null; // El cierre no existe
      }
      
      return {
        cierre: detalleCierreBase, // Datos del Cierre Z
        billetera: billeteraResult[0][0] || null, // Los datos de la billetera
        creditos: creditos[0], // La lista de créditos
        retiros: retiros[0] // La lista de retiros
      };

    } catch (error) {
      console.error(`Error al obtener detalle de caja procesada para cierre ${cierreId}:`, error);
      throw new Error('Error en la base de datos al obtener el detalle de la caja.');
    }
  },

  /**
   * La función procesarCaja no necesita cambios.
   */
  async procesarCaja(cierreId, datos) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { billetera, creditos, retiros } = datos;
      await connection.query(
        'INSERT INTO caja_diaria_billetera (cierre_z_id, dinero_recibido, dinero_entregado) VALUES (?, ?, ?)',
        [cierreId, billetera.recibido, billetera.entregado]
      );

      const creditosAInsertar = creditos
        .filter(c => c.importe > 0)
        .map(c => [cierreId, c.item, c.importe]);
      
      if (creditosAInsertar.length > 0) {
        await connection.query('INSERT INTO caja_diaria_creditos (cierre_z_id, item, importe) VALUES ?', [creditosAInsertar]);
      }
      
      const retirosAInsertar = retiros.map(r => [cierreId, r.nombre, r.monto]);
      if (retirosAInsertar.length > 0) {
        await connection.query('INSERT INTO retiros_personal (cierre_z_id, nombre_empleado, monto) VALUES ?', [retirosAInsertar]);
      }

      await connection.query('UPDATE cierres_z SET caja_procesada = 1 WHERE id = ?', [cierreId]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw new Error('Error en la base de datos al procesar la caja diaria.');
    } finally {
      connection.release();
    }
  }
};

export default CajaDiariaModel;
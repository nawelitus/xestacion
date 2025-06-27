import pool from '../config/db.js';

const CajaDiariaModel = {
  /**
   * Lista todos los Cierres Z que aún no han sido procesados en la Caja Diaria.
   * @returns {Promise<Array>} Un arreglo de cierres pendientes.
   */
  async listarPendientes() {
    const [filas] = await pool.query(
      `SELECT id, numero_z, fecha_turno, total_a_rendir 
       FROM cierres_z 
       WHERE caja_procesada = 0 
       ORDER BY fecha_turno DESC, id DESC`
    );
    return filas;
  },

  /**
   * Procesa y guarda todos los datos de la caja diaria para un Cierre Z específico.
   * Ejecuta múltiples inserciones dentro de una transacción para garantizar la integridad.
   * @param {number} cierreId - El ID del Cierre Z que se está procesando.
   * @param {object} datos - El objeto con todos los datos del formulario del modal.
   * @returns {Promise<void>}
   */
  async procesarCaja(cierreId, datos) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insertar los datos de la billetera
      const { billetera, creditos, retiros } = datos;
      await connection.query(
        'INSERT INTO caja_diaria_billetera (cierre_z_id, dinero_recibido, dinero_entregado) VALUES (?, ?, ?)',
        [cierreId, billetera.recibido, billetera.entregado]
      );

      // 2. Insertar los créditos (solo los que tengan un importe)
      const creditosAInsertar = creditos
        .filter(c => c.importe > 0)
        .map(c => [cierreId, c.item, c.importe]);
      
      if (creditosAInsertar.length > 0) {
        await connection.query(
          'INSERT INTO caja_diaria_creditos (cierre_z_id, item, importe) VALUES ?',
          [creditosAInsertar]
        );
      }
      
      // 3. Insertar los retiros de personal
      const retirosAInsertar = retiros.map(r => [cierreId, r.nombre, r.monto]);
      if (retirosAInsertar.length > 0) {
        await connection.query(
          'INSERT INTO retiros_personal (cierre_z_id, nombre_empleado, monto) VALUES ?',
          [retirosAInsertar]
        );
      }

      // 4. Marcar el Cierre Z como procesado
      await connection.query(
        'UPDATE cierres_z SET caja_procesada = 1 WHERE id = ?',
        [cierreId]
      );

      // Si todo fue exitoso, confirma la transacción
      await connection.commit();
    } catch (error) {
      // Si algo falla, revierte todos los cambios
      await connection.rollback();
      console.error(`Error en la transacción al procesar caja para el cierre ${cierreId}:`, error);
      throw new Error('Error en la base de datos al procesar la caja diaria.');
    } finally {
      // Libera la conexión al pool
      connection.release();
    }
  }
};

export default CajaDiariaModel;
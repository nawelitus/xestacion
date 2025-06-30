import pool from '../config/db.js';
import CierreModel from './cierreModel.js';

const CajaDiariaModel = {
  async listarTodosParaCaja() {
    const [filas] = await pool.query(
      `SELECT id, numero_z, fecha_turno, total_a_rendir, caja_procesada 
       FROM cierres_z 
       ORDER BY caja_procesada ASC, fecha_turno DESC, id DESC`
    );
    return filas;
  },

  /**
   * @MODIFICADO
   * Obtiene todos los detalles de una caja diaria ya procesada.
   * Se elimina la consulta a la tabla 'caja_diaria_billetera' que ya no existe.
   */
  async obtenerDetalleProcesado(cierreId) {
    try {
      // La consulta a la billetera ha sido eliminada del Promise.all
      const [
        detalleCierreBase,
        creditos,
        retiros
      ] = await Promise.all([
        CierreModel.buscarDetallePorId(cierreId),
        pool.query('SELECT * FROM caja_diaria_creditos WHERE cierre_z_id = ? ORDER BY id', [cierreId]),
        pool.query('SELECT * FROM retiros_personal WHERE cierre_z_id = ? ORDER BY id', [cierreId])
      ]);

      if (!detalleCierreBase) {
        return null;
      }
      
      // El objeto devuelto ya no necesita una propiedad 'billetera' separada,
      // porque sus datos ya están dentro de 'detalleCierreBase.cabecera'.
      return {
        cierre: detalleCierreBase,
        creditos: creditos[0],
        retiros: retiros[0]
      };

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
      const cierreOriginal = (await connection.query('SELECT total_a_rendir FROM cierres_z WHERE id = ?', [cierreId]))[0][0];
      
 // ======================= LÓGICA DE CÁLCULO SINCRONIZADA =======================
      const totalRendirZ = Number(cierreOriginal.total_a_rendir) || 0;
      const totalCreditos = creditos.reduce((acc, c) => acc + c.importe, 0);
      
      const diferenciaBilletera = (billetera.entregado || 0) - (billetera.recibido || 0);

      // El total declarado es la suma de los créditos más la diferencia neta de la billetera.
      const totalDeclaradoFinal = totalCreditos + diferenciaBilletera;
      
      // La diferencia final es lo declarado menos lo que se debía rendir del Z.
      const diferenciaFinal = totalDeclaradoFinal - totalRendirZ;
      // ===================== FIN DE LA LÓGICA SINCRONIZADA ======================

      const creditosAInsertar = creditos.filter(c => c.importe > 0).map(c => [cierreId, c.item, c.importe]);
      if (creditosAInsertar.length > 0) {
        await connection.query('INSERT INTO caja_diaria_creditos (cierre_z_id, item, importe) VALUES ?', [creditosAInsertar]);
      }
      
      const retirosAInsertar = retiros.map(r => [cierreId, r.nombre, r.monto]);
      if (retirosAInsertar.length > 0) {
        await connection.query('INSERT INTO retiros_personal (cierre_z_id, nombre_empleado, monto) VALUES ?', [retirosAInsertar]);
      }

      await connection.query(
        `UPDATE cierres_z SET 
           caja_procesada = 1,
           declarado_billetera_recibido = ?,
           declarado_billetera_entregado = ?,
           declarado_total_final = ?,
           diferencia_final = ?
         WHERE id = ?`,
       // [billetera.recibido, billetera.entregado, totalDeclarado, diferenciaFinal, cierreId]
        [billetera.recibido, billetera.entregado, totalDeclaradoFinal, diferenciaFinal, cierreId]

      );

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
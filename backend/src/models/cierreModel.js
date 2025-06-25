
// ================================================================
// ARCHIVO: src/models/cierreModel.js (NUEVO)
// Se encarga de la lógica de negocio para insertar un cierre completo.
// ================================================================
import pool from '../config/db.js';
import ClienteModel from './clienteModel.js';

const CierreModel = {
  /**
   * Inserta un cierre completo en la base de datos usando una transacción
   * y el procedimiento almacenado sp_insertar_cierre_completo.
   * @param {object} datosParseados - El objeto JSON generado por el parser.
   * @returns {Promise<object>} El resultado de la operación.
   */
  async insertarCierreCompleto(datosParseados) {
    const connection = await pool.getConnection(); // Obtener una conexión del pool
    
    try {
      await connection.beginTransaction(); // Iniciar transacción

      // Procesar remitos para obtener los IDs de los clientes
      const remitosParaSp = [];
      for (const remito of datosParseados.remitos) {
        const clienteId = await ClienteModel.buscarOCrear(remito.cliente_nombre, connection);
        remitosParaSp.push({
          cliente_id: clienteId,
          concepto: `Remito ${remito.comprobante}`,
          monto: remito.monto,
        });
      }

      // Preparar los parámetros para el Stored Procedure
      const { cabecera, resumenCaja, ventasCombustible, ventasShop, movimientosCaja } = datosParseados;
      
      const params = [
        cabecera.numero_z,
        cabecera.fecha_turno,
        cabecera.hora_inicio,
        cabecera.hora_fin,
        resumenCaja.total_bruto,
        resumenCaja.total_remitos,
        resumenCaja.total_gastos,
        resumenCaja.total_a_rendir,
        resumenCaja.total_faltante,
        cabecera.usuario_carga_id,
        JSON.stringify(ventasCombustible),
        JSON.stringify(ventasShop),
        JSON.stringify(movimientosCaja),
        JSON.stringify(remitosParaSp)
      ];

      // Ejecutar el procedimiento almacenado
      await connection.query('CALL sp_insertar_cierre_completo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', params);
      
      await connection.commit(); // Confirmar la transacción si todo fue exitoso
      
      return { mensaje: `Cierre Z N° ${cabecera.numero_z} guardado exitosamente.` };

    } catch (error) {
      await connection.rollback(); // Revertir la transacción en caso de error
      console.error("Error en la transacción del Cierre Z:", error);
      // Lanzar el error para que sea atrapado por el controlador
      throw new Error(`Error al guardar en la base de datos: ${error.message}`);
    } finally {
      connection.release(); // Siempre liberar la conexión al final
    }
  }
};

export default CierreModel;
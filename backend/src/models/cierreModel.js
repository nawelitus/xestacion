// Contenido COMPLETO y CORREGIDO para: src/models/cierreModel.js

import db from '../config/db.js';

const CierreModel = {

  /**
   * Ejecuta el Stored Procedure 'sp_insertar_cierre_completo' para guardar
   * un cierre y todos sus detalles en una única transacción.
   * @param {object} datosCierre - Objeto que contiene todos los parámetros para el SP.
   * @returns {Promise<object>} - El resultado de la inserción, incluyendo el ID del nuevo cierre.
   */
  async insertarCierreCompleto(datosCierre) {
    const {
      numero_z, fecha_turno, hora_inicio, hora_fin, total_bruto,
      total_remitos, total_gastos, total_a_rendir, total_faltante,
      usuario_carga_id, cerrado_por, total_cupones, total_mercadopago,
      total_tiradas, total_axion_on,
      declarado_empleado_efectivo, declarado_empleado_tarjeta,
      declarado_empleado_cheques, declarado_empleado_creditos, declarado_empleado_tickets,
      ventas_producto_json, remitos_json, movimientos_caja_json,
      cupones_json, bajas_producto_json, percepciones_iibb_json,
      mercadopago_json, tiradas_json, axion_on_json, tanques_json
    } = datosCierre;

    // CORRECCIÓN: Se eliminó un '?' extra. Ahora hay 30 placeholders,
    // que coinciden con los 30 parámetros del Stored Procedure.
    const query = 'CALL sp_insertar_cierre_completo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    try {
      const [resultado] = await db.query(query, [
        numero_z, fecha_turno, hora_inicio, hora_fin, total_bruto,
        total_remitos, total_gastos, total_a_rendir, total_faltante,
        usuario_carga_id, cerrado_por, total_cupones, total_mercadopago,
        total_tiradas, total_axion_on,
        declarado_empleado_efectivo, declarado_empleado_tarjeta,
        declarado_empleado_cheques, declarado_empleado_creditos, declarado_empleado_tickets,
        ventas_producto_json, remitos_json, movimientos_caja_json,
        cupones_json, bajas_producto_json, percepciones_iibb_json,
        mercadopago_json, tiradas_json, axion_on_json, tanques_json
      ]);
      // El SP devuelve el ID del cierre insertado
      return resultado[0][0]; 
    } catch (error) {
      console.error('Error en el modelo al insertar cierre completo:', error);
      throw error;
    }
  },

  /**
   * Busca el detalle completo de un Cierre Z por su ID.
   */
  async buscarDetallePorId(id) {
    const detalleCompleto = {};
    const [cabeceras] = await db.query(
      `SELECT cz.*, u.nombre_completo as usuario_carga_nombre 
       FROM cierres_z cz 
       JOIN usuarios u ON cz.usuario_carga_id = u.id 
       WHERE cz.id = ?`,
      [id]
    );

    if (cabeceras.length === 0) {
      return null;
    }
    detalleCompleto.cabecera = cabeceras[0];

    const [
      ventasProducto, bajasProducto, percepcionesIIBB, mercadoPago,
      tiradas, axionOn, tanques, cupones, movimientosCaja, remitos
    ] = await Promise.all([
      db.query('SELECT descripcion, importe FROM cierre_z_ventas_producto WHERE cierre_z_id = ?', [id]),
      db.query('SELECT descripcion, importe FROM cierre_z_bajas_producto WHERE cierre_z_id = ?', [id]),
      db.query('SELECT descripcion, importe FROM cierre_z_percepciones_iibb WHERE cierre_z_id = ?', [id]),
      db.query('SELECT descripcion, importe FROM cierre_z_mercadopago WHERE cierre_z_id = ?', [id]),
      db.query('SELECT descripcion, importe FROM cierre_z_tiradas WHERE cierre_z_id = ?', [id]),
      db.query('SELECT descripcion, importe FROM cierre_z_axion_on WHERE cierre_z_id = ?', [id]),
      db.query('SELECT numero_tanque, producto, despachado FROM cierre_z_tanques WHERE cierre_z_id = ?', [id]),
      db.query('SELECT item as descripcion, importe FROM caja_diaria_creditos WHERE cierre_z_id = ?', [id]),
      db.query('SELECT tipo, descripcion, comprobante_nro, monto as importe FROM movimientos_caja_z WHERE cierre_z_id = ?', [id]),
      db.query(
        `SELECT m.concepto, m.monto as importe, c.nombre as cliente_nombre 
         FROM movimientos_cta_cte m 
         JOIN clientes c ON m.cliente_id = c.id 
         WHERE m.cierre_z_id = ?`,
        [id]
      )
    ]);

    detalleCompleto.ventasPorProducto = ventasProducto[0];
    detalleCompleto.bajasPorProducto = bajasProducto[0];
    detalleCompleto.percepcionesIIBB = percepcionesIIBB[0];
    detalleCompleto.mercadoPago = mercadoPago[0];
    detalleCompleto.tiradas = tiradas[0];
    detalleCompleto.axionOn = axionOn[0];
    detalleCompleto.detalleTanques = tanques[0];
    detalleCompleto.cupones = cupones[0];
    detalleCompleto.remitos = remitos[0];
    detalleCompleto.gastos = movimientosCaja[0].filter(m => m.tipo === 'GASTO');
    detalleCompleto.ingresos = movimientosCaja[0].filter(m => m.tipo === 'INGRESO');

    return detalleCompleto;
  },

  /**
   * Lista los cierres de caja más recientes.
   */
  async listarRecientes() {
    const query = `
      SELECT 
        cz.id, cz.numero_z, cz.fecha_turno, cz.total_a_rendir, 
        cz.total_faltante, cz.caja_procesada, u.nombre_completo AS cargado_por 
      FROM cierres_z cz
      JOIN usuarios u ON cz.usuario_carga_id = u.id
      ORDER BY cz.fecha_turno DESC, cz.id DESC
      LIMIT 50;
    `;
    try {
      const [cierres] = await db.query(query);
      return cierres;
    } catch (error) {
      console.error('Error en el modelo al listar cierres recientes:', error);
      throw error;
    }
  },

  /**
   * Elimina un Cierre Z por su ID.
   */
  async eliminarCierreCompletoPorId(id) {
    const query = 'DELETE FROM cierres_z WHERE id = ?';
    try {
      const [resultado] = await db.query(query, [id]);
      if (resultado.affectedRows === 0) {
        throw new Error('No se encontró un Cierre Z con el ID proporcionado para eliminar.');
      }
      return { mensaje: 'Cierre Z eliminado exitosamente.' };
    } catch (error) {
      console.error('Error en el modelo al eliminar cierre:', error);
      throw error;
    }
  }
};

export default CierreModel;

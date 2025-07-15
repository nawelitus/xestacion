import { parsearCierreZ } from '../utils/cierreParser.js';
import CierreModel from '../models/cierreModel.js';
import ClienteModel from '../models/clienteModel.js';

const CierreController = {
  async subirYProcesarCierre(req, res) {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se ha subido ningún archivo.' });
    }

    try {
      const textoCierre = req.file.buffer.toString('utf-8');
      const usuario_carga_id = req.usuario.id;
      const datosParseados = parsearCierreZ(textoCierre);

      if (!datosParseados.encabezado || !datosParseados.encabezado.numero_z) {
        return res.status(400).json({
          mensaje: 'Error al parsear el cierre. Verifique el formato del texto.',
          errores: datosParseados.errores || ['No se pudo identificar el número de Z.']
        });
      }

      // --- LÓGICA CORREGIDA PARA PROCESAR REMITOS ---
      const remitosParaSP = [];
      for (const remito of datosParseados.remitos) {
        // Se extrae el nombre del cliente del objeto remito parseado
        const nombreCliente = remito.cliente_nombre;
        const cliente = await ClienteModel.findOrCreateByName(nombreCliente);
        
        remitosParaSP.push({
          cliente_id: cliente.id,
          // Se usa el número de remito como el concepto, tal como se solicitó
          concepto: remito.numero_remito,
          monto: remito.importe
        });
      }

      const movimientosCajaParaSP = [
        ...datosParseados.gastos.map(g => ({ ...g, tipo: 'GASTO' })),
        ...datosParseados.ingresos.map(i => ({ ...i, tipo: 'INGRESO' }))
      ];

      const datosParaGuardar = {
        ...datosParseados.encabezado,
        usuario_carga_id,
        declarado_empleado_efectivo: datosParseados.declaracionEmpleado.efectivo || 0,
        declarado_empleado_tarjeta: datosParseados.declaracionEmpleado.tarjetas || 0,
        declarado_empleado_cheques: datosParseados.declaracionEmpleado.cheques || 0,
        declarado_empleado_creditos: datosParseados.declaracionEmpleado.creditos || 0,
        declarado_empleado_tickets: datosParseados.declaracionEmpleado.tickets || 0,
        ventas_producto_json: JSON.stringify(datosParseados.ventasPorProducto),
        remitos_json: JSON.stringify(remitosParaSP), // Se envía el array corregido
        movimientos_caja_json: JSON.stringify(movimientosCajaParaSP),
        cupones_json: JSON.stringify(datosParseados.cupones),
        bajas_producto_json: JSON.stringify(datosParseados.bajasPorProducto),
        percepciones_iibb_json: JSON.stringify(datosParseados.percepcionesIIBB),
        mercadopago_json: JSON.stringify(datosParseados.mercadoPago),
        tiradas_json: JSON.stringify(datosParseados.tiradas),
        axion_on_json: JSON.stringify(datosParseados.axionOn),
        tanques_json: JSON.stringify(datosParseados.detalleTanques)
      };
      
      const resultado = await CierreModel.insertarCierreCompleto(datosParaGuardar);

      res.status(201).json({ 
        mensaje: 'Cierre de caja procesado e insertado correctamente.', 
        cierreId: resultado.cierre_z_id,
        datosParseados
      });

    } catch (error) {
      console.error('Error en el proceso de carga de cierre:', error);
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
        return res.status(409).json({ mensaje: 'Error: Este Cierre Z ya ha sido cargado anteriormente.' });
      }
      res.status(500).json({ mensaje: 'Error interno del servidor al procesar el archivo.', detalle: error.message });
    }
  },

  async obtenerCierresRecientes(req, res) {
    try {
      const cierres = await CierreModel.listarRecientes();
      res.status(200).json(cierres);
    } catch (error) {
      console.error('Error en el controlador al obtener cierres:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener los cierres.', detalle: error.message });
    }
  },

  async obtenerDetalleCierre(req, res) {
    try {
      const id = req.params.id;
      const detalleCierre = await CierreModel.buscarDetallePorId(id);

      if (!detalleCierre) {
        return res.status(404).json({ mensaje: 'No se encontró un Cierre Z con el ID proporcionado.' });
      }

      res.status(200).json(detalleCierre);

    } catch (error) {
      console.error('Error en el controlador al obtener detalle de cierre:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener los detalles.', detalle: error.message });
    }
  },

  async eliminarCierre(req, res) {
    const { id } = req.params;

    try {
      const detalleCierre = await CierreModel.buscarDetallePorId(id);

      if (!detalleCierre) {
        return res.status(404).json({ mensaje: 'El Cierre Z que intenta eliminar no existe.' });
      }

      if (detalleCierre.cabecera && detalleCierre.cabecera.caja_procesada === 1) {
        return res.status(403).json({ mensaje: 'No se puede eliminar un Cierre Z cuya caja ya ha sido procesada.' });
      }

      await CierreModel.eliminarCierreCompletoPorId(id);

      res.status(200).json({ mensaje: `El Cierre Z ha sido eliminado exitosamente.` });

    } catch (error) {
      console.error(`Error en el controlador al eliminar el cierre con ID ${id}:`, error);
      if (error.message.includes('No se encontró un Cierre Z')) {
          return res.status(404).json({ mensaje: 'El Cierre Z que intenta eliminar no existe.' });
      }
      res.status(500).json({ mensaje: 'Error interno del servidor al eliminar el cierre.', detalle: error.message });
    }
  }
};

export default CierreController;

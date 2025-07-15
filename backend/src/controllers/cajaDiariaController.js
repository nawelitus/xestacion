// Contenido COMPLETO y ACTUALIZADO para: src/controllers/cajaDiariaController.js

import CajaDiariaModel from '../models/cajaDiariaModel.js';

const CajaDiariaController = {
  async obtenerCierresParaCaja(req, res) {
    try {
      const todosLosCierres = await CajaDiariaModel.listarTodosParaCaja();
      res.status(200).json(todosLosCierres);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
  },

  async obtenerDetalleProcesado(req, res) {
    try {
      const { cierreId } = req.params;
      const detalle = await CajaDiariaModel.obtenerDetalleProcesado(cierreId);

      if (!detalle) {
        return res.status(404).json({ mensaje: 'No se encontraron datos para el cierre especificado.' });
      }
      res.status(200).json(detalle);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener el detalle.' });
    }
  },

  async procesarCierreDiario(req, res) {
    const { cierreId } = req.params;
    const datos = req.body;

    if (!datos || !datos.billetera || !datos.creditos || !datos.retiros) {
        return res.status(400).json({ mensaje: 'Faltan datos en la petición.' });
    }
    
    try {
      await CajaDiariaModel.procesarCaja(cierreId, datos);
      res.status(200).json({ mensaje: `El cierre ha sido procesado exitosamente.` });
    } catch (error) {
      // ==================================================================
      // ▼▼▼ MEJORA EN EL LOG DE ERRORES ▼▼▼
      // ==================================================================
      console.error(`ERROR EN CONTROLADOR al procesar cierre ID ${cierreId}:`, error);
      res.status(500).json({ 
          mensaje: 'Error interno del servidor al procesar el cierre.',
          // Enviamos el mensaje de error detallado al frontend para poder verlo
          detalle: error.message 
      });
      // ==================================================================
    }
  },

  async deshacerProcesoCierre(req, res) {
    const { cierreId } = req.params;
    try {
      await CajaDiariaModel.deshacerProceso(cierreId);
      res.status(200).json({ mensaje: 'El proceso de caja ha sido deshecho exitosamente.' });
    } catch (error) {
      console.error(`ERROR EN CONTROLADOR al deshacer proceso para cierre ID ${cierreId}:`, error);
      res.status(500).json({ mensaje: 'Error interno del servidor al deshacer el proceso.', detalle: error.message });
    }
  }
};

export default CajaDiariaController;
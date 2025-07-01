// Contenido para: src/controllers/cajaDiariaController.js

import CajaDiariaModel from '../models/cajaDiariaModel.js';

const CajaDiariaController = {
  async obtenerCierresParaCaja(req, res) {
    // ... código existente sin cambios ...
    try {
      const todosLosCierres = await CajaDiariaModel.listarTodosParaCaja();
      res.status(200).json(todosLosCierres);
    } catch (error) {
      console.error('Error en controlador al listar cierres para caja:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
  },

  async obtenerDetalleProcesado(req, res) {
    // ... código existente sin cambios ...
    try {
      const { cierreId } = req.params;
      const detalle = await CajaDiariaModel.obtenerDetalleProcesado(cierreId);

      if (!detalle) {
        return res.status(404).json({ mensaje: 'No se encontraron datos para el cierre especificado.' });
      }
      res.status(200).json(detalle);
    } catch (error) {
      console.error('Error en controlador al obtener detalle procesado:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener el detalle.' });
    }
  },

  async procesarCierreDiario(req, res) {
    // ... código existente sin cambios ...
    const { cierreId } = req.params;
    const datos = req.body;

    if (!datos || !datos.billetera || !datos.creditos || !datos.retiros) {
        return res.status(400).json({ mensaje: 'Faltan datos en la petición.' });
    }
    
    try {
      await CajaDiariaModel.procesarCaja(cierreId, datos);
      res.status(200).json({ mensaje: `El cierre ha sido procesado exitosamente.` });
    } catch (error) {
      console.error(`Error al procesar cierre diario para el ID ${cierreId}:`, error);
      res.status(500).json({ mensaje: 'Error interno del servidor al procesar el cierre.' });
    }
  },

  // --- AÑADIR NUEVA FUNCIÓN ---
  async deshacerProcesoCierre(req, res) {
    const { cierreId } = req.params;
    try {
      await CajaDiariaModel.deshacerProceso(cierreId);
      res.status(200).json({ mensaje: 'El proceso de caja ha sido deshecho exitosamente.' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error interno del servidor al deshacer el proceso.' });
    }
  }
};

export default CajaDiariaController;
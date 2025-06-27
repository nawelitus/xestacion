import CajaDiariaModel from '../models/cajaDiariaModel.js';

const CajaDiariaController = {
  /**
   * Obtiene la lista de Cierres Z pendientes de procesar.
   */
  async obtenerCierresPendientes(req, res) {
    try {
      const cierresPendientes = await CajaDiariaModel.listarPendientes();
      res.status(200).json(cierresPendientes);
    } catch (error) {
      console.error('Error en el controlador al listar cierres pendientes:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
  },

  /**
   * Recibe los datos del modal y los manda al modelo para ser procesados.
   */
  async procesarCierreDiario(req, res) {
    const { cierreId } = req.params;
    const datos = req.body;

    // Validación básica de los datos recibidos
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
  }
};

export default CajaDiariaController;
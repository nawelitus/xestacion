import CajaDiariaModel from '../models/cajaDiariaModel.js';

const CajaDiariaController = {
  /**
   * @MODIFICADO
   * Obtiene la lista de TODOS los Cierres Z para la página de Caja Diaria.
   */
  async obtenerCierresParaCaja(req, res) {
    try {
      const todosLosCierres = await CajaDiariaModel.listarTodosParaCaja();
      res.status(200).json(todosLosCierres);
    } catch (error) {
      console.error('Error en controlador al listar cierres para caja:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
  },

  /**
   * @NUEVO
   * Obtiene el detalle completo de una caja diaria ya procesada.
   */
  async obtenerDetalleProcesado(req, res) {
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

  /**
   * Recibe los datos del modal y los manda al modelo para ser procesados.
   */
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
      console.error(`Error al procesar cierre diario para el ID ${cierreId}:`, error);
      res.status(500).json({ mensaje: 'Error interno del servidor al procesar el cierre.' });
    }
  }
};

export default CajaDiariaController;
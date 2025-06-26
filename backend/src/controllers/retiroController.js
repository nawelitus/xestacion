import RetiroModel from '../models/retiroModel.js';

const RetiroController = {
  /**
   * Obtiene y devuelve una lista de retiros, aplicando los filtros de fecha
   * que se pasen como query params en la URL.
   */
  async listarRetiros(req, res) {
    try {
      // Obtenemos los posibles filtros desde la URL (ej: /api/retiros?fechaDesde=2024-01-01)
      const filtros = {
        fechaDesde: req.query.fechaDesde,
        fechaHasta: req.query.fechaHasta
      };

      const retiros = await RetiroModel.listar(filtros);
      res.status(200).json(retiros);
    } catch (error) {
      console.error('Error en el controlador al listar retiros:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener los retiros.', detalle: error.message });
    }
  }
};

export default RetiroController;
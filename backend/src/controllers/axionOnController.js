// @NUEVO ARCHIVO: src/controllers/axionOnController.js

import AxionOnModel from '../models/axionOnModel.js';

const AxionOnController = {
  async getResumen(req, res) {
    try {
      const filtros = {
        fechaDesde: req.query.fechaDesde,
        fechaHasta: req.query.fechaHasta
      };
      const resumen = await AxionOnModel.obtenerResumen(filtros);
      res.status(200).json(resumen);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener el resumen de Axion ON.' });
    }
  },

  async getDetalle(req, res) {
    try {
      const { cierreId } = req.params;
      const detalle = await AxionOnModel.obtenerDetallePorCierreId(cierreId);
      res.status(200).json(detalle);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener el detalle de Axion ON.' });
    }
  }
};

export default AxionOnController;
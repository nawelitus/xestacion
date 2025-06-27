import DashboardModel from '../models/dashboardModel.js';

const DashboardController = {
  async obtenerResumen(req, res) {
    try {
      const datos = await DashboardModel.obtenerDatosDashboard();
      res.status(200).json(datos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error interno al obtener los datos del dashboard.' });
    }
  }
};

export default DashboardController;
import DashboardModel from '../models/dashboardModel.js';

const DashboardController = {
  async obtenerResumen(req, res) {
    try {
      const datos = await DashboardModel.obtenerDatosDashboard();
      res.status(200).json(datos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error interno al obtener los datos del dashboard.' });
    }
  
},
async ultimosPorTurno(_req, res) {
    try {
      const data = await DashboardModel.ultimosPorTurno();
      return res.status(200).json({ items: data });
    } catch (e) {
      console.error('Dashboard.ultimosPorTurno', e);
      return res.status(500).json({ mensaje: 'Error al obtener KPIs por turno' });
    }
  },
};
export default DashboardController;
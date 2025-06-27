import EmpleadoModel from '../models/empleadoModel.js';

const EmpleadoController = {
  async obtenerTodos(req, res) {
    try {
      const empleados = await EmpleadoModel.listarTodos();
      res.status(200).json(empleados);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener la lista de empleados.' });
    }
  },

  /**
   * @NUEVO
   * Obtiene el resumen de retiros por empleado.
   */
  async obtenerResumenRetiros(req, res) {
    try {
      const resumen = await EmpleadoModel.listarConResumenRetiros();
      res.status(200).json(resumen);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener el resumen de retiros.' });
    }
  },

  /**
   * @NUEVO
   * Obtiene el detalle de retiros para un empleado específico.
   */
  async obtenerDetalleRetiros(req, res) {
    try {
      const { nombre } = req.params;
      const detalle = await EmpleadoModel.obtenerDetalleRetirosPorNombre(nombre);
      res.status(200).json(detalle);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener el detalle de retiros.' });
    }
  }
};

export default EmpleadoController;
import EmpleadoModel from '../models/empleadoModel.js';

const EmpleadoController = {
  async obtenerTodos(req, res) {
    try {
      const empleados = await EmpleadoModel.listarTodos();
      res.status(200).json(empleados);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener la lista de empleados.' });
    }
  }
};

export default EmpleadoController;

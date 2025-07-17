// Contenido COMPLETO y ACTUALIZADO para: src/controllers/empleadoController.js

import EmpleadoModel from '../models/empleadoModel.js';

const EmpleadoController = {
  async obtenerTodos(req, res) {
    // ... (sin cambios)
    try {
      const empleados = await EmpleadoModel.listarTodos();
      res.status(200).json(empleados);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener la lista de empleados.' });
    }
  },

  // ================================================================
  // ▼▼▼ NUEVA FUNCIÓN EN EL CONTROLADOR ▼▼▼
  // ================================================================
  async crearEmpleado(req, res) {
    const { nombre_completo } = req.body;
    if (!nombre_completo || nombre_completo.trim() === '') {
        return res.status(400).json({ mensaje: 'El nombre del empleado no puede estar vacío.' });
    }
    try {
        const nuevoEmpleado = await EmpleadoModel.crearUno(nombre_completo.trim());
        res.status(201).json({ mensaje: 'Empleado creado exitosamente', empleado: nuevoEmpleado });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'Ya existe un empleado con ese nombre.' });
        }
        res.status(500).json({ mensaje: 'Error interno del servidor al crear el empleado.' });
    }
  },

  async obtenerResumenRetiros(req, res) {
    // ... (sin cambios)
    try {
      const resumen = await EmpleadoModel.listarConResumenRetiros();
      res.status(200).json(resumen);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener el resumen de retiros.' });
    }
  },

  async obtenerDetalleRetiros(req, res) {
    // ... (sin cambios)
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
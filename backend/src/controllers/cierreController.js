// Contenido COMPLETO y ACTUALIZADO para: src/controllers/cierreController.js

import { parsearCierreZ } from '../utils/cierreParser.js';
import CierreModel from '../models/cierreModel.js';
import EmpleadoModel from '../models/empleadoModel.js';

const CierreController = {
  async subirYCargarCierre(req, res) {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se ha subido ningún archivo.' });
    }

    try {
      const contenidoArchivo = req.file.buffer.toString('utf-8');
      const datosParseados = parsearCierreZ(contenidoArchivo);
      await EmpleadoModel.guardarNuevos(datosParseados.empleados);

      datosParseados.cabecera.usuario_carga_id = req.usuario.id;

      const resultado = await CierreModel.insertarCierreCompleto(datosParseados);

      res.status(201).json({ 
        mensaje: resultado.mensaje,
        numero_z: datosParseados.cabecera.numero_z
      });

    } catch (error) {
      console.error('Error en el proceso de carga de cierre:', error);
      if (error.message.includes('Duplicate entry')) {
        return res.status(409).json({ mensaje: 'Error: Este Cierre Z ya ha sido cargado anteriormente.' });
      }
      res.status(500).json({ mensaje: 'Error interno del servidor al procesar el archivo.', detalle: error.message });
    }
  },

  async obtenerCierresRecientes(req, res) {
    try {
      const cierres = await CierreModel.listarRecientes();
      res.status(200).json(cierres);
    } catch (error) {
      console.error('Error en el controlador al obtener cierres:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener los cierres.', detalle: error.message });
    }
  },

  async obtenerDetalleCierre(req, res) {
    try {
      const id = req.params.id;
      const detalleCierre = await CierreModel.buscarDetallePorId(id);

      if (!detalleCierre) {
        return res.status(404).json({ mensaje: 'No se encontró un Cierre Z con el ID proporcionado.' });
      }

      res.status(200).json(detalleCierre);

    } catch (error) {
      console.error('Error en el controlador al obtener detalle de cierre:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener los detalles.', detalle: error.message });
    }
  },

  // ================================================================
  // NUEVA FUNCIONALIDAD: Controlador para eliminar un Cierre Z
  // ================================================================
  /**
   * Gestiona la petición para eliminar un Cierre Z.
   */
  async eliminarCierre(req, res) {
    const { id } = req.params;

    try {
      // 1. Regla de negocio: Verificar que el cierre no esté procesado.
      const detalleCierre = await CierreModel.buscarDetallePorId(id);

      if (!detalleCierre) {
        return res.status(404).json({ mensaje: 'El Cierre Z que intenta eliminar no existe.' });
      }

      if (detalleCierre.cabecera.caja_procesada === 1) {
        return res.status(403).json({ mensaje: 'No se puede eliminar un Cierre Z cuya caja ya ha sido procesada.' });
      }

      // 2. Si la validación es correcta, llamar al modelo para eliminar.
      await CierreModel.eliminarCierreCompletoPorId(id);

      res.status(200).json({ mensaje: `El Cierre Z ha sido eliminado exitosamente.` });

    } catch (error) {
      console.error(`Error en el controlador al eliminar el cierre con ID ${id}:`, error);
      // El error del modelo puede ser por ID no encontrado, lo cual manejamos aquí.
      if (error.message.includes('No se encontró un Cierre Z')) {
          return res.status(404).json({ mensaje: 'El Cierre Z que intenta eliminar no existe.' });
      }
      res.status(500).json({ mensaje: 'Error interno del servidor al eliminar el cierre.', detalle: error.message });
    }
  }
};

export default CierreController;

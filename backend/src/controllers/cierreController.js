// Contenido COMPLETO y ACTUALIZADO para: src/controllers/cierreController.js

import { parsearCierreZ } from '../utils/cierreParser.js';
import CierreModel from '../models/cierreModel.js';

const CierreController = {
  /**
   * Recibe un archivo de Cierre Z, lo parsea y lo guarda en la base de datos.
   */
  async subirYCargarCierre(req, res) {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se ha subido ningún archivo.' });
    }

    try {
      const contenidoArchivo = req.file.buffer.toString('utf-8');
      const datosParseados = parsearCierreZ(contenidoArchivo);
      
      datosParseados.cabecera.usuario_carga_id = req.usuario.id;

      // Llamar al modelo para que se encargue de la lógica de la base de datos
      const resultado = await CierreModel.insertarCierreCompleto(datosParseados);

      res.status(201).json({ 
        mensaje: resultado.mensaje,
        numero_z: datosParseados.cabecera.numero_z
      });

    } catch (error) {
      console.error('Error en el proceso de carga de cierre:', error);
      // Devuelve un error específico si es un duplicado
      if (error.message.includes('Duplicate entry')) {
        return res.status(409).json({ mensaje: 'Error: Este Cierre Z ya ha sido cargado anteriormente.' });
      }
      res.status(500).json({ mensaje: 'Error interno del servidor al procesar el archivo.', detalle: error.message });
    }
  },

  /**
   * @NUEVO
   * Obtiene y devuelve una lista de los cierres Z más recientes.
   */
  async obtenerCierresRecientes(req, res) {
    try {
      const cierres = await CierreModel.listarRecientes();
      res.status(200).json(cierres);
    } catch (error) {
      console.error('Error en el controlador al obtener cierres:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener los cierres.', detalle: error.message });
    }
  },
 /**
   * @NUEVO
   * Obtiene y devuelve los detalles completos de un Cierre Z específico.
   */
  async obtenerDetalleCierre(req, res) {
    try {
      const id = req.params.id; // Obtenemos el ID de los parámetros de la ruta
      const detalleCierre = await CierreModel.buscarDetallePorId(id);

      if (!detalleCierre) {
        // Si el modelo devuelve null, es porque no encontró el cierre
        return res.status(404).json({ mensaje: 'No se encontró un Cierre Z con el ID proporcionado.' });
      }

      res.status(200).json(detalleCierre);

    } catch (error) {
      console.error('Error en el controlador al obtener detalle de cierre:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener los detalles.', detalle: error.message });
    }
  }
};

export default CierreController;
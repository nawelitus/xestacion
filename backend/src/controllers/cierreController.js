// Contenido CORRECTO y FINAL para: src/controllers/cierreController.js

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
  }
};

export default CierreController;
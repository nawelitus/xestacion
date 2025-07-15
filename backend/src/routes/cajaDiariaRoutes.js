// Contenido COMPLETO y CORREGIDO para: src/routes/cajaDiariaRoutes.js

import { Router } from 'express';
import CajaDiariaController from '../controllers/cajaDiariaController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

const router = Router();

// CORRECCIÓN: Se elimina el router.use(verificarToken) global para este archivo.
// En su lugar, se aplicará explícitamente a cada ruta.

// @route   GET api/caja/
// @desc    Obtiene todos los cierres para la vista de Caja Diaria
// @access  Privado (todos los roles)
router.get(
  '/', 
  [ // Se añade el array de middlewares
    verificarToken,
    autorizarRol(['administrador', 'editor', 'visualizador'])
  ], 
  CajaDiariaController.obtenerCierresParaCaja
);

// @route   GET api/caja/detalle/:cierreId
// @desc    Obtiene el detalle de una caja ya procesada
// @access  Privado (todos los roles)
router.get(
  '/detalle/:cierreId',
  [ // Se añade el array de middlewares
    verificarToken,
    autorizarRol(['administrador', 'editor', 'visualizador'])
  ],
  CajaDiariaController.obtenerDetalleProcesado
);

// @route   POST api/caja/procesar/:cierreId
// @desc    Procesa una caja diaria pendiente
// @access  Privado (administrador, editor)
router.post(
  '/procesar/:cierreId', 
  [ // Se añade el array de middlewares
    verificarToken,
    autorizarRol(['administrador', 'editor'])
  ], 
  CajaDiariaController.procesarCierreDiario
);

// @route   DELETE api/caja/procesar/:cierreId
// @desc    Deshace el procesamiento de una caja diaria.
// @access  Privado (solo administrador)
router.delete(
  '/procesar/:cierreId',
  [ // Se añade el array de middlewares
    verificarToken,
    autorizarRol(['administrador']) // <-- Esto asegura que verificarToken se ejecute primero
  ], 
  CajaDiariaController.deshacerProcesoCierre
);

export default router;
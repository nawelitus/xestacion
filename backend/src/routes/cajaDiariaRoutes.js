import { Router } from 'express';
import CajaDiariaController from '../controllers/cajaDiariaController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas de caja diaria requieren autenticación
router.use(verificarToken);

// @route   GET api/caja/pendientes
// @desc    Obtiene la lista de Cierres Z que no han sido procesados.
// @access  Privado (todos los roles)
router.get(
  '/pendientes', 
  autorizarRol(['administrador', 'editor', 'visualizador']), 
  CajaDiariaController.obtenerCierresPendientes
);

// @route   POST api/caja/procesar/:cierreId
// @desc    Guarda los datos de la caja diaria para un cierre específico y lo marca como procesado.
// @access  Privado (solo roles con permiso de escritura)
router.post(
  '/procesar/:cierreId', 
  autorizarRol(['administrador', 'editor']), 
  CajaDiariaController.procesarCierreDiario
);

export default router;
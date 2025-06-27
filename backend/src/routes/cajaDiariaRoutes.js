import { Router } from 'express';
import CajaDiariaController from '../controllers/cajaDiariaController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verificarToken);

// @route   GET api/caja/
// @desc    Obtiene TODOS los Cierres Z (pendientes y procesados).
router.get(
  '/', 
  autorizarRol(['administrador', 'editor', 'visualizador']), 
  CajaDiariaController.obtenerCierresParaCaja
);

// @route   GET api/caja/detalle/:cierreId
// @desc    Obtiene el detalle de una caja diaria ya procesada.
router.get(
  '/detalle/:cierreId',
  autorizarRol(['administrador', 'editor', 'visualizador']),
  CajaDiariaController.obtenerDetalleProcesado
);

// @route   POST api/caja/procesar/:cierreId
// @desc    Guarda los datos de la caja diaria y marca el cierre como procesado.
router.post(
  '/procesar/:cierreId', 
  autorizarRol(['administrador', 'editor']), 
  CajaDiariaController.procesarCierreDiario
);

export default router;
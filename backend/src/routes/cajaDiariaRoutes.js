// Contenido para: src/routes/cajaDiariaRoutes.js

import { Router } from 'express';
import CajaDiariaController from '../controllers/cajaDiariaController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verificarToken);

// ... rutas GET y POST existentes sin cambios ...
router.get(
  '/', 
  autorizarRol(['administrador', 'editor', 'visualizador']), 
  CajaDiariaController.obtenerCierresParaCaja
);

router.get(
  '/detalle/:cierreId',
  autorizarRol(['administrador', 'editor', 'visualizador']),
  CajaDiariaController.obtenerDetalleProcesado
);

router.post(
  '/procesar/:cierreId', 
  autorizarRol(['administrador', 'editor']), 
  CajaDiariaController.procesarCierreDiario
);

// --- AÑADIR NUEVA RUTA ---
// @route   DELETE api/caja/procesar/:cierreId
// @desc    Deshace el procesamiento de una caja diaria.
// @access  Privado (solo administrador)
router.delete(
  '/procesar/:cierreId',
  autorizarRol(['administrador']), 
  CajaDiariaController.deshacerProcesoCierre
);

export default router;
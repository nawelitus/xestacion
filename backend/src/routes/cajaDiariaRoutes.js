import { Router } from 'express';
import CajaDiariaController from '../controllers/cajaDiariaController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas de caja diaria requieren autenticación
router.use(verificarToken);

// @route   GET api/caja
// @desc    Obtiene un resumen consolidado de todos los cierres para una fecha.
// @access  Privado (administrador, editor, visualizador)
// @query   ?fecha=YYYY-MM-DD (Opcional, si no se envía toma la fecha actual)
router.get(
  '/', 
  autorizarRol(['administrador', 'editor', 'visualizador']), 
  CajaDiariaController.obtenerCajaDelDia
);

export default router;
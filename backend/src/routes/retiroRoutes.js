import { Router } from 'express';
import RetiroController from '../controllers/retiroController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas de este archivo requieren autenticación
router.use(verificarToken);

// @route   GET api/retiros
// @desc    Obtiene una lista de todos los retiros, con opción a filtrar por fecha
// @access  Privado (administrador, editor)
router.get(
  '/', 
  autorizarRol(['administrador', 'editor']), 
  RetiroController.listarRetiros
);
router.patch(
  '/cancelar/:id',
  autorizarRol(['administrador']),
  RetiroController.cancelarAdelanto
);
export default router;
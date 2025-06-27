import { Router } from 'express';
import EmpleadoController from '../controllers/empleadoController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = Router();

// @route   GET api/empleados
// @desc    Obtiene una lista de todos los empleados
// @access  Privado (cualquier usuario autenticado)
router.get('/', verificarToken, EmpleadoController.obtenerTodos);

export default router;
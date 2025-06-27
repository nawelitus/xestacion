import { Router } from 'express';
import EmpleadoController from '../controllers/empleadoController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verificarToken);

// Endpoint para obtener la lista de empleados (para los selectores)
router.get('/', EmpleadoController.obtenerTodos);

// @NUEVO: Endpoint para la página principal de retiros
router.get('/resumen-retiros', EmpleadoController.obtenerResumenRetiros);

// @NUEVO: Endpoint para el detalle de retiros de un empleado
router.get('/detalle-retiros/:nombre', EmpleadoController.obtenerDetalleRetiros);

export default router;
// Contenido COMPLETO y ACTUALIZADO para: src/routes/empleadoRoutes.js

import { Router } from 'express';
import EmpleadoController from '../controllers/empleadoController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verificarToken);

// Endpoint para obtener la lista de empleados (ahora solo activos)
router.get('/', EmpleadoController.obtenerTodos);

// ================================================================
// ▼▼▼ NUEVA RUTA PARA CREAR EMPLEADOS ▼▼▼
// ================================================================
router.post(
    '/',
    autorizarRol(['administrador', 'editor']), // Solo ciertos roles pueden crear
    EmpleadoController.crearEmpleado
);

// ... (resto de rutas sin cambios)
router.get('/resumen-retiros', EmpleadoController.obtenerResumenRetiros);
router.get('/detalle-retiros/:nombre', EmpleadoController.obtenerDetalleRetiros);

export default router;
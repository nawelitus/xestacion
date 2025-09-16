import { Router } from 'express';
import DashboardController from '../controllers/dashboardController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = Router();

// @route   GET api/dashboard
// @desc    Obtiene todos los datos para el dashboard principal
// @access  Privado
router.get('/', verificarToken, DashboardController.obtenerResumen);
router.get('/ultimos-por-turno', verificarToken, DashboardController.ultimosPorTurno);

export default router;
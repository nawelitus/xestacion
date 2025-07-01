// @NUEVO ARCHIVO: src/routes/axionOnRoutes.js

import { Router } from 'express';
import AxionOnController from '../controllers/axionOnController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verificarToken); // Proteger todas las rutas de esta sección

const rolesPermitidos = ['administrador', 'editor', 'visualizador'];

// @route   GET api/axion-on/
// @desc    Obtiene el resumen de Axion ON, con filtros opcionales
router.get('/', autorizarRol(rolesPermitidos), AxionOnController.getResumen);

// @route   GET api/axion-on/detalle/:cierreId
// @desc    Obtiene el detalle de Axion ON para un cierre específico
router.get('/detalle/:cierreId', autorizarRol(rolesPermitidos), AxionOnController.getDetalle);

export default router;
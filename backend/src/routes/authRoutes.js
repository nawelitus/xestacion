// Contenido final para src/routes/authRoutes.js

import { Router } from 'express';
import AuthController from '../controllers/authController.js';

const router = Router();

// @route   POST api/auth/registrar
// @desc    Registra un nuevo usuario
// @access  Public
router.post('/registrar', AuthController.registrar);

// @route   POST api/auth/login
// @desc    Inicia sesión y devuelve un token
// @access  Public
router.post('/login', AuthController.login);

export default router;
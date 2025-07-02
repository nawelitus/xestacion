// Contenido para: src/routes/authRoutes.js

import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { verificarToken } from '../middleware/authMiddleware.js'; // Importamos el middleware

const router = Router();

// @route   POST api/auth/registrar
// @desc    Registra un nuevo usuario
// @access  Public
router.post('/registrar', AuthController.registrar);

// @route   POST api/auth/login
// @desc    Inicia sesión y establece una cookie con el token
// @access  Public
router.post('/login', AuthController.login);

// --- AÑADIR NUEVAS RUTAS ---

// @route   POST api/auth/logout
// @desc    Cierra la sesión del usuario limpiando la cookie
// @access  Public (cualquiera puede intentar cerrar sesión)
router.post('/logout', AuthController.logout);

// @route   GET api/auth/verify
// @desc    Verifica el token de la cookie y devuelve los datos del usuario
// @access  Privado (requiere un token válido)
router.get('/verify', verificarToken, AuthController.verificarUsuario);


export default router;
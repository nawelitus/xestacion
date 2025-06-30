import { Router } from 'express';
import UsuarioController from '../controllers/usuarioController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

// ================================================================
// ARCHIVO: src/routes/usuarioRoutes.js (NUEVO)
//
// DESCRIPCIÓN:
// Define los endpoints de la API para la gestión de usuarios.
// Todas las rutas están protegidas y solo son accesibles para
// usuarios con el rol de 'administrador'.
// ================================================================

const router = Router();

// Middleware para todas las rutas de este archivo:
// 1. Verifica que el usuario esté autenticado (token válido).
// 2. Verifica que el usuario tenga el rol de 'administrador'.
router.use(verificarToken, autorizarRol(['administrador']));

// @route   GET api/usuarios/
// @desc    Obtener lista de todos los usuarios
// @access  Privado (Administrador)
router.get('/', UsuarioController.listarUsuarios);

// @route   POST api/usuarios/
// @desc    Crear un nuevo usuario
// @access  Privado (Administrador)
router.post('/', UsuarioController.crearUsuario);

// @route   PUT api/usuarios/:id
// @desc    Actualizar datos de un usuario
// @access  Privado (Administrador)
router.put('/:id', UsuarioController.actualizarUsuario);

// @route   PUT api/usuarios/password/:id
// @desc    Actualizar la contraseña de un usuario
// @access  Privado (Administrador)
router.put('/password/:id', UsuarioController.actualizarPassword);

// @route   PUT api/usuarios/estado/:id
// @desc    Habilitar o deshabilitar un usuario
// @access  Privado (Administrador)
router.put('/estado/:id', UsuarioController.cambiarEstadoUsuario);

export default router;

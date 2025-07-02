// Contenido para: src/controllers/authController.js

import UsuarioModel from '../models/usuarioModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const AuthController = {
  // La función de registro no necesita cambios
  async registrar(req, res) {
    const { nombre_completo, email, dni, password, rol } = req.body;
    // ...código existente sin cambios...
    try {
      const usuarioExistente = await UsuarioModel.buscarPorEmail(email) || await UsuarioModel.buscarPorDni(dni);
      if (usuarioExistente) {
        return res.status(409).json({ mensaje: 'El correo electrónico o el DNI ya están registrados.' });
      }
      await UsuarioModel.crear(nombre_completo, email, dni, password, rol);
      res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error interno del servidor al registrar el usuario.' });
    }
  },

  async login(req, res) {
    const { dni, password } = req.body;
    try {
      const usuario = await UsuarioModel.buscarPorDni(dni);
      if (!usuario) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
      }

      const esPasswordCorrecto = await bcrypt.compare(password, usuario.password_hash);
      if (!esPasswordCorrecto) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
      }

      // 1. CREAR EL PAYLOAD Y EL TOKEN (LA DURACIÓN YA LA HABÍAMOS CAMBIADO)
      const payload = { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre_completo };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '20m' });

      // 2. ESTABLECER EL TOKEN EN UNA COOKIE SEGURA
      res.cookie('token', token, {
        httpOnly: true, // La cookie no es accesible desde JavaScript en el frontend
        secure: process.env.NODE_ENV === 'production', // Solo enviar por HTTPS en producción
        sameSite: 'strict', // Ayuda a mitigar ataques CSRF
        maxAge: 20 * 60 * 1000 // 20 minutos de duración
      });

      // 3. DEVOLVER SOLO LOS DATOS DEL USUARIO, SIN EL TOKEN
      res.status(200).json(payload);

    } catch (error) {
      console.error('Error en el login:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al iniciar sesión.' });
    }
  },
  
  // --- AÑADIR NUEVA FUNCIÓN LOGOUT ---
  logout(req, res) {
    // Limpia la cookie del navegador y envía una respuesta exitosa.
    res.clearCookie('token').status(200).json({ mensaje: 'Sesión cerrada exitosamente.' });
  },

  // --- AÑADIR NUEVA FUNCIÓN VERIFY ---
  verificarUsuario(req, res) {
    // Si el middleware 'verificarToken' pasó, significa que el token es válido.
    // El payload del usuario ya está en 'req.usuario'. Simplemente lo devolvemos.
    res.status(200).json(req.usuario);
  }
};

export default AuthController;
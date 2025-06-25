import UsuarioModel from '../models/usuarioModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const AuthController = {
  /**
   * Maneja el registro de un nuevo usuario.
   */
  async registrar(req, res) {
    const { nombre_completo, email, password, rol } = req.body;

    // Validación básica
    if (!nombre_completo || !email || !password || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    try {
      // Verificar si el usuario ya existe
      const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(409).json({ mensaje: 'El correo electrónico ya está registrado.' });
      }

      // Crear el nuevo usuario
      await UsuarioModel.crear(nombre_completo, email, password, rol);

      res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
    } catch (error) {
      console.error('Error en el registro:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al registrar el usuario.' });
    }
  },

  /**
   * Maneja el inicio de sesión de un usuario.
   */
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'El email y la contraseña son obligatorios.' });
    }

    try {
      // Buscar al usuario por email
      const usuario = await UsuarioModel.buscarPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas.' }); // Email no encontrado
      }

      // Comparar la contraseña enviada con la hasheada en la BD
      const esPasswordCorrecto = await bcrypt.compare(password, usuario.password_hash);
      if (!esPasswordCorrecto) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas.' }); // Contraseña incorrecta
      }

      // Si las credenciales son correctas, crear el payload para el token
      const payload = {
        usuario: {
          id: usuario.id,
          rol: usuario.rol,
          nombre: usuario.nombre_completo
        }
      };

      // Firmar el token JWT
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '8h' }, // El token expirará en 8 horas
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );

    } catch (error) {
      console.error('Error en el login:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al iniciar sesión.' });
    }
  }
};

export default AuthController;

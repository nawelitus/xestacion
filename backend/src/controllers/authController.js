import UsuarioModel from '../models/usuarioModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const AuthController = {
  async registrar(req, res) {
    // CAMBIO: Se añade el DNI al registro
    const { nombre_completo, email, dni, password, rol } = req.body;

    if (!nombre_completo || !email || !dni || !password || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    try {
      // Verificar si el email o DNI ya existen
      const usuarioExistente = await UsuarioModel.buscarPorEmail(email) || await UsuarioModel.buscarPorDni(dni);
      if (usuarioExistente) {
        return res.status(409).json({ mensaje: 'El correo electrónico o el DNI ya están registrados.' });
      }

      await UsuarioModel.crear(nombre_completo, email, dni, password, rol);
      res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
    } catch (error) {
      console.error('Error en el registro:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al registrar el usuario.' });
    }
  },

  async login(req, res) {
    // CAMBIO: Ahora se usa `dni` para el login en lugar de `email`
    const { dni, password } = req.body;

    if (!dni || !password) {
      return res.status(400).json({ mensaje: 'El DNI y la contraseña son obligatorios.' });
    }

    try {
      // CAMBIO: Se busca al usuario por DNI
      const usuario = await UsuarioModel.buscarPorDni(dni);
      if (!usuario) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
      }

      const esPasswordCorrecto = await bcrypt.compare(password, usuario.password_hash);
      if (!esPasswordCorrecto) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
      }

      const payload = {
        usuario: {
          id: usuario.id,
          rol: usuario.rol,
          nombre: usuario.nombre_completo,
          dni: usuario.dni // Añadimos el DNI al token por si es útil
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '8h' },
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
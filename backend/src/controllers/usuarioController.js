import UsuarioModel from '../models/usuarioModel.js';
import bcrypt from 'bcryptjs';

// ================================================================
// ARCHIVO: src/controllers/usuarioController.js (NUEVO)
//
// DESCRIPCIÓN:
// Contiene la lógica de negocio para gestionar las peticiones HTTP
// relacionadas con los usuarios. Valida los datos de entrada y utiliza
// el UsuarioModel para interactuar con la base de datos.
// ================================================================

const UsuarioController = {
  /**
   * Obtiene y devuelve una lista de todos los usuarios.
   */
  async listarUsuarios(req, res) {
    try {
      const usuarios = await UsuarioModel.listarTodos();
      res.status(200).json(usuarios);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
  },

  /**
   * Crea un nuevo usuario.
   */
  async crearUsuario(req, res) {
    const { nombre_completo, email, dni, password, rol } = req.body;

    if (!nombre_completo || !email || !dni || !password || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    try {
      const usuarioExistente = await UsuarioModel.buscarPorDni(dni) || await UsuarioModel.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(409).json({ mensaje: 'El DNI o el correo electrónico ya están en uso.' });
      }

      await UsuarioModel.crear(nombre_completo, email, dni, password, rol);
      res.status(201).json({ mensaje: 'Usuario creado exitosamente.' });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
  },

  /**
   * Actualiza los datos de un usuario existente.
   */
  async actualizarUsuario(req, res) {
    const { id } = req.params;
    const { nombre_completo, email, dni, rol } = req.body;

    if (!nombre_completo || !email || !dni || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    try {
      const usuario = await UsuarioModel.buscarPorId(id);
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
      }

      // Validar si el nuevo DNI o email ya está en uso por OTRO usuario
      const otroUsuarioPorDni = await UsuarioModel.buscarPorDni(dni);
      if (otroUsuarioPorDni && otroUsuarioPorDni.id !== parseInt(id)) {
        return res.status(409).json({ mensaje: 'El DNI ya está en uso por otro usuario.' });
      }
      const otroUsuarioPorEmail = await UsuarioModel.buscarPorEmail(email);
       if (otroUsuarioPorEmail && otroUsuarioPorEmail.id !== parseInt(id)) {
        return res.status(409).json({ mensaje: 'El email ya está en uso por otro usuario.' });
      }

      await UsuarioModel.actualizar(id, { nombre_completo, email, dni, rol });
      res.status(200).json({ mensaje: 'Usuario actualizado exitosamente.' });
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
  },

  /**
   * Actualiza la contraseña de un usuario.
   */
  async actualizarPassword(req, res) {
    const { id } = req.params;
    const { nuevaPassword } = req.body;

    if (!nuevaPassword || nuevaPassword.length < 6) {
      return res.status(400).json({ mensaje: 'La nueva contraseña es obligatoria y debe tener al menos 6 caracteres.' });
    }
    
    try {
        const usuario = await UsuarioModel.buscarPorId(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }
        
        await UsuarioModel.actualizarPassword(id, nuevaPassword);
        res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente.' });

    } catch (error) {
        console.error(`Error al cambiar la contraseña del usuario ${id}:`, error);
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
  },

  /**
   * Cambia el estado de un usuario (activo/inactivo).
   */
  async cambiarEstadoUsuario(req, res) {
    const { id } = req.params;
    const { estado } = req.body; // Se espera `estado: 1` para activar, `estado: 0` para desactivar

    if (typeof estado !== 'number' || (estado !== 0 && estado !== 1)) {
        return res.status(400).json({ mensaje: 'El estado proporcionado no es válido (debe ser 0 o 1).' });
    }

    try {
        const usuario = await UsuarioModel.buscarPorId(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        await UsuarioModel.cambiarEstado(id, estado);
        const mensaje = estado === 1 ? 'Usuario habilitado exitosamente.' : 'Usuario deshabilitado exitosamente.';
        res.status(200).json({ mensaje });

    } catch (error) {
        console.error(`Error al cambiar estado del usuario ${id}:`, error);
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
  }
};

export default UsuarioController;

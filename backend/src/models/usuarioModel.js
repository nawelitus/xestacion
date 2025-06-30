import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// ================================================================
// ARCHIVO: src/models/usuarioModel.js (NUEVO)
//
// DESCRIPCIÓN:
// Contiene todas las funciones para interactuar con la tabla `usuarios`
// en la base de datos. Se encarga de las operaciones CRUD (Crear, Leer,
// Actualizar, Borrar) para la gestión de usuarios.
// ================================================================

const UsuarioModel = {
  /**
   * Busca un usuario por su DNI.
   * @param {string} dni - DNI del usuario a buscar.
   * @returns {Promise<object|null>} El objeto del usuario o null si no se encuentra.
   */
  async buscarPorDni(dni) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE dni = ?', [dni]);
    return rows[0] || null;
  },

  /**
   * Busca un usuario por su email.
   * @param {string} email - Email del usuario a buscar.
   * @returns {Promise<object|null>} El objeto del usuario o null si no se encuentra.
   */
  async buscarPorEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0] || null;
  },
  
  /**
   * Busca un usuario por su ID.
   * @param {number} id - ID del usuario a buscar.
   * @returns {Promise<object|null>} El objeto del usuario o null si no se encuentra.
   */
  async buscarPorId(id) {
    const [rows] = await pool.query('SELECT id, dni, nombre_completo, email, rol, activo FROM usuarios WHERE id = ?', [id]);
    return rows[0] || null;
  },

  /**
   * Lista todos los usuarios del sistema sin incluir el hash de la contraseña.
   * @returns {Promise<Array<object>>} Un array con todos los usuarios.
   */
  async listarTodos() {
    const [rows] = await pool.query('SELECT id, dni, nombre_completo, email, rol, activo, fecha_creacion FROM usuarios ORDER BY nombre_completo ASC');
    return rows;
  },

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param {string} nombre_completo - Nombre del usuario.
   * @param {string} email - Email del usuario.
   * @param {string} dni - DNI del usuario.
   * @param {string} password - Contraseña sin hashear.
   * @param {string} rol - Rol del usuario ('administrador', 'editor', 'visualizador').
   * @returns {Promise<object>} El resultado de la inserción.
   */
  async crear(nombre_completo, email, dni, password, rol) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre_completo, email, dni, password_hash, rol, activo) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre_completo, email, dni, password_hash, rol, 1] // Nace activo por defecto
    );
    return resultado;
  },

  /**
   * Actualiza los datos de un usuario existente (excepto contraseña).
   * @param {number} id - ID del usuario a actualizar.
   * @param {object} datos - Objeto con los nuevos datos (nombre_completo, email, dni, rol).
   * @returns {Promise<object>} El resultado de la actualización.
   */
  async actualizar(id, { nombre_completo, email, dni, rol }) {
    const [resultado] = await pool.query(
      'UPDATE usuarios SET nombre_completo = ?, email = ?, dni = ?, rol = ? WHERE id = ?',
      [nombre_completo, email, dni, rol, id]
    );
    return resultado;
  },

  /**
   * Actualiza únicamente la contraseña de un usuario.
   * @param {number} id - ID del usuario.
   * @param {string} nuevaPassword - La nueva contraseña sin hashear.
   * @returns {Promise<object>} El resultado de la actualización.
   */
  async actualizarPassword(id, nuevaPassword) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(nuevaPassword, salt);
    const [resultado] = await pool.query(
      'UPDATE usuarios SET password_hash = ? WHERE id = ?',
      [password_hash, id]
    );
    return resultado;
  },

  /**
   * Cambia el estado de un usuario (activo/inactivo).
   * @param {number} id - ID del usuario.
   * @param {number} estado - El nuevo estado (1 para activo, 0 para inactivo).
   * @returns {Promise<object>} El resultado de la actualización.
   */
  async cambiarEstado(id, estado) {
    const [resultado] = await pool.query(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [estado, id]
    );
    return resultado;
  }
};

export default UsuarioModel;

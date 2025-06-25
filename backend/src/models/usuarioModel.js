import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const UsuarioModel = {
  /**
   * Crea un nuevo usuario en la base de datos.
   * La contraseña se hashea antes de guardarla.
   * @param {string} nombreCompleto - El nombre del usuario.
   * @param {string} email - El email del usuario, debe ser único.
   * @param {string} password - La contraseña en texto plano.
   * @param {string} rol - Rol del usuario ('administrador', 'editor', 'visualizador').
   * @returns {Promise<object>} El resultado de la inserción.
   */
  async crear(nombreCompleto, email, password, rol) {
    // Hashear la contraseña para no guardarla en texto plano
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre_completo, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombreCompleto, email.toLowerCase(), password_hash, rol]
    );
    return resultado;
  },

  /**
   * Busca un usuario por su dirección de email.
   * @param {string} email - El email a buscar.
   * @returns {Promise<object|null>} El objeto del usuario si se encuentra, o null si no.
   */
  async buscarPorEmail(email) {
    const [filas] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
      [email.toLowerCase()]
    );
    return filas[0] || null;
  }
};

export default UsuarioModel;
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const UsuarioModel = {
  /**
   * Crea un nuevo usuario en la base de datos, ahora incluyendo el DNI.
   */
  async crear(nombreCompleto, email, dni, password, rol) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre_completo, email, dni, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
      [nombreCompleto, email.toLowerCase(), dni, password_hash, rol]
    );
    return resultado;
  },

  /**
   * Busca un usuario por su DNI.
   * @param {string} dni - El DNI a buscar.
   * @returns {Promise<object|null>} El objeto del usuario si se encuentra, o null si no.
   */
  async buscarPorDni(dni) { // CAMBIO: Nueva función para buscar por DNI
    const [filas] = await pool.query(
      'SELECT * FROM usuarios WHERE dni = ? AND activo = TRUE',
      [dni]
    );
    return filas[0] || null;
  },

  /**
   * Busca un usuario por su email (útil para verificar duplicados al registrar).
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
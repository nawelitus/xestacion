import pool from '../config/db.js';

const ClienteModel = {
  /**
   * Busca un cliente por su nombre. Si no lo encuentra, lo crea.
   * @param {string} nombreCliente - El nombre del cliente a buscar/crear.
   * @param {object} connection - Una conexión activa de la base de datos para transacciones.
   * @returns {Promise<number>} El ID del cliente encontrado o recién creado.
   */
  async buscarOCrear(nombreCliente, connection) {
    // 1. Intentar buscar el cliente
    let [filas] = await connection.query('SELECT id FROM clientes WHERE nombre = ?', [nombreCliente]);
    
    if (filas.length > 0) {
      // Cliente encontrado, devolver su ID
      return filas[0].id;
    } else {
      // 2. Cliente no encontrado, proceder a crearlo
      const [resultado] = await connection.query('INSERT INTO clientes (nombre) VALUES (?)', [nombreCliente]);
      // Devolver el ID del nuevo cliente
      return resultado.insertId;
    }
  }
};

export default ClienteModel;

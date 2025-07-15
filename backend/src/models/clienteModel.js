// Contenido COMPLETO Y CORREGIDO para: src/models/clienteModel.js

import pool from '../config/db.js'; // Usamos 'pool' como en tu archivo original.

const ClienteModel = {

  // ===================================================================================
  // NUEVA FUNCIÓN REQUERIDA POR EL CONTROLADOR DE CIERRES
  // Esta es la función que soluciona el error.
  // ===================================================================================
  /**
   * Busca un cliente por su nombre. Si no lo encuentra, lo crea y lo devuelve.
   * Esta función es autocontenida y no necesita una conexión externa.
   * @param {string} nombre - El nombre completo del cliente a buscar o crear.
   * @returns {Promise<object>} El objeto del cliente encontrado o recién creado.
   */
  async findOrCreateByName(nombre) {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del cliente en el remito no puede estar vacío.');
    }
    const nombreNormalizado = nombre.trim();
    try {
      // Usamos el pool de conexiones directamente.
      const [filas] = await pool.query('SELECT * FROM clientes WHERE nombre = ?', [nombreNormalizado]);
      if (filas.length > 0) {
        return filas[0]; // Cliente encontrado.
      } else {
        // Cliente no encontrado, lo creamos.
        const [resultado] = await pool.query('INSERT INTO clientes (nombre) VALUES (?)', [nombreNormalizado]);
        // Devolvemos el objeto del nuevo cliente.
        return {
          id: resultado.insertId,
          nombre: nombreNormalizado,
          cuit: null,
          direccion: null,
          email: null,
          telefono: null
        };
      }
    } catch (error) {
      console.error(`Error en findOrCreateByName para el cliente "${nombreNormalizado}":`, error);
      throw error;
    }
  },

  // ===================================================================================
  // FUNCIONES EXISTENTES (se mantienen intactas)
  // ===================================================================================

  /**
   * Busca un cliente por su nombre. Si no lo encuentra, lo crea.
   * Usado internamente durante la carga de Cierres Z.
   * @param {string} nombreCliente - El nombre del cliente a buscar/crear.
   * @param {object} connection - Una conexión activa de la base de datos para transacciones.
   * @returns {Promise<number>} El ID del cliente encontrado o recién creado.
   */
  async buscarOCrear(nombreCliente, connection) {
    const [filas] = await connection.query('SELECT id FROM clientes WHERE nombre = ?', [nombreCliente]);
    
    if (filas.length > 0) {
      return filas[0].id;
    } else {
      const [resultado] = await connection.query('INSERT INTO clientes (nombre) VALUES (?)', [nombreCliente]);
      return resultado.insertId;
    }
  },

  /**
   * @NUEVO
   * Lista todos los clientes junto con el saldo de su cuenta corriente.
   * Utiliza la vista `vista_saldos_cta_cte` para eficiencia.
   * @returns {Promise<Array>} Un arreglo de objetos, cada uno representando un cliente y su saldo.
   */
  async listarConSaldos() {
    const [filas] = await pool.query('SELECT * FROM vista_saldos_cta_cte ORDER BY cliente_nombre ASC');
    return filas;
  },

  /**
   * @NUEVO
   * Busca un cliente específico por su ID y su saldo actual.
   * @param {number} id - El ID del cliente a buscar.
   * @returns {Promise<object|null>} El objeto del cliente con su saldo o null si no se encuentra.
   */
  async buscarPorIdConSaldo(id) {
    const [filas] = await pool.query(
        `SELECT c.*, v.saldo_actual 
         FROM clientes c
         LEFT JOIN vista_saldos_cta_cte v ON c.id = v.cliente_id
         WHERE c.id = ?`,
        [id]
    );
    return filas[0] || null;
  },

  /**
   * @NUEVO
   * Obtiene todos los movimientos (débitos y créditos) de la cuenta corriente de un cliente.
   * @param {number} clienteId - El ID del cliente.
   * @returns {Promise<Array>} Un arreglo con todos los movimientos del cliente.
   */
  async obtenerMovimientosPorClienteId(clienteId) {
    const [filas] = await pool.query(
      'SELECT * FROM movimientos_cta_cte WHERE cliente_id = ? ORDER BY fecha DESC, id DESC',
      [clienteId]
    );
    return filas;
  },

  /**
   * @NUEVO
   * Registra un nuevo movimiento en la cuenta corriente de un cliente (típicamente un pago).
   * @param {number} clienteId - El ID del cliente que realiza el pago.
   * @param {string} tipo - El tipo de movimiento ('CREDITO' para pagos, 'DEBITO' para cargos).
   * @param {string} concepto - La descripción del movimiento.
   * @param {number} monto - El monto del movimiento.
   * @param {number} usuarioId - El ID del usuario que registra la operación.
   * @returns {Promise<object>} El resultado de la inserción.
   */
  async registrarMovimiento(clienteId, tipo, concepto, monto, usuarioId) {
    const [resultado] = await pool.query(
      `INSERT INTO movimientos_cta_cte (cliente_id, fecha, tipo, concepto, monto, usuario_registro_id) 
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [clienteId, tipo, concepto, monto, usuarioId]
    );
    return resultado;
  }
};

export default ClienteModel;

import ClienteModel from '../models/clienteModel.js';

const ClienteController = {
  /**
   * Obtiene y devuelve una lista de todos los clientes con sus saldos.
   */
  async listarClientes(req, res) {
    try {
      const clientes = await ClienteModel.listarConSaldos();
      res.status(200).json(clientes);
    } catch (error) {
      console.error('Error en el controlador al listar clientes:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener los clientes.', detalle: error.message });
    }
  },

  /**
   * Obtiene los detalles de un cliente específico, incluyendo su historial de movimientos.
   */
  async obtenerDetalleCliente(req, res) {
    try {
      const clienteId = req.params.id;
      
      // Buscamos el cliente y sus movimientos en paralelo para mayor eficiencia
      const [cliente, movimientos] = await Promise.all([
        ClienteModel.buscarPorIdConSaldo(clienteId),
        ClienteModel.obtenerMovimientosPorClienteId(clienteId)
      ]);

      if (!cliente) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
      }

      res.status(200).json({
        detalles: cliente,
        movimientos: movimientos
      });

    } catch (error) {
      console.error('Error en el controlador al obtener detalle de cliente:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener los detalles del cliente.', detalle: error.message });
    }
  },

  /**
   * Registra un nuevo pago (movimiento de tipo 'CREDITO') para un cliente.
   */
  async registrarPago(req, res) {
    try {
      const clienteId = req.params.id;
      const { monto, concepto } = req.body;
      const usuarioId = req.usuario.id; // Obtenido del token JWT verificado

      if (!monto || monto <= 0 || !concepto) {
        return res.status(400).json({ mensaje: 'El monto y el concepto son obligatorios y el monto debe ser positivo.' });
      }
      
      // Verificamos que el cliente exista antes de registrar el pago
      const cliente = await ClienteModel.buscarPorIdConSaldo(clienteId);
      if (!cliente) {
        return res.status(404).json({ mensaje: 'No se puede registrar el pago: Cliente no encontrado.' });
      }

      await ClienteModel.registrarMovimiento(clienteId, 'CREDITO', concepto, monto, usuarioId);

      res.status(201).json({ mensaje: 'Pago registrado exitosamente.' });

    } catch (error) {
      console.error('Error en el controlador al registrar pago:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al registrar el pago.', detalle: error.message });
    }
  }
};

export default ClienteController;
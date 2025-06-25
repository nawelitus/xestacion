import { Router } from 'express';
import ClienteController from '../controllers/clienteController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas de clientes requieren que el usuario esté autenticado.
// Por eso aplicamos el middleware `verificarToken` a todas las rutas de este archivo.
router.use(verificarToken);

// @route   GET api/clientes
// @desc    Obtiene una lista de todos los clientes con sus saldos
// @access  Privado (administrador, editor, visualizador)
router.get(
  '/', 
  autorizarRol(['administrador', 'editor', 'visualizador']), 
  ClienteController.listarClientes
);

// @route   GET api/clientes/:id/detalle
// @desc    Obtiene los detalles y movimientos de un cliente específico
// @access  Privado (administrador, editor, visualizador)
router.get(
  '/:id/detalle', 
  autorizarRol(['administrador', 'editor', 'visualizador']), 
  ClienteController.obtenerDetalleCliente
);

// @route   POST api/clientes/:id/pagos
// @desc    Registra un pago para un cliente
// @access  Privado (solo administrador o editor)
router.post(
  '/:id/pagos', 
  autorizarRol(['administrador', 'editor']), // Solo roles con permiso de escritura
  ClienteController.registrarPago
);


export default router;

// Contenido COMPLETO y ACTUALIZADO para: src/routes/cierreRoutes.js

import { Router } from 'express';
import multer from 'multer';
import CierreController from '../controllers/cierreController.js';
import { verificarToken, autorizarRol } from '../middleware/authMiddleware.js';

const router = Router();

// Configuración de Multer para guardar el archivo en memoria
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/plain") {
            cb(null, true);
        } else {
            cb(new Error("Formato de archivo no válido. Solo se permiten archivos .txt"), false);
        }
    }
});

// @route   POST api/cierres/subir
// @desc    Sube y procesa un archivo de cierre Z
// @access  Privado (administrador, editor)
router.post(
  '/subir',
  [
    verificarToken,
    autorizarRol(['administrador', 'editor'])
  ],
  upload.single('archivoCierre'),
 CierreController.subirYProcesarCierre

);

// @route   GET api/cierres/
// @desc    Obtiene los cierres más recientes
// @access  Privado (todos los roles autenticados)
router.get(
    '/',
    [
        verificarToken,
        autorizarRol(['administrador', 'editor', 'visualizador'])
    ],
    CierreController.obtenerCierresRecientes
);

// @route   GET api/cierres/:id
// @desc    Obtiene los detalles completos de un Cierre Z específico
// @access  Privado (todos los roles autenticados)
router.get(
    '/:id',
    [
        verificarToken,
        autorizarRol(['administrador', 'editor', 'visualizador'])
    ],
    CierreController.obtenerDetalleCierre
);

// ================================================================
// NUEVA FUNCIONALIDAD: Ruta para eliminar un Cierre Z
// ================================================================
// @route   DELETE api/cierres/:id
// @desc    Elimina un Cierre Z y todos sus datos asociados
// @access  Privado (solo administrador)
router.delete(
    '/:id',
    [
        verificarToken,
        autorizarRol(['administrador']) // Solo los administradores pueden eliminar
    ],
    CierreController.eliminarCierre
);


export default router;

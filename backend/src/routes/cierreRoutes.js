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
        // Aceptar solo archivos de texto (.txt)
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
    autorizarRol(['administrador', 'editor']) // Solo estos roles pueden subir archivos
  ],
  upload.single('archivoCierre'), // 'archivoCierre' es el nombre del campo en el form-data
  CierreController.subirYCargarCierre
);


// @route   GET api/cierres/
// @desc    Obtiene los cierres más recientes
// @access  Privado (todos los roles autenticados)
// @NUEVA RUTA
router.get(
    '/',
    [
        verificarToken,
        autorizarRol(['administrador', 'editor', 'visualizador']) // Todos pueden ver
    ],
    CierreController.obtenerCierresRecientes
);
router.get(
    '/:id', // La ruta ahora acepta un parámetro 'id'
    [
        verificarToken,
        autorizarRol(['administrador', 'editor', 'visualizador'])
    ],
    CierreController.obtenerDetalleCierre
);

export default router;
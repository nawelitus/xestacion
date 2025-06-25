// Contenido CORRECTO para: src/routes/cierreRoutes.js

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
// @access  Privado (solo para roles específicos)
router.post(
  '/subir',
  [
    verificarToken,
    autorizarRol(['administrador', 'editor']) // Solo estos roles pueden subir archivos
  ],
  upload.single('archivoCierre'), // 'archivoCierre' es el nombre del campo en el form-data
  CierreController.subirYCargarCierre
);

export default router;
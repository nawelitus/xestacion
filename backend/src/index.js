// ================================================================
// ARCHIVO: src/index.js (VERSIÓN ACTUALIZADA)
// Añadir las nuevas rutas de clientes.
// ================================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { probarConexion } from './config/db.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import cierreRoutes from './routes/cierreRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js'; // <-- AÑADIR ESTA LÍNEA
import retiroRoutes from './routes/retiroRoutes.js'; // <-- AÑADIR ESTA LÍNEA

import cajaDiariaRoutes from './routes/cajaDiariaRoutes.js';
// --- Configuración Inicial ---
const envFile = process.env.NODE_ENV === 'production' ? '.env.produccion' : '.env.desarrollo';
dotenv.config({ path: `./${envFile}` });

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middlewares ---
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Probar Conexión a BD ---
probarConexion();

// --- Rutas ---
app.get('/api', (req, res) => {
  res.json({
    mensaje: '¡Bienvenido a la API de G-Station Control!',
    version: '1.1.0 - Customer Accounts Ready'
  });
});

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/cierres', cierreRoutes); 
app.use('/api/clientes', clienteRoutes); // <-- AÑADIR ESTA LÍNEA
app.use('/api/retiros', retiroRoutes);
app.use('/api/caja', cajaDiariaRoutes); 

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
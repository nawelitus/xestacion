// Contenido para: src/index.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // 1. IMPORTAR COOKIE-PARSER
import { probarConexion } from './config/db.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import cierreRoutes from './routes/cierreRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js'; 
import retiroRoutes from './routes/retiroRoutes.js'; 
import empleadoRoutes from './routes/empleadoRoutes.js'; 
import dashboardRoutes from './routes/dashboardRoutes.js'; 
import usuarioRoutes from './routes/usuarioRoutes.js'; 
import axionOnRoutes from './routes/axionOnRoutes.js'; 
import cajaDiariaRoutes from './routes/cajaDiariaRoutes.js';

// --- Configuración Inicial ---
const envFile = process.env.NODE_ENV === 'production' ? '.env.produccion' : '.env.desarrollo';
dotenv.config({ path: `./${envFile}` });
console.log('🌐 DB_HOST:', process.env.DB_PORT);

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middlewares ---
// 2. CONFIGURAR CORS PARA ACEPTAR CREDENCIALES
app.use(cors({
  origin: 'http://localhost:5173', // O la URL de tu frontend en producción
  credentials: true
}));
app.use(express.json());
app.use(cookieParser()); // 3. USAR COOKIE-PARSER
app.use(express.urlencoded({ extended: true }));

// --- Probar Conexión a BD ---
probarConexion();

// --- Rutas ---
app.get('/api', (req, res) => {
  res.json({
    mensaje: '¡Bienvenido a la API de G-Station Control!',
    version: '1.3.0 - Cookie Auth Ready'
  });
});

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cierres', cierreRoutes); 
app.use('/api/clientes', clienteRoutes);
app.use('/api/retiros', retiroRoutes);
app.use('/api/caja', cajaDiariaRoutes); 
app.use('/api/empleados', empleadoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/axion-on', axionOnRoutes);

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
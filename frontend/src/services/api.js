// Contenido para: src/services/api.js

import axios from 'axios';

const baseURL = import.meta.env.PROD
  ? '/api'  
  : 'http://localhost:4000/api'; 

// --- CAMBIOS REALIZADOS ---
const api = axios.create({
  baseURL,
  withCredentials: true // 1. PERMITE EL ENVÍO DE COOKIES EN CADA PETICIÓN
});

// 2. EL INTERCEPTOR QUE AÑADÍA EL TOKEN MANUALMENTE SE ELIMINA.
// La autenticación ahora es manejada automáticamente por el navegador
// a través de la cookie httpOnly.

export default api;
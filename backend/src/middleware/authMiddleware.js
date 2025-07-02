// Contenido para: src/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar el Token JWT desde una cookie.
 */
export const verificarToken = (req, res, next) => {
  // 1. Obtener el token directamente de las cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    // 2. Verificar el token
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Adjuntar el payload del token al objeto request
    // El payload ya no está anidado dentro de una propiedad 'usuario'
    req.usuario = decodificado;

    next();
  } catch (error) {
    console.error("Error de token:", error.message);
    res.status(401).json({ mensaje: 'Token no válido o expirado.' });
  }
};


/**
 * Middleware de autorización basado en roles.
 * (Este middleware no necesita cambios, pero lo incluimos para que el archivo quede completo)
 */
export const autorizarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.rol) {
        return res.status(403).json({ mensaje: 'Acceso prohibido. No se pudo verificar el rol del usuario.' });
    }

    const { rol } = req.usuario;

    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ mensaje: 'Acceso prohibido. No tienes los permisos necesarios.' });
    }

    next();
  };
};
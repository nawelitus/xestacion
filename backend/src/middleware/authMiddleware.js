import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar el Token JWT.
 * Si el token es válido, añade la información del usuario (payload) al objeto `req`.
 */
export const verificarToken = (req, res, next) => {
  // Obtener el token del header de autorización. Formato: "Bearer <token>"
  const authHeader = req.header('Authorization');

  // Comprobar si no hay header de autorización
  if (!authHeader) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token.' });
  }
  
  // El token real es la segunda parte del string, después de "Bearer "
  const token = authHeader.split(' ')[1];
  
  // Comprobar si no hay token después de 'Bearer '
  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Formato de token inválido.' });
  }

  try {
    // Verificar el token usando el secreto
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar el payload del token (que contiene id, rol, nombre) al objeto request
    req.usuario = decodificado.usuario;

    // Continuar con la siguiente función en la cadena de middlewares/controlador
    next();
  } catch (error) {
    console.error("Error de token:", error.message);
    res.status(401).json({ mensaje: 'Token no válido.' });
  }
};


/**
 * Middleware de autorización basado en roles.
 * Esta es una función de orden superior, es decir, una función que devuelve otra función.
 * @param {Array<string>} rolesPermitidos - Un array con los roles que tienen permiso.
 * @returns Un middleware que comprueba si el rol del usuario está en la lista permitida.
 */
export const autorizarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    // Este middleware debe usarse DESPUÉS de verificarToken,
    // por lo que ya deberíamos tener req.usuario disponible.
    if (!req.usuario) {
        return res.status(500).json({ mensaje: 'Error de autenticación interna.' });
    }

    const { rol } = req.usuario;

    // Comprobar si el rol del usuario está incluido en la lista de roles permitidos
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ mensaje: 'Acceso prohibido. No tienes los permisos necesarios.' });
    }

    // Si el rol es permitido, continuar
    next();
  };
};

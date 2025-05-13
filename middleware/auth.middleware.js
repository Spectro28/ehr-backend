const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

const authenticateToken = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Token no proporcionado'
      });
    }

    try {
      // Verificar el token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'tu_clave_secreta'
      );

      // Verificar si el usuario aún existe y está activo
      const user = await User.findByPk(decoded.id);
      
      if (!user || !user.active) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Usuario desactivado o no existe'
        });
      }

      req.user = decoded;
      next();

    } catch (error) {
      return res.status(403).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido o ha expirado'
      });
    }

  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al procesar la autenticación'
    });
  }
};

// Middleware para verificar roles
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos para acceder a este recurso'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  checkRole
};
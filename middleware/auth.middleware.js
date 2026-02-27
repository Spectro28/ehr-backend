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
      
      if (!user) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Usuario no encontrado'
        });
      }

      // Verificar si el usuario está activo
      if (!user.active) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Usuario desactivado. Contacte al administrador.'
        });
      }

      // Agregar información adicional del usuario al request
      req.user = {
        ...decoded,
        active: user.active,
        empresa: user.empresa
      };
      
      console.log('Usuario autenticado:', {
        id: req.user.id,
        username: req.user.username,
        roles: req.user.roles
      });
      
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

    // Soportar usuarios con múltiples roles (array) o rol único
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const hasRole = userRoles.some(role => roles.includes(role));
    
    console.log('Verificación de roles:', {
      userRoles,
      requiredRoles: roles,
      hasRole
    });
    
    if (!hasRole) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Middleware específico para administradores
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Acceso denegado',
      message: 'Usuario no autenticado'
    });
  }

  const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
  const isAdminUser = userRoles.includes('administrador');
  
  if (!isAdminUser) {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Se requieren permisos de administrador'
    });
  }

  next();
};

// Middleware específico para dentistas
const isDentista = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Acceso denegado',
      message: 'Usuario no autenticado'
    });
  }

  const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
  const isDentistaUser = userRoles.includes('dentista');
  
  if (!isDentistaUser) {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Se requieren permisos de dentista'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  checkRole,
  isAdmin,
  isDentista
};
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const db = require('../models');
const crypto = require('crypto');
const emailService = require('../services/email.service');
const User = db.User;

// Login
exports.login = async (req, res) => {
  try {
    const { identificacion, password, selectedRole } = req.body;

    let user;

    if (identificacion.length < 10 || isNaN(identificacion)) {
      user = await User.findOne({
        where: {
          username: identificacion,
          tipo_identificacion: 'no_identificado'
        },
        include: [{
          model: db.Role,
          as: 'roles',
          through: { attributes: [] }
        }]
      });
    } else {
      user = await User.findOne({
        where: { identificacion },
        include: [{
          model: db.Role,
          as: 'roles',
          through: { attributes: [] }
        }]
      });
    }

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      return res.status(403).json({
        message: 'Usuario desactivado. Contacte al administrador.'
      });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Validar que el usuario tenga el rol seleccionado
    const userRoles = user.roles.map(role => role.nombre);
    if (!selectedRole || !userRoles.includes(selectedRole)) {
      return res.status(403).json({ message: 'No tiene el rol seleccionado' });
    }

    // Generar token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        roles: userRoles,
        active: user.active,
        empresa: user.empresa
      },
      process.env.JWT_SECRET || 'tu_clave_secreta',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        roles: userRoles,
        active: user.active,
        empresa: user.empresa
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear admin inicial (mantén tu código existente)
// Crear admin inicial
exports.createInitialAdmin = async () => {
    try {
        // Primero, asegurarnos de que existe el rol de administrador
        const [adminRole] = await db.Role.findOrCreate({
            where: { nombre: 'administrador' }
        });

        // Luego buscar si existe el usuario admin
        const admin = await User.findOne({ 
            where: { username: 'admin' },
            include: [{
                model: db.Role,
                as: 'roles',
                through: { attributes: [] }
            }]
        });

        if (!admin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const adminUser = await User.create({
                username: 'admin',
                password: hashedPassword,
                active: true,
                tipo_identificacion: 'no_identificado',
                identificacion: 'admin'
            });

            // Asignar el rol al usuario admin
            await adminUser.addRole(adminRole);
            console.log('✅ Usuario admin y rol creados exitosamente');
        } else if (admin.roles.length === 0) {
            // Si el admin existe pero no tiene roles, asignarle el rol
            await admin.addRole(adminRole);
            console.log('✅ Rol de administrador asignado al usuario admin existente');
        }
    } catch (error) {
        console.error('❌ Error al crear usuario admin:', error);
        throw error;
    }
};

// Obtener roles disponibles (mantén tu código existente)
exports.getRoles = async (req, res) => {
  try {
    // Incluimos el rol de dentista en la lista
    const roles = ['administrador', 'doctor', 'dentista', 'secretaria', 'enfermera'];
    res.json({
      success: true,
      roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error.message
    });
  }
};

// Solicitar recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ 
        message: 'No existe una cuenta con ese correo electrónico' 
      });
    }

    // Generar token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = tokenExpiration;
    await user.save();

    // Enviar correo
    await emailService.sendPasswordResetEmail(email, resetToken);

    res.json({ 
      message: 'Se ha enviado un correo con las instrucciones' 
    });

  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud' 
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Buscar usuario con token válido y no expirado
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date() // Token no expirado
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        message: 'El token de restablecimiento es inválido o ha expirado'
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar usuario
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      message: 'Error al restablecer la contraseña'
    });
  }
};

// Cambiar rol activo del usuario
exports.switchRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    const userId = req.user.id; // Asumiendo que el middleware de auth añade req.user

    // Buscar usuario con roles
    const user = await User.findByPk(userId, {
      include: [{
        model: db.Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario tiene el rol solicitado
    const userRoles = user.roles.map(role => role.nombre);
    if (!userRoles.includes(newRole)) {
      return res.status(403).json({ message: 'No tienes permisos para este rol' });
    }

    // Validar que el rol sea uno de los permitidos para cambio (no administrador)
    const allowedRoles = ['secretaria', 'enfermera', 'doctor', 'dentista'];
    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Rol no válido para cambio' });
    }

    // El cambio se maneja en el frontend actualizando localStorage
    res.json({
      success: true,
      message: 'Rol cambiado exitosamente',
      newRole: newRole
    });

  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
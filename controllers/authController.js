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
    const { username, password } = req.body; // Ya no necesitamos selectedRole
    
    // Buscar usuario solo por username
    const user = await User.findOne({ 
      where: { username }
    });

    // Si no existe el usuario
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

    // Generar token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        active: user.active,
        empresa: user.empresa
      },
      process.env.JWT_SECRET || 'tu_clave_secreta',
      { expiresIn: '1h' }
    );

    // Enviar respuesta
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
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
exports.createInitialAdmin = async () => {
  try {
      const admin = await User.findOne({ 
          where: { username: 'admin' },
          attributes: ['id', 'username', 'role', 'active', 'email', 'especialidad'] // Solo los campos que existen
      });

      if (!admin) {
          const hashedPassword = await bcrypt.hash('admin123', 10);
          await User.create({
              username: 'admin',
              password: hashedPassword,
              role: 'administrador',
              active: true,
              email: 'admin@example.com'
          });
          console.log('✅ Usuario admin creado exitosamente');
      }
  } catch (error) {
      console.error('❌ Error al crear usuario admin:', error);
      throw error;
  }
};

// Obtener roles disponibles (mantén tu código existente)
exports.getRoles = async (req, res) => {
  try {
    const roles = ['administrador', 'doctor', 'secretaria', 'enfermera'];
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
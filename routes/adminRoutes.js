const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models');
const { authenticateToken } = require('../middleware/auth.middleware');

// Obtener todos los usuarios
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { role } = req.query; // Obtener el rol de los query params
    const whereClause = role ? 
      { role } : 
      { role: ['doctor', 'secretaria', 'enfermera'] };

    const users = await db.User.findAll({
      attributes: ['id', 'username', 'role', 'active', 'especialidad','empresa'],
      where: whereClause
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message 
    });
  }
});

// Crear nuevo usuario
router.post('/create', async (req, res) => {
  try {
      const { username, password, role, especialidad, cedula, email, empresa } = req.body;
      
      // Validaciones
      if (!username || !password || !role || !cedula) {
          return res.status(400).json({
              success: false,
              message: 'Todos los campos obligatorios deben estar completos'
          });
      }

      // Validar formato de cédula
      if (!/^[0-9]{10}$/.test(cedula)) {
          return res.status(400).json({
              success: false,
              message: 'La cédula debe contener 10 dígitos numéricos'
          });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Cambiar User.create por db.User.create
      const newUser = await db.User.create({
          username,
          password: hashedPassword,
          role,
          especialidad: role === 'doctor' ? especialidad : null,
          cedula,
          email,
          empresa,
          active: true
      });

      res.status(201).json({
          success: true,
          message: 'Usuario creado exitosamente',
          data: {
              id: newUser.id,
              username: newUser.username,
              role: newUser.role,
              especialidad: newUser.especialidad,
              cedula: newUser.cedula,
              email: newUser.email,
              empresa: newUser.empresa,
              active: newUser.active
          }
      });

  } catch (error) {
      console.error('Error al crear usuario:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(400).json({
              success: false,
              message: 'Ya existe un usuario con esa cédula o nombre de usuario'
          });
      }

      res.status(500).json({
          success: false,
          message: 'Error al crear el usuario',
          error: error.message
      });
  }
});
// Actualizar estado de usuario
router.patch('/:id/toggle-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.active = !user.active;
    await user.save();

    res.json({
      message: `Usuario ${user.active ? 'activado' : 'desactivado'} exitosamente`,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        empresa: user.empresa,
        active: user.active
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    res.status(500).json({ message: 'Error al actualizar estado del usuario' });
  }
});

module.exports = router;
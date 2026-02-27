const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models');
const { authenticateToken } = require('../middleware/auth.middleware');

// Obtener todos los usuarios
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { role } = req.query; // Obtener el rol de los query params

    const users = await db.User.findAll({
      attributes: ['id', 'username', 'identificacion', 'email', 'active', 'especialidad', 'empresa'],
      include: [{
        model: db.Role,
        as: 'roles',
        attributes: ['nombre'],
        through: { attributes: [] },
        ...(role ? { where: { nombre: role } } : {})
      }]
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
router.post('/users/create', async (req, res) => {
  try {
    const { 
      username, 
      password, 
      roles, // Ahora esperamos un array de roles
      especialidad, 
      tipo_identificacion,
      identificacion,
      email, 
      empresa 
    } = req.body;
    
    // Validaciones básicas
    if (!username || !password || !roles || !roles.length || !tipo_identificacion || !identificacion) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear el usuario
    const user = await db.User.create({
      username,
      password: hashedPassword,
      active: true,
      especialidad,
      tipo_identificacion,
      identificacion,
      email,
      empresa
    });

    // Asignar múltiples roles
    for (const roleName of roles) {
      const [role] = await db.Role.findOrCreate({
        where: { nombre: roleName }
      });
      await user.addRole(role);
    }

    // Obtener el usuario con sus roles
    const userWithRoles = await db.User.findByPk(user.id, {
      include: [{
        model: db.Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: user.id,
        username: user.username,
        roles: userWithRoles.roles.map(role => role.nombre),
        active: user.active
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
});

// Agregar ruta para editar roles de usuario
router.put('/users/:id/roles', authenticateToken, async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { roles, especialidad } = req.body;

    if (!Array.isArray(roles)) {
      return res.status(400).json({
        success: false,
        message: 'Los roles deben ser un array de strings'
      });
    }

    // Validar que no se asignen roles de doctor y dentista simultáneamente
    if (roles.includes('doctor') && roles.includes('dentista')) {
      return res.status(400).json({
        success: false,
        message: 'No se puede asignar el rol de doctor y dentista al mismo tiempo'
      });
    }

    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar especialidad si corresponde
    if (roles.includes('doctor')) {
      // Si es doctor, actualizar la especialidad
      await user.update({ especialidad: especialidad || null }, { transaction: t });
    } else {
      // Si ya no es doctor, limpiar especialidad
      await user.update({ especialidad: null }, { transaction: t });
    }


    // Obtener los roles existentes como array (QueryTypes.SELECT devuelve un array)
    const roleRecords = await db.sequelize.query(
      'SELECT roleid FROM public.role WHERE nombre IN (:roles)',
      {
        replacements: { roles },
        type: db.sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    // roleRecords es un array de objetos { roleid: ... }
    if (!roleRecords || !Array.isArray(roleRecords) || roleRecords.length !== roles.length) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Algunos roles especificados no existen',
        found: roleRecords.map(r => r.roleid),
        expected: roles
      });
    }

    // Eliminar roles existentes usando SQL nativo
    await db.sequelize.query(
      'DELETE FROM public.usuariorole WHERE usuario_id = :userId',
      {
        replacements: { userId: id },
        type: db.sequelize.QueryTypes.DELETE,
        transaction: t
      }
    );

    // Insertar nuevos roles usando SQL nativo
    const roleValues = roleRecords.map(role => `(${id}, ${role.roleid})`).join(',');
    if (roleValues) {
      await db.sequelize.query(
        `INSERT INTO public.usuariorole (usuario_id, role_id) VALUES ${roleValues}`,
        {
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );
    }

    await t.commit();

    // Obtener usuario actualizado con sus roles
    const updatedUser = await db.User.findByPk(id, {
      include: [{
        model: db.Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    res.json({
      success: true,
      message: 'Roles actualizados exitosamente',
      data: updatedUser
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar roles',
      error: error.message
    });
  }
});
// Actualizar estado de usuario
// Eliminar usuario
router.delete('/users/:id', authenticateToken, async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    const user = await db.User.findByPk(id, {
      include: [{
        model: db.Role,
        as: 'roles',
        through: { attributes: [] }
      }],
      transaction: t
    });

    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el usuario tiene consultorios asignados
    const consultoriosCount = await db.Consultorio.count({
      where: { doctorId: id },
      transaction: t
    });

    // Verificar si el usuario tiene citas pendientes
    const citasPendientesCount = await db.Cita.count({
      where: { 
        doctorId: id,
        estado: 'pendiente'
      },
      transaction: t
    });

    if (consultoriosCount > 0 || citasPendientesCount > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el usuario porque tiene registros asociados',
        hasConsultorios: consultoriosCount > 0,
        hasCitasPendientes: citasPendientesCount > 0,
        consultoriosCount: consultoriosCount,
        citasPendientesCount: citasPendientesCount
      });
    }

    // Eliminar roles del usuario
    await user.setRoles([], { transaction: t });
    
    // Eliminar el usuario
    await user.destroy({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {
    await t.rollback();
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
});

router.patch('/users/:id/toggle-status', authenticateToken, async (req, res) => {
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
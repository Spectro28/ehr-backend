const express = require('express');
const router = express.Router();
const db = require('../models');

// Ruta para verificar doctores
router.get('/check-doctors', async (req, res) => {
    try {
        // Obtener el rol de doctor
        const doctorRole = await db.Role.findOne({
            where: { nombre: 'doctor' }
        });

        if (!doctorRole) {
            return res.json({
                success: false,
                message: 'No se encontró el rol de doctor',
                roleCount: 0
            });
        }

        // Obtener usuarios con rol de doctor
        const doctors = await db.User.findAll({
            include: [{
                model: db.Role,
                as: 'roles',
                where: { roleid: doctorRole.roleid },
                through: { attributes: [] }
            }],
            attributes: ['id', 'username', 'especialidad', 'active']
        });

        // Obtener todos los roles para debug
        const allRoles = await db.Role.findAll();

        // Obtener todas las asignaciones de roles
        const roleAssignments = await db.UserRole.findAll({
            where: { role_id: doctorRole.roleid }
        });

        res.json({
            success: true,
            data: {
                doctorRoleId: doctorRole.roleid,
                doctorCount: doctors.length,
                doctors: doctors,
                allRoles: allRoles,
                roleAssignments: roleAssignments
            }
        });
    } catch (error) {
        console.error('Error en debug route:', error);
        res.status(500).json({
            success: false,
            message: 'Error en debug route',
            error: error.message,
            stack: error.stack
        });
    }
});

// Ruta para verificar todos los roles y usuarios
router.get('/check-roles', async (req, res) => {
    try {
        // Obtener todos los roles
        const roles = await db.Role.findAll({
            attributes: ['roleid', 'nombre']
        });

        // Obtener todos los usuarios con sus roles
        const usuarios = await db.User.findAll({
            attributes: ['id', 'username', 'especialidad', 'active'],
            include: [{
                model: db.Role,
                as: 'roles',
                through: { attributes: [] }
            }]
        });

        // Formatear usuarios con sus roles
        const usuariosConRoles = usuarios.map(user => ({
            id: user.id,
            username: user.username,
            especialidad: user.especialidad,
            active: user.active,
            roles: user.roles.map(r => r.nombre)
        }));

        res.json({
            success: true,
            data: {
                roles: roles,
                usuarios: usuariosConRoles
            }
        });
    } catch (error) {
        console.error('Error en debug route:', error);
        res.status(500).json({
            success: false,
            message: 'Error en debug route',
            error: error.message
        });
    }
});

// Exportar el router
module.exports = router;

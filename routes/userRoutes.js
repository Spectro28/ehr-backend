const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas para obtener doctores y especialidades
router.get('/doctors', authenticateToken, userController.getDoctoresByEspecialidad);
router.get('/especialidades', authenticateToken, userController.getEspecialidades);

// Rutas protegidas (solo admin)
router.post('/create', authenticateToken, isAdmin, userController.createUser);
router.get('/all', authenticateToken, isAdmin, userController.getAllUsers);
router.get('/role/:role', authenticateToken, isAdmin, userController.getUsersByRole);
router.put('/:id/basic-info', authenticateToken, isAdmin, userController.updateUserBasicInfo);
router.patch('/:id/toggle-status', authenticateToken, isAdmin, userController.toggleUserStatus);
router.delete('/:id', authenticateToken, isAdmin, userController.softDeleteUser);

module.exports = router;
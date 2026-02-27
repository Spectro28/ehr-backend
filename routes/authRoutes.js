const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth.middleware');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/roles
router.get('/roles', authController.getRoles);

// POST /api/auth/switch-role (requiere autenticación)
router.post('/switch-role', authenticateToken, authController.switchRole);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
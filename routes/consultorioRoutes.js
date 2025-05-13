const express = require('express');
const router = express.Router();
const consultorioController = require('../controllers/consultorioController');
const { authenticateToken } = require('../middleware/auth.middleware');

// Rutas protegidas
router.use(authenticateToken);

// Obtener todos los consultorios
router.get('/', consultorioController.getAll);

// Obtener doctores
router.get('/doctors', consultorioController.getDoctores);

// Crear consultorio
router.post('/', consultorioController.create);

// Actualizar consultorio
router.put('/:id', consultorioController.update);

// Eliminar consultorio
router.delete('/:id', authenticateToken, consultorioController.delete);


module.exports = router;
const express = require('express');
const router = express.Router();
const ubicacionController = require('../controllers/ubicacionController');
const { authenticateToken } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para ubicaciones
router.get('/provincias', ubicacionController.getProvincias);
router.get('/cantones/:provinciaId', ubicacionController.getCantonesByProvincia);
router.get('/parroquias/:cantonId', ubicacionController.getParroquiasByCanton);

module.exports = router;
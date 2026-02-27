const express = require('express');
const router = express.Router();
const medicamentoController = require('../controllers/medicamentoController');
const { authenticateToken } = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Buscar medicamentos
router.get('/buscar', medicamentoController.buscarMedicamentos);

// Obtener medicamento por ID
router.get('/:id', medicamentoController.getMedicamentoById);

// Obtener nombres comerciales de un medicamento
router.get('/:medicamento_id/nombres-comerciales', medicamentoController.getNombresComerciales);

// Agregar nombre comercial
router.post('/nombres-comerciales', medicamentoController.agregarNombreComercial);

// Eliminar nombre comercial
router.delete('/nombres-comerciales/:id', medicamentoController.eliminarNombreComercial);

module.exports = router; 
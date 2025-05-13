const express = require('express');
const router = express.Router();
const prescripcionController = require('../controllers/prescripcionController');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// Rutas de medicamentos (deben ir primero)
router.get('/medicamentos/buscar', prescripcionController.obtenerMedicamentos);
router.get('/medicamentos/:id', prescripcionController.obtenerMedicamentoPorId);

// Rutas de prescripciones
router.post('/:evolucionId', prescripcionController.crear);
router.get('/:evolucionId', prescripcionController.obtenerPorEvolucion);
router.get('/detalle/:id', prescripcionController.obtenerPorId);
router.put('/:id', prescripcionController.actualizar);
router.delete('/:id', prescripcionController.eliminar);

module.exports = router;
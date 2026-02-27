const express = require('express');
const router = express.Router();
const controller = require('../controllers/examenFisicoController');
const { authenticateToken, checkRole } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/catalogos', controller.catalogos);
router.get('/evolucion/:evolucionId', controller.getByEvolucion);
router.post('/upsert', checkRole(['doctor', 'dentista']), controller.upsert);

module.exports = router;



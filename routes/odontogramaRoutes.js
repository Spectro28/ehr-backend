const express = require('express');
const router = express.Router();
const odontogramaController = require('../controllers/odontogramaController');
const { authenticateToken } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para odontogramas
router.post('/', odontogramaController.create);
router.get('/evolucion/:evolucionId', odontogramaController.getByEvolucion);
router.get('/paciente/:pacienteId', odontogramaController.getByPatient);
router.get('/:id', odontogramaController.getById);
router.put('/:id', odontogramaController.update);
router.delete('/:id', odontogramaController.delete);

// Rutas para diagnósticos
router.get('/catalogos/diagnosticos', odontogramaController.getDiagnosticos);
router.post('/catalogos/diagnosticos', odontogramaController.createDiagnostico);

// Rutas para procedimientos
router.get('/catalogos/procedimientos', odontogramaController.getProcedimientos);
router.post('/catalogos/procedimientos', odontogramaController.createProcedimiento);

// Rutas para imagen del paladar
router.post('/:id/imagen-paladar', odontogramaController.uploadImagenPaladar);
router.get('/:id/imagen-paladar', odontogramaController.getImagenPaladar);

module.exports = router;

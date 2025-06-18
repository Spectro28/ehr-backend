const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, patientController.createPatient);
router.put('/:id', authenticateToken, patientController.updatePatient);
router.delete('/:id', authenticateToken, patientController.deletePatient);
router.get('/', authenticateToken, patientController.getPatients);
router.get('/:id', authenticateToken, patientController.getPatientById);

router.get('/patient/:typeIdentification/:identification', patientController.getPatientByIdentification);

module.exports = router;
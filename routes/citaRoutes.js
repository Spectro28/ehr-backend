const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { authenticateToken } = require('../middleware/auth.middleware');

// Primero las rutas específicas
router.get('/disponibilidad', citaController.verificarDisponibilidad);
router.get('/horarios-disponibles', citaController.getHorariosDisponibles);
router.get('/paciente/:pacienteId', authenticateToken, citaController.getCitasByPaciente);
router.get('/doctor/:doctorId', authenticateToken, citaController.getCitasByDoctor);
router.get('/consultorio/:consultorioId', authenticateToken, citaController.getCitasByConsultorio);
router.get('/sin-signos-vitales', citaController.getCitasSinSignosVitales);

// Después las rutas con parámetros genéricos
router.get('/', citaController.getAllCitas);
router.get('/:id', citaController.getCitaById);
router.post('/', authenticateToken, citaController.createCita);
router.put('/:id', authenticateToken, citaController.updateCita);
router.delete('/:id', authenticateToken, citaController.deleteCita);
router.patch('/:id/estado', authenticateToken, citaController.updateEstadoCita);

module.exports = router;
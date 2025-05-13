const express = require('express');
const router = express.Router();
const evolucionController = require('../controllers/evolucionController');
const { authenticateToken } = require('../middleware/auth.middleware');

// Proteger todas las rutas con autenticación
router.use(authenticateToken);

// Ruta para buscar CIE (debe ir antes de las rutas con parámetros)
router.get('/cie/buscar', evolucionController.buscarCIE);

// Ruta para obtener pacientes de otros médicos (agregar antes de las rutas con parámetros)
router.get('/otros-medicos/pacientes', evolucionController.getPacientesOtrosMedicos);

// Ruta para obtener todas las evoluciones de un paciente
router.get('/paciente/:pacienteId/todas-evoluciones', evolucionController.getTodasEvolucionesPaciente);


// Rutas para obtener pacientes filtrados por médico
router.get('/medico/:medicoId/pacientes-clasificados', evolucionController.getPacientesPorMedico);
router.get('/medico/:medicoId/pacientes-con-signos', evolucionController.getPacientesConSignosPorMedico);

// Rutas para evoluciones
router.post('/', evolucionController.create);
router.get('/:id', evolucionController.getById);
router.put('/:id', evolucionController.update);
router.delete('/:id', evolucionController.delete);

// Rutas para evoluciones de pacientes específicos
router.get('/paciente/:pacienteId/medico/:medicoId/evoluciones', evolucionController.getEvolucionesPacientePorMedico);

module.exports = router;
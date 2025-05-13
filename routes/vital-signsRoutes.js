const router = require('express').Router();
const vitalSignsController = require('../controllers/vital-signsController');
const { authenticateToken, checkRole } = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);
router.use(checkRole(['enfermera']));

// La ruta para obtener registros completados debe ir ANTES de la ruta con :id
router.get('/records/completed', vitalSignsController.getCompletedVitalSigns);
router.get('/appointments/pending', vitalSignsController.getPendingAppointments);
router.get('/:id', vitalSignsController.getById);
router.post('/', vitalSignsController.create);
router.put('/:id', vitalSignsController.update); // Asegúrate de que este método exista en el controlador
router.delete('/:id', vitalSignsController.delete);

module.exports = router;
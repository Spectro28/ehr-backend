const express = require('express');
const router = express.Router();

// Importar las rutas
const authRoutes = require('./auth');
const userRoutes = require('./user');
const patientRoutes = require('./patient');
const consultorioRoutes = require('./consultorio');
const citaRoutes = require('./cita');
const vitalSignsRoutes = require('./vital-signs');
const evolucionRoutes = require('./evolucion');
const prescripcionRoutes = require('./prescripcion');
const ubicacionRoutes = require('./ubicacion');
const odontogramaRoutes = require('./odontograma');
const examenFisicoRoutes = require('./examen-fisico');

// Definir las rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/consultorios', consultorioRoutes);
router.use('/citas', citaRoutes);
router.use('/vital-signs', vitalSignsRoutes);
router.use('/evoluciones', evolucionRoutes);
router.use('/prescripciones', prescripcionRoutes);
router.use('/ubicacion', ubicacionRoutes);
router.use('/odontograma', odontogramaRoutes);
router.use('/examen-fisico', examenFisicoRoutes);

module.exports = router;

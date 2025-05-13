const express = require('express');
const router = express.Router();
const catalogosController = require('../controllers/catalogosController'); // Verifica esta ruta

// Asegúrate de que los métodos existan en el controlador
router.get('/provincias', catalogosController.getProvincias);
router.post('/provincias', catalogosController.createProvincia);
router.put('/provincias/:id', catalogosController.updateProvincia);
router.delete('/provincias/:id', catalogosController.deleteProvincia);

router.get('/cantones', catalogosController.getCantones);
router.post('/cantones', catalogosController.createCanton);
router.put('/cantones/:id', catalogosController.updateCanton);
router.delete('/cantones/:id', catalogosController.deleteCanton);

router.get('/parroquias', catalogosController.getParroquias);
router.post('/parroquias', catalogosController.createParroquia);
router.put('/parroquias/:id', catalogosController.updateParroquia);
router.delete('/parroquias/:id', catalogosController.deleteParroquia);


// Rutas CIE-10
router.get('/cie10/categories', catalogosController.getCie10Categories);
router.get('/cie10/subcategories', catalogosController.getCie10Subcategories);
router.get('/cie10/search', catalogosController.searchCie10);
router.post('/cie10', catalogosController.createCie10);
router.put('/cie10/:id', catalogosController.updateCie10);
router.delete('/cie10/:id', catalogosController.deleteCie10);

// Rutas para medicamentos
router.get('/medicamentos', catalogosController.getMedicamentos);
router.get('/medicamentos/search', catalogosController.searchMedicamentos);
router.post('/medicamentos', catalogosController.createMedicamento);
router.put('/medicamentos/:id', catalogosController.updateMedicamento);
router.delete('/medicamentos/:id', catalogosController.deleteMedicamento);

module.exports = router;
const db = require('../models');
const { Op } = require('sequelize');
const Medicamento = db.Medicamento;
const MedicamentoComercial = db.MedicamentoComercial;

// Buscar medicamentos genéricos
exports.buscarMedicamentos = async (req, res) => {
    try {
        const { search } = req.query;
        
        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { nombre_generico: { [Op.iLike]: `%${search}%` } },
                    { nombre_comercial: { [Op.iLike]: `%${search}%` } }
                ],
                estado: true
            };
        } else {
            where = { estado: true };
        }

        const medicamentos = await Medicamento.findAll({
            where,
            include: [
                {
                    model: MedicamentoComercial,
                    as: 'nombres_comerciales',
                    where: { estado: true },
                    required: false
                }
            ],
            limit: 10,
            order: [['nombre_generico', 'ASC']]
        });

        console.log('DEBUG: Medicamentos buscados en medicamentoController:', medicamentos.map(m => ({
            id: m.id,
            nombre_generico: m.nombre_generico,
            nombre_comercial: m.nombre_comercial,
            nombres_comerciales: m.nombres_comerciales?.map(nc => nc.nombre_comercial) || []
        })));

        res.json(medicamentos);
    } catch (error) {
        console.error('Error al buscar medicamentos:', error);
        res.status(500).json({
            message: 'Error al buscar medicamentos',
            error: error.message
        });
    }
};

// Obtener medicamento por ID con nombres comerciales
exports.getMedicamentoById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const medicamento = await Medicamento.findByPk(id, {
            include: [
                {
                    model: MedicamentoComercial,
                    as: 'nombres_comerciales',
                    where: { estado: true },
                    required: false
                }
            ]
        });

        if (!medicamento) {
            return res.status(404).json({
                message: 'Medicamento no encontrado'
            });
        }

        res.json(medicamento);
    } catch (error) {
        console.error('Error al obtener medicamento:', error);
        res.status(500).json({
            message: 'Error al obtener medicamento',
            error: error.message
        });
    }
};

// Agregar nombre comercial a un medicamento
exports.agregarNombreComercial = async (req, res) => {
    try {
        const { medicamento_id, nombre_comercial } = req.body;

        // Verificar que el medicamento existe
        const medicamento = await Medicamento.findByPk(medicamento_id);
        if (!medicamento) {
            return res.status(404).json({
                message: 'Medicamento no encontrado'
            });
        }

        // Verificar que no existe ya este nombre comercial
        const nombreExistente = await MedicamentoComercial.findOne({
            where: {
                medicamento_id,
                nombre_comercial: { [Op.iLike]: nombre_comercial },
                estado: true
            }
        });

        if (nombreExistente) {
            return res.status(400).json({
                message: 'Este nombre comercial ya existe para este medicamento'
            });
        }

        // Crear el nombre comercial
        const nuevoNombreComercial = await MedicamentoComercial.create({
            medicamento_id,
            nombre_comercial
        });

        res.status(201).json(nuevoNombreComercial);
    } catch (error) {
        console.error('Error al agregar nombre comercial:', error);
        res.status(500).json({
            message: 'Error al agregar nombre comercial',
            error: error.message
        });
    }
};

// Eliminar nombre comercial
exports.eliminarNombreComercial = async (req, res) => {
    try {
        const { id } = req.params;
        
        const nombreComercial = await MedicamentoComercial.findByPk(id);
        if (!nombreComercial) {
            return res.status(404).json({
                message: 'Nombre comercial no encontrado'
            });
        }

        await nombreComercial.update({ estado: false });
        
        res.json({
            message: 'Nombre comercial eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar nombre comercial:', error);
        res.status(500).json({
            message: 'Error al eliminar nombre comercial',
            error: error.message
        });
    }
};

// Obtener nombres comerciales de un medicamento
exports.getNombresComerciales = async (req, res) => {
    try {
        const { medicamento_id } = req.params;
        
        const nombresComerciales = await MedicamentoComercial.findAll({
            where: {
                medicamento_id,
                estado: true
            },
            order: [['nombre_comercial', 'ASC']]
        });

        res.json(nombresComerciales);
    } catch (error) {
        console.error('Error al obtener nombres comerciales:', error);
        res.status(500).json({
            message: 'Error al obtener nombres comerciales',
            error: error.message
        });
    }
}; 
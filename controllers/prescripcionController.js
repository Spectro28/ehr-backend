const { Prescripcion, Evolucion, User, Patient, Medicamento } = require('../models');
const db = require('../models');
const { Op } = require('sequelize');

const prescripcionController = {
    crear: async (req, res) => {
        try {
            const { evolucionId } = req.params;
            const medicoId = req.user.id;
            
            // Verificar si hay datos de prescripción
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'No se proporcionaron datos de prescripción'
                });
            }

            const prescripcion = await Prescripcion.create({
                ...req.body,
                evolucionId,
                medicoId
            });

            res.status(201).json({
                success: true,
                data: prescripcion
            });
        } catch (error) {
            console.error('Error al crear prescripción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear la prescripción',
                error: error.message
            });
        }
    },

    obtenerPorEvolucion: async (req, res) => {
        try {
            const { evolucionId } = req.params;
            const prescripciones = await Prescripcion.findAll({
                where: { evolucionId },
                include: [{
                    model: User,
                    as: 'medico',
                    attributes: ['id', 'nombre', 'apellido']
                }]
            });

            res.json({
                success: true,
                data: prescripciones
            });
        } catch (error) {
            console.error('Error al obtener prescripciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las prescripciones',
                error: error.message
            });
        }
    },

    obtenerPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const prescripcion = await Prescripcion.findByPk(id, {
                include: [{
                    model: User,
                    as: 'medico',
                    attributes: ['id', 'nombre', 'apellido']
                }]
            });

            if (!prescripcion) {
                return res.status(404).json({
                    success: false,
                    message: 'Prescripción no encontrada'
                });
            }

            res.json({
                success: true,
                data: prescripcion
            });
        } catch (error) {
            console.error('Error al obtener prescripción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la prescripción',
                error: error.message
            });
        }
    },

    actualizar: async (req, res) => {
        try {
            const { id } = req.params;
            const prescripcion = await Prescripcion.findByPk(id);

            if (!prescripcion) {
                return res.status(404).json({
                    success: false,
                    message: 'Prescripción no encontrada'
                });
            }

            await prescripcion.update(req.body);

            res.json({
                success: true,
                data: prescripcion
            });
        } catch (error) {
            console.error('Error al actualizar prescripción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la prescripción',
                error: error.message
            });
        }
    },
    // Agregar estos nuevos métodos al controlador:
    obtenerMedicamentos: async (req, res) => {
        try {
            const termino = req.query.q || '';
            const medicamentos = await db.Medicamento.findAll({
                where: {
                    [Op.or]: [
                        { nombre_generico: { [Op.iLike]: `%${termino}%` } },
                        { nombre_comercial: { [Op.iLike]: `%${termino}%` } }
                    ]
                },
                limit: 10
            });

            res.json({
                success: true,
                data: medicamentos
            });
        } catch (error) {
            console.error('Error en búsqueda:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar medicamentos',
                error: error.message
            });
        }
    },

obtenerMedicamentoPorId: async (req, res) => {
    try {
        const { id } = req.params;
        const medicamento = await Medicamento.findByPk(id);

        if (!medicamento) {
            return res.status(404).json({
                success: false,
                message: 'Medicamento no encontrado'
            });
        }

        res.json({
            success: true,
            data: medicamento
        });
    } catch (error) {
        console.error('Error al obtener medicamento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el medicamento',
            error: error.message
        });
    }
},
    eliminar: async (req, res) => {
        try {
            const { id } = req.params;
            const prescripcion = await Prescripcion.findByPk(id);

            if (!prescripcion) {
                return res.status(404).json({
                    success: false,
                    message: 'Prescripción no encontrada'
                });
            }

            await prescripcion.destroy();

            res.json({
                success: true,
                message: 'Prescripción eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar prescripción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la prescripción',
                error: error.message
            });
        }
    }
};

module.exports = prescripcionController;
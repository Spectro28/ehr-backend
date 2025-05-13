const db = require('../models');
const { Provincia, Canton, Parroquia } = db;
const { Op } = require('sequelize');

// Controlador para Provincias
exports.getProvincias = async (req, res) => {
    try {
        const provincias = await Provincia.findAll({
            order: [['nombre', 'ASC']]
        });
        res.json({
            success: true,
            data: provincias
        });
    } catch (error) {
        console.error('Error en getProvincias:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener provincias',
            error: error.message
        });
    }
};

exports.createProvincia = async (req, res) => {
    try {
        const { nombre } = req.body;
        const provincia = await Provincia.create({ nombre });
        res.json({
            success: true,
            data: provincia
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear provincia',
            error: error.message
        });
    }
};

exports.updateProvincia = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        await Provincia.update({ nombre }, { where: { id } });
        res.json({
            success: true,
            message: 'Provincia actualizada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar provincia',
            error: error.message
        });
    }
};
exports.deleteProvincia = async (req, res) => {
    try {
        const { id } = req.params;
        await Provincia.destroy({ where: { id } });
        res.json({
            success: true,
            message: 'Provincia eliminada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar provincia',
            error: error.message
        });
    }
};

// Controladores para Cantones
exports.getCantones = async (req, res) => {
    try {
        const { provincia_id } = req.query;
        const where = provincia_id ? { provincia_id } : {};
        
        const cantones = await Canton.findAll({
            where,
            include: [{
                model: Provincia,
                as: 'provincia',
                attributes: ['id', 'nombre']
            }],
            order: [['nombre', 'ASC']]
        });
        
        res.json({
            success: true,
            data: cantones
        });
    } catch (error) {
        console.error('Error en getCantones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cantones',
            error: error.message
        });
    }
};
exports.createCanton = async (req, res) => {
    try {
        const { nombre, provincia_id } = req.body;
        const canton = await Canton.create({ nombre, provincia_id });
        res.json({
            success: true,
            data: canton
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear cantón',
            error: error.message
        });
    }
};

exports.updateCanton = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, provincia_id } = req.body;
        await Canton.update({ nombre, provincia_id }, { where: { id } });
        res.json({
            success: true,
            message: 'Cantón actualizado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar cantón',
            error: error.message
        });
    }
};

exports.deleteCanton = async (req, res) => {
    try {
        const { id } = req.params;
        await Canton.destroy({ where: { id } });
        res.json({
            success: true,
            message: 'Cantón eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar cantón',
            error: error.message
        });
    }
};

// Controladores para Parroquias
exports.getParroquias = async (req, res) => {
    try {
        const { canton_id } = req.query;
        const where = canton_id ? { canton_id } : {};
        
        const parroquias = await Parroquia.findAll({
            where,
            include: [{
                model: Canton,
                as: 'canton',
                attributes: ['id', 'nombre'],
                include: [{
                    model: Provincia,
                    as: 'provincia',
                    attributes: ['id', 'nombre']
                }]
            }],
            order: [['nombre', 'ASC']]
        });
        
        res.json({
            success: true,
            data: parroquias
        });
    } catch (error) {
        console.error('Error en getParroquias:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener parroquias',
            error: error.message
        });
    }
};



exports.createParroquia = async (req, res) => {
    try {
        const { nombre, canton_id } = req.body;
        const parroquia = await Parroquia.create({ nombre, canton_id });
        res.json({
            success: true,
            data: parroquia
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear parroquia',
            error: error.message
        });
    }
};

exports.updateParroquia = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, canton_id } = req.body;
        await Parroquia.update({ nombre, canton_id }, { where: { id } });
        res.json({
            success: true,
            message: 'Parroquia actualizada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar parroquia',
            error: error.message
        });
    }
};

exports.deleteParroquia = async (req, res) => {
    try {
        const { id } = req.params;
        await Parroquia.destroy({ where: { id } });
        res.json({
            success: true,
            message: 'Parroquia eliminada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar parroquia',
            error: error.message
        });
    }
};

// CIE-10 Methods
exports.getCie10Categories = async (req, res) => {
    try {
        const categories = await db.CIE.findAll({
            where: { 
                cie_id: null,
                estado: 1,
                versioncie: 'CIE10'
            },
            include: [{
                model: db.CIE,
                as: 'children',
                required: false
            }],
            order: [['codigo', 'ASC']]
        });
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error en getCie10Categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías CIE-10',
            error: error.message
        });
    }
};

exports.getCie10Subcategories = async (req, res) => {
    try {
        const { parent_id } = req.query;
        
        const subcategories = await db.CIE.findAll({
            where: {
                cie_id: parent_id,
                estado: 1
            },
            include: [{
                model: db.CIE,
                as: 'parent',
                required: false
            }],
            order: [['codigo', 'ASC']]
        });
        
        res.json({
            success: true,
            data: subcategories
        });
    } catch (error) {
        console.error('Error en getCie10Subcategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener subcategorías',
            error: error.message
        });
    }
};
exports.createCie10 = async (req, res) => {
    try {
        const cieData = {
            codigo: req.body.codigo,
            nombre: req.body.nombre,
            versioncie: req.body.versioncie || 'CIE10',
            cie_id: req.body.cie_id || null,
            ctsexo_id: req.body.ctsexo_id,
            edadmin: req.body.edadmin,
            unidadedadmin: req.body.unidadedadmin,
            edadmax: req.body.edadmax,
            unidadedadmax: req.body.unidadedadmax,
            estado: req.body.estado || 1
        };

        const newCie = await db.CIE.create(cieData);
        
        const createdCie = await db.CIE.findByPk(newCie.id, {
            include: [{
                model: db.CIE,
                as: 'parent',
                attributes: ['id', 'codigo', 'nombre']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Código CIE-10 creado exitosamente',
            data: createdCie
        });
    } catch (error) {
        console.error('Error en createCie10:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear código CIE-10',
            error: error.message
        });
    }
};
// Update CIE10
exports.updateCie10 = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Verificar que el registro existe
        const cie = await db.CIE.findByPk(id);
        if (!cie) {
            return res.status(404).json({
                success: false,
                message: 'Código CIE-10 no encontrado'
            });
        }

        // Actualizar el registro
        await cie.update(updateData);

        // Obtener el registro actualizado
        const updatedCie = await db.CIE.findByPk(id, {
            include: [{
                model: db.CIE,
                as: 'parent',
                attributes: ['id', 'codigo', 'nombre']
            }]
        });

        res.json({
            success: true,
            message: 'Código CIE-10 actualizado exitosamente',
            data: updatedCie
        });
    } catch (error) {
        console.error('Error en updateCie10:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar código CIE-10',
            error: error.message
        });
    }
};

exports.deleteCie10 = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el registro existe
        const cie = await db.CIE.findByPk(id);
        if (!cie) {
            return res.status(404).json({
                success: false,
                message: 'Código CIE-10 no encontrado'
            });
        }

        // Eliminar el registro
        await cie.destroy();

        res.json({
            success: true,
            message: 'Código CIE-10 eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error en deleteCie10:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar código CIE-10',
            error: error.message
        });
    }
};

exports.searchCie10 = async (req, res) => {
    try {
        const { query } = req.query;
        
        const results = await db.CIE.findAll({
            where: {
                [db.Sequelize.Op.or]: [
                    {
                        codigo: {
                            [db.Sequelize.Op.iLike]: `%${query}%`
                        }
                    },
                    {
                        nombre: {
                            [db.Sequelize.Op.iLike]: `%${query}%`
                        }
                    }
                ],
                versioncie: 'CIE10'  // Agregado para filtrar solo CIE10
            },
            include: [{
                model: db.CIE,
                as: 'parent',
                required: false,  // Hace el LEFT JOIN
                attributes: ['id', 'codigo', 'nombre']
            }],
            order: [['codigo', 'ASC']],
            limit: 50
        });
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error en searchCie10:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar códigos CIE-10',
            error: error.message
        });
    }
};

//medicamentos metodos
// Obtener todos los medicamentos
exports.getMedicamentos = async (req, res) => {
    try {
        const medicamentos = await db.Medicamento.findAll({
            where: {
                estado: true
            },
            order: [
                ['nombre_generico', 'ASC']
            ]
        });

        res.json({
            success: true,
            data: medicamentos
        });
    } catch (error) {
        console.error('Error al obtener medicamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener medicamentos',
            error: error.message
        });
    }
};

// Buscar medicamentos
exports.searchMedicamentos = async (req, res) => {
    try {
        const { query } = req.query;
        const medicamentos = await db.Medicamento.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { nombre_generico: { [Op.iLike]: `%${query}%` } },
                            { nombre_comercial: { [Op.iLike]: `%${query}%` } }
                        ]
                    },
                    { estado: true }
                ]
            },
            order: [['nombre_generico', 'ASC']]
        });

        res.json({
            success: true,
            data: medicamentos
        });
    } catch (error) {
        console.error('Error en búsqueda de medicamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar medicamentos',
            error: error.message
        });
    }
};

// Crear medicamento
exports.createMedicamento = async (req, res) => {
    try {
        const medicamentoData = {
            nombre_generico: req.body.nombre_generico,
            nombre_comercial: req.body.nombre_comercial,
            forma_farmaceutica: req.body.forma_farmaceutica,
            concentracion: req.body.concentracion,
            via_administracion: req.body.via_administracion,
            categoria: req.body.categoria,
            estado: true
        };

        const newMedicamento = await db.Medicamento.create(medicamentoData);

        res.status(201).json({
            success: true,
            message: 'Medicamento creado exitosamente',
            data: newMedicamento
        });
    } catch (error) {
        console.error('Error al crear medicamento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear medicamento',
            error: error.message
        });
    }
};

// Actualizar medicamento
exports.updateMedicamento = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const medicamento = await db.Medicamento.findByPk(id);
        if (!medicamento) {
            return res.status(404).json({
                success: false,
                message: 'Medicamento no encontrado'
            });
        }

        await medicamento.update(updateData);

        const updatedMedicamento = await db.Medicamento.findByPk(id);

        res.json({
            success: true,
            message: 'Medicamento actualizado exitosamente',
            data: updatedMedicamento
        });
    } catch (error) {
        console.error('Error al actualizar medicamento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar medicamento',
            error: error.message
        });
    }
};

// Eliminar medicamento (soft delete)
exports.deleteMedicamento = async (req, res) => {
    try {
        const { id } = req.params;

        const medicamento = await db.Medicamento.findByPk(id);
        if (!medicamento) {
            return res.status(404).json({
                success: false,
                message: 'Medicamento no encontrado'
            });
        }

        // Soft delete
        await medicamento.update({ estado: false });

        res.json({
            success: true,
            message: 'Medicamento eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar medicamento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar medicamento',
            error: error.message
        });
    }
};
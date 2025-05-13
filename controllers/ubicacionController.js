const { Provincia, Canton, Parroquia } = require('../models');

exports.getProvincias = async (req, res) => {
    try {
        const provincias = await Provincia.findAll({
            order: [['nombre', 'ASC']]
        });
        res.json(provincias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener provincias', error });
    }
};

exports.getCantonesByProvincia = async (req, res) => {
    try {
        const { provinciaId } = req.params;
        const cantones = await Canton.findAll({
            where: { provincia_id: provinciaId },
            order: [['nombre', 'ASC']]
        });
        res.json(cantones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cantones', error });
    }
};

exports.getParroquiasByCanton = async (req, res) => {
    try {
        const { cantonId } = req.params;
        const parroquias = await Parroquia.findAll({
            where: { canton_id: cantonId },
            order: [['nombre', 'ASC']]
        });
        res.json(parroquias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener parroquias', error });
    }
};
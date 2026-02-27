const express = require('express');
const router = express.Router();
const db = require('../models');
const { Sequelize } = require('sequelize');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, async (req, res) => {
  try {
    // Obtener usuarios doctores y dentistas activos
    const [doctors, dentists] = await Promise.all([
      // Obtener doctores
      db.User.findAll({
        attributes: ['especialidad'],
        include: [{
          model: db.Role,
          as: 'roles',
          where: { nombre: 'doctor' },
          through: { attributes: [] }
        }],
        where: {
          active: true,
          especialidad: {
            [db.Sequelize.Op.not]: null
          }
        }
      }),
      // Obtener dentistas
      db.User.findAll({
        include: [{
          model: db.Role,
          as: 'roles',
          where: { nombre: 'dentista' },
          through: { attributes: [] }
        }],
        where: {
          active: true
        }
      })
    ]);

    // Conjunto para almacenar especialidades únicas
    const especialidadesSet = new Set();

    // Procesar doctores
    doctors.forEach(doctor => {
      if (doctor.especialidad) {
        especialidadesSet.add(doctor.especialidad);
      }
    });

    // Si hay dentistas, agregar Odontología
    if (dentists.length > 0) {
      especialidadesSet.add('Odontología');
    }

    // Convertir el conjunto a array y ordenar
    const especialidades = Array.from(especialidadesSet).sort();

    res.json({
      success: true,
      data: especialidades
    });
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener especialidades',
      error: error.message
    });
  }
});

module.exports = router;

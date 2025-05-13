const db = require('../models');  // Añade esta línea
const { Patient } = db;          // Modifica esta línea
const { Op } = require('sequelize');
const empresasValidas = ['CARDIOVASC', 'INVITROMED', 'Empresa 3']

exports.createPatient = async (req, res) => {
  try {
    // Verificar si ya existe un paciente con la misma cédula
    const existingPatient = await Patient.findOne({
      where: { cedula: req.body.cedula }
    });

    if (existingPatient) {
      return res.status(400).json({
        message: 'Ya existe otro paciente con esta cédula'
      });
    }
    // Asegurar que empresa tiene un valor válido
    const empresaSeleccionada = empresasValidas.includes(req.body.empresa)
      ? req.body.empresa
      : 'Sin empresa';

    // Limpia los campos de ID que vengan vacíos
    const patientData = {
      ...req.body,
      empresa: empresaSeleccionada,
      provincia_id: req.body.provincia_id || null,
      canton_id: req.body.canton_id || null,
      parroquia_id: req.body.parroquia_id || null
    };

    console.log('Datos procesados:', patientData); // Para debugging

    const patient = await Patient.create(patientData);
    console.log('Paciente creado:', patient); // Para debugging

    res.status(201).json(patient);
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(400).json({
      message: 'Error al crear el paciente',
      error: error.message
    });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero, verificamos si el paciente existe
    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

       // Asegurar que empresa tiene un valor válido
    const empresaSeleccionada = empresasValidas.includes(req.body.empresa)
      ? req.body.empresa
      : patient.empresa;

    // Procesamos los datos antes de actualizar
    const updateData = {
      ...req.body,
      // Convertimos strings vacíos a null para los campos de ID\
      empresa: empresaSeleccionada,
      provincia_id: req.body.provincia_id || null,
      canton_id: req.body.canton_id || null,
      parroquia_id: req.body.parroquia_id || null
    };

    // Si la cédula cambió, verificamos que la nueva no exista
    if (updateData.cedula && updateData.cedula !== patient.cedula) {
      const existingPatient = await Patient.findOne({
        where: {
          cedula: updateData.cedula,
          id: { [Op.ne]: id } // Excluir el paciente actual
        }
      });

      if (existingPatient) {
        return res.status(400).json({
          message: 'Ya existe otro paciente con esta cédula'
        });
      }
    }

    // Actualizamos el paciente
    await patient.update(updateData);

    // Obtenemos los datos actualizados
    const updatedPatient = await Patient.findByPk(id);

    res.json(updatedPatient);
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(400).json({
      message: 'Error al actualizar el paciente',
      error: error.message
    });
  }
};
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    await patient.destroy();
    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error al eliminar el paciente',
      error: error.message 
    });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (search) {
      where = {
        [Op.or]: [
          { cedula: { [Op.iLike]: `%${search}%` } },
          { apellido_paterno: { [Op.iLike]: `%${search}%` } },
          { apellido_materno: { [Op.iLike]: `%${search}%` } },
          { primer_nombre: { [Op.iLike]: `%${search}%` } },
          { segundo_nombre: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await Patient.findAndCountAll({
      attributes: { 
        exclude: ['nombre_parroquia', 'nombre_canton', 'nombre_provincia'] // Excluir campos antiguos
      },
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['apellido_paterno', 'ASC']],
      include: [
        {
          model: db.Provincia,
          as: 'provincia_info',
          attributes: ['id', 'nombre']
        },
        {
          model: db.Canton,
          as: 'canton_info',
          attributes: ['id', 'nombre']
        },
        {
          model: db.Parroquia,
          as: 'parroquia_info',
          attributes: ['id', 'nombre']
        }
      ]
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      patients: rows
    });
  } catch (error) {
    console.error('Error detallado en getPatients:', error);
    res.status(400).json({ 
      message: 'Error al obtener los pacientes',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: db.Provincia,
          as: 'provincia_info',
          attributes: ['id', 'nombre']
        },
        {
          model: db.Canton,
          as: 'canton_info',
          attributes: ['id', 'nombre']
        },
        {
          model: db.Parroquia,
          as: 'parroquia_info',
          attributes: ['id', 'nombre']
        }
      ]
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Error detallado en getPatientById:', error);
    res.status(400).json({ 
      message: 'Error al obtener el paciente',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
const db = require('../models');
const { Op } = require('sequelize');
const VitalSigns = db.VitalSigns;
const Patient = db.Patient;
const Cita = db.Cita;
const User = db.User;

exports.create = async (req, res) => {
    try {
      console.log('Datos recibidos:', req.body);
      
      // Validar que los campos requeridos estén presentes
      const requiredFields = ['fecha_medicion', 'temperatura', 'presion_arterial', 
                            'pulso', 'frecuencia_respiratoria', 'peso', 'talla'];
      
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({
            success: false,
            message: `El campo ${field} es requerido`
          });
        }
      }
  
      // Calcular IMC si peso y talla están presentes
      if (req.body.peso && req.body.talla) {
        const tallaMts = req.body.talla / 100;
        req.body.imc = (req.body.peso / (tallaMts * tallaMts)).toFixed(2);
      }
  
      const vitalSigns = await db.VitalSigns.create({
        ...req.body,
        enfermeroId: req.user.id
      });
  
      res.status(201).json({
        success: true,
        message: 'Signos vitales registrados correctamente',
        data: vitalSigns
      });
  
    } catch (error) {
      console.error('Error al crear signos vitales:', error);
      res.status(400).json({
        success: false,
        message: 'Error al crear los signos vitales',
        error: error.message
      });
    }
  };

exports.delete = async (req, res) => {
  try {
    const vitalSigns = await VitalSigns.findByPk(req.params.id);
    if (!vitalSigns) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    
    await vitalSigns.destroy();
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar los signos vitales',
      error: error.message 
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const vitalSigns = await VitalSigns.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'paciente' },
        { model: Cita, as: 'cita' },
        { model: User, as: 'enfermero' }
      ]
    });
    
    if (!vitalSigns) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    
    res.json(vitalSigns);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener los signos vitales',
      error: error.message 
    });
  }
};

exports.getPendingAppointments = async (req, res) => {
    try {
      const citas = await db.Cita.findAll({
        where: {
          fecha: {
            [Op.gte]: new Date()
          },
          estado: 'pendiente'
        },
        include: [
          {
            model: db.Patient,
            as: 'paciente',
            attributes: ['id', 'primer_nombre', 'apellido_paterno', 'cedula']
          },
          {
            model: db.Consultorio,
            as: 'consultorio',
            attributes: ['id', 'numero']
          }
        ],
        order: [
          ['fecha', 'ASC'],
          ['hora', 'ASC']
        ]
      });
  
      res.json({
        success: true,
        data: citas
      });
    } catch (error) {
      console.error('Error al obtener citas pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las citas pendientes',
        error: error.message
      });
    }
  };
  

  exports.getCompletedVitalSigns = async (req, res) => {
    try {
      const registros = await db.VitalSigns.findAll({
        include: [
          {
            model: db.Patient,
            as: 'paciente',
            attributes: ['id', 'primer_nombre', 'apellido_paterno', 'cedula']
          },
          {
            model: db.Cita,
            as: 'cita',
            attributes: ['id', 'fecha', 'hora']
          },
          {
            model: db.User,
            as: 'enfermero',
            attributes: ['id', 'username']
          }
        ],
        order: [['created_at', 'DESC']] // Cambiado de createdAt a created_at
      });
  
      res.json({
        success: true,
        data: registros
      });
    } catch (error) {
      console.error('Error al obtener registros completados:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los registros',
        error: error.message
      });
    }
  };

  exports.update = async (req, res) => {
    try {
      const vitalSigns = await db.VitalSigns.findByPk(req.params.id);
      
      if (!vitalSigns) {
        return res.status(404).json({
          success: false,
          message: 'Registro no encontrado'
        });
      }
  
      // Calcular IMC si peso y talla están presentes
      if (req.body.peso && req.body.talla) {
        const tallaMts = req.body.talla / 100;
        req.body.imc = (req.body.peso / (tallaMts * tallaMts)).toFixed(2);
      }
  
      await vitalSigns.update(req.body);
  
      res.json({
        success: true,
        message: 'Registro actualizado correctamente',
        data: vitalSigns
      });
    } catch (error) {
      console.error('Error al actualizar:', error);
      res.status(400).json({
        success: false,
        message: 'Error al actualizar los signos vitales',
        error: error.message
      });
    }
  };

  exports.getVitalSignsByPaciente = async (req, res) => {
    try {
      const { pacienteId } = req.params;
      
      const vitalSigns = await VitalSigns.findAll({
        where: { pacienteId },
        include: [
          {
            model: db.Patient,
            as: 'paciente',
            attributes: ['id', 'primer_nombre', 'apellido_paterno', 'cedula']
          },
          {
            model: db.Cita,
            as: 'cita',
            attributes: ['id', 'fecha', 'hora']
          }
        ],
        order: [['fecha_medicion', 'DESC']]
      });
  
      res.json({
        success: true,
        data: vitalSigns
      });
  
    } catch (error) {
      console.error('Error al obtener registros del paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los registros del paciente',
        error: error.message
      });
    }
  };
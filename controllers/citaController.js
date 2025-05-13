const db = require('../models');
const { Op } = require('sequelize');
const Cita = db.Cita;
const Consultorio = db.Consultorio;
const HorarioConsultorio = db.HorarioConsultorio;
const User = db.User;
const Patient = db.Patient;

// Obtener horarios disponibles
exports.getHorariosDisponibles = async (req, res) => {
    try {
      const { consultorioId, fecha, doctorId } = req.query;
  
      // Buscar el consultorio con sus horarios
      const consultorio = await Consultorio.findByPk(consultorioId, {
        include: ['horarios']
      });
  
      if (!consultorio) {
        return res.status(404).json({
          success: false,
          message: 'Consultorio no encontrado'
        });
      }
  
      // Obtener las citas existentes para ese día
      const citasExistentes = await Cita.findAll({
        where: {
          consultorioId,
          doctorId,
          fecha,
          estado: 'pendiente'
        }
      });
  
      // Obtener el horario del consultorio para ese día
      const diaSemana = new Date(fecha).getDay();
      const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
      const horarioDia = consultorio.horarios.find(h => h.dia === diasSemana[diaSemana]);
  
      if (!horarioDia) {
        return res.json({
          success: true,
          data: []
        });
      }
  
      // Generar slots de tiempo disponibles
      const horasOcupadas = citasExistentes.map(c => c.hora);
      const horasDisponibles = [];
      let horaActual = new Date(`2000-01-01T${horarioDia.horaInicio}`);
      const horaFinal = new Date(`2000-01-01T${horarioDia.horaFin}`);
  
      while (horaActual < horaFinal) {
        const horaStr = horaActual.toTimeString().slice(0, 5);
        if (!horasOcupadas.includes(horaStr)) {
          horasDisponibles.push({
            hora: horaStr,
            consultorioId: parseInt(consultorioId),
            doctorId: parseInt(doctorId)
          });
        }
        horaActual.setMinutes(horaActual.getMinutes() + 30);
      }
  
      res.json({
        success: true,
        data: horasDisponibles
      });
  
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener horarios disponibles',
        error: error.message
      });
    }
  };

  function generarHorasDisponibles(horaInicio, horaFin, horasOcupadas) {
    const slots = [];
    let horaActual = new Date(`2000-01-01T${horaInicio}`);
    const horaFinal = new Date(`2000-01-01T${horaFin}`);
  
    while (horaActual < horaFinal) {
      const horaStr = horaActual.toTimeString().slice(0, 5);
      if (!horasOcupadas.includes(horaStr)) {
        slots.push({
          hora: horaStr
        });
      }
      horaActual.setMinutes(horaActual.getMinutes() + 30); // Intervalos de 30 minutos
    }
  
    return slots;
  }

// Función auxiliar para procesar horarios
function procesarHorariosDisponibles(horarios, citasExistentes, fecha) {
    const horariosDisponibles = [];
    
    horarios.forEach(horario => {
        if (!horario.horaInicio || !horario.horaFin) {
            console.log('Horario inválido:', horario);
            return;
        }

        const inicioMinutos = convertirHoraAMinutos(horario.horaInicio);
        const finMinutos = convertirHoraAMinutos(horario.horaFin);
        
        // Generar slots de 30 minutos
        for (let minutos = inicioMinutos; minutos < finMinutos; minutos += 30) {
            const hora = convertirMinutosAHora(minutos);
            
            // Verificar si el horario ya está ocupado
            const estaOcupado = citasExistentes.some(cita => 
                cita.hora === hora
            );
            
            if (!estaOcupado) {
                horariosDisponibles.push({
                    hora,
                    consultorioId: horario.consultorioId,
                    doctorId: horario.consultorio.doctor.id
                });
            }
        }
    });
    
    return horariosDisponibles;
}

// Crear nueva cita
exports.createCita = async (req, res) => {
    try {
      const { pacienteId, consultorioId, doctorId, fecha, hora, notas } = req.body;
  
      // Validar que no exista una cita en la misma fecha, hora y consultorio
      const citaExistente = await Cita.findOne({
        where: {
          fecha,
          hora,
          consultorioId,
          estado: {
            [Op.notIn]: ['cancelado', 'atendido']
          }
        }
      });
  
      if (citaExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una cita programada para esta fecha y hora en este consultorio'
        });
      }
  
      // También validar que el doctor no tenga otra cita a la misma hora
      const citaDoctorExistente = await Cita.findOne({
        where: {
          fecha,
          hora,
          doctorId,
          estado: {
            [Op.notIn]: ['cancelado', 'atendido']
          }
        }
      });
  
      if (citaDoctorExistente) {
        return res.status(409).json({
          success: false,
          message: 'El doctor ya tiene una cita programada para esta hora'
        });
      }
  
      // Validar que el paciente no tenga otra cita a la misma hora
      const citaPacienteExistente = await Cita.findOne({
        where: {
          fecha,
          hora,
          pacienteId,
          estado: {
            [Op.notIn]: ['cancelado', 'atendido']
          }
        }
      });
  
      if (citaPacienteExistente) {
        return res.status(409).json({
          success: false,
          message: 'El paciente ya tiene una cita programada para esta hora'
        });
      }
  
      // Si pasa todas las validaciones, crear la cita
      const cita = await Cita.create({
        pacienteId,
        consultorioId,
        doctorId,
        fecha,
        hora,
        notas,
        estado: 'pendiente'
      });
  
      res.status(201).json({
        success: true,
        message: 'Cita creada exitosamente',
        data: cita
      });
  
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la cita',
        error: error.message
      });
    }
  };
// Agregar un nuevo endpoint para verificar disponibilidad
exports.verificarDisponibilidad = async (req, res) => {
    try {
      const { fecha, hora, consultorioId } = req.query;
      
      console.log('Verificando disponibilidad:', { fecha, hora, consultorioId });
  
      if (!fecha || !hora || !consultorioId) {
        return res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos'
        });
      }
  
      const citaExistente = await Cita.findOne({
        where: {
          fecha,
          hora,
          consultorioId: parseInt(consultorioId),
          estado: {
            [Op.notIn]: ['cancelado']
          }
        }
      });
  
      console.log('Cita existente:', citaExistente);
  
      return res.json({
        success: true,
        data: {
          disponible: !citaExistente,
          mensaje: citaExistente ? 'Horario ocupado' : 'Horario disponible'
        }
      });
  
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar disponibilidad',
        error: error.message
      });
    }
  };

// Obtener todas las citas

exports.getAllCitas = async (req, res) => {
  try {
    const citas = await db.Cita.findAll({
      include: [
        {
          model: db.Patient,
          as: 'paciente',
          attributes: [
            'id',
            'primer_nombre',
            'segundo_nombre',
            'apellido_paterno',
            'apellido_materno',
            'cedula'
          ],
          required: false // Esto permite que el paciente sea null si no existe
        },
        {
          model: db.User,
          as: 'doctor',
          attributes: ['id', 'username', 'especialidad']
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

    // Asegurarse de que el campo pacienteId esté incluido en la respuesta
    const citasConPacienteId = citas.map(cita => ({
      ...cita.toJSON(),
      pacienteId: cita.paciente ? cita.paciente.id : null
    }));

    res.json({
      success: true,
      data: citasConPacienteId
    });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las citas',
      error: error.message
    });
  }
};
// Obtener una cita por ID
exports.getCitaById = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id, {
      include: [
        {
          model: Patient,
          as: 'paciente',
          attributes: ['id', 'primer_nombre', 'apellido_paterno', 'cedula'] // Especificar los campos necesarios
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'username', 'especialidad']
        },
        {
          model: Consultorio,
          as: 'consultorio',
          attributes: ['id', 'numero']
        }
      ]
    });

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Asegurarse de que la respuesta incluya el pacienteId
    const response = {
      ...cita.toJSON(),
      pacienteId: cita.paciente?.id // Asegurarse de que el pacienteId esté disponible
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la cita',
      error: error.message
    });
  }
};

// Obtener citas por paciente
exports.getCitasByPaciente = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const citas = await Cita.findAll({
            where: { pacienteid: pacienteId }, // Cambiado a minúsculas
            include: [
                {
                    model: Consultorio,
                    as: 'consultorio'
                },
                {
                    model: User,
                    as: 'doctor',
                    attributes: ['id', 'username', 'especialidad']
                }
            ],
            order: [['fecha', 'ASC'], ['hora', 'ASC']]
        });

        res.json({
            success: true,
            data: citas
        });
    } catch (error) {
        console.error('Error al obtener citas del paciente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las citas del paciente',
            error: error.message
        });
    }
};

// Obtener citas por doctor
exports.getCitasByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const citas = await Cita.findAll({
            where: { doctorid: doctorId },
            include: [
                {
                    model: Paciente,
                    as: 'paciente',
                    attributes: ['id', 'nombre', 'apellido', 'cedula']
                },
                {
                    model: Consultorio,
                    as: 'consultorio'
                }
            ],
            order: [['fecha', 'ASC'], ['hora', 'ASC']]
        });

        res.json({
            success: true,
            data: citas
        });
    } catch (error) {
        console.error('Error al obtener citas del doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las citas del doctor',
            error: error.message
        });
    }
};

// Obtener citas por consultorio
exports.getCitasByConsultorio = async (req, res) => {
    try {
      const { consultorioId } = req.params;
      const citas = await Cita.findAll({
        where: { 
          consultorioId,
          estado: {
            [Op.notIn]: ['cancelado', 'atendido'] // Solo traer citas pendientes
          }
        },
        include: [
          {
            model: Patient,
            as: 'paciente',
            attributes: ['id', 'primer_nombre', 'apellido_paterno', 'cedula']
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'username', 'especialidad']
          }
        ],
        order: [['fecha', 'ASC'], ['hora', 'ASC']]
      });
  
      res.json({
        success: true,
        data: citas
      });
    } catch (error) {
      console.error('Error al obtener citas del consultorio:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las citas del consultorio',
        error: error.message
      });
    }
  };

// Actualizar estado de cita
exports.updateEstadoCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const cita = await Cita.findByPk(id);
        if (!cita) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        await cita.update({ estado });

        res.json({
            success: true,
            message: 'Estado de la cita actualizado exitosamente',
            data: cita
        });
    } catch (error) {
        console.error('Error al actualizar estado de la cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado de la cita',
            error: error.message
        });
    }
};

// Actualizar cita
exports.updateCita = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const cita = await Cita.findByPk(id);
        if (!cita) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        await cita.update(updateData);

        res.json({
            success: true,
            message: 'Cita actualizada exitosamente',
            data: cita
        });
    } catch (error) {
        console.error('Error al actualizar la cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la cita',
            error: error.message
        });
    }
};

// Eliminar cita
exports.deleteCita = async (req, res) => {
    try {
        const { id } = req.params;
        const cita = await Cita.findByPk(id);

        if (!cita) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        await cita.destroy();

        res.json({
            success: true,
            message: 'Cita eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar la cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la cita',
            error: error.message
        });
    }
};

// Funciones auxiliares
function procesarHorariosDisponibles(horarios, citasExistentes, fecha) {
    const horariosDisponibles = [];
    
    horarios.forEach(horario => {
        const inicioMinutos = convertirHoraAMinutos(horario.horaInicio);
        const finMinutos = convertirHoraAMinutos(horario.horaFin);
        
        for (let minutos = inicioMinutos; minutos < finMinutos; minutos += 30) {
            const hora = convertirMinutosAHora(minutos);
            
            const estaOcupado = citasExistentes.some(cita => 
                cita.hora === hora
            );
            
            if (!estaOcupado) {
                horariosDisponibles.push({
                    hora,
                    consultorioId: horario.consultorioId,
                    doctorId: horario.consultorio.doctor.id
                });
            }
        }
    });
    
    return horariosDisponibles;
}

exports.getCitasSinSignosVitales = async (req, res) => {
  try {
      const citas = await db.Cita.findAll({
          where: {
              estado: 'pendiente',
              id: {
                  [db.Sequelize.Op.notIn]: db.Sequelize.literal(
                      '(SELECT "citaId" FROM "VitalSigns" WHERE "citaId" IS NOT NULL)'
                  )
              }
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

      return res.json({
          success: true,
          data: citas
      });
  } catch (error) {
      console.error('Error al obtener citas sin signos vitales:', error);
      return res.status(500).json({
          success: false,
          message: 'Error al obtener las citas sin signos vitales',
          error: error.message
      });
  }
};

function convertirHoraAMinutos(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
}

function convertirMinutosAHora(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
const db = require('../models');
const { Op } = require('sequelize');

const mapDiaToEnum = (dia) => {
  const mapping = {
    'LUNES': 'Lunes',
    'MARTES': 'Martes',
    'MIERCOLES': 'Miercoles',
    'JUEVES': 'Jueves',
    'VIERNES': 'Viernes'
  };
  return mapping[dia] || dia;
};

const consultorioController = {
    // Obtener todos los consultorios
    getAll: async (req, res) => {
      try {
          const consultorios = await db.Consultorio.findAll({
              attributes: ['id', 'numero', 'descripcion', 'doctorId', 'estado', 'createdAt', 'updatedAt'],
              include: [
                  {
                      model: db.User,
                      as: 'doctor',
                      attributes: ['id', 'username', 'especialidad', 'active'],
                      where: { active: true },
                      required: false,
                      include: [{
                          model: db.Role,
                          as: 'roles',
                          through: { attributes: [] },
                          required: true
                      }]
                  },
                  {
                      model: db.HorarioConsultorio,
                      as: 'horarios',
                      attributes: ['id', 'dia', 'fecha', 'horaInicio', 'horaFin']
                  }
              ],
              order: [['numero', 'ASC']]
          });

          // Transformar los datos para mantener consistencia
          const consultoriosFormateados = await Promise.all(consultorios.map(async (consultorio) => {
              const plainConsultorio = consultorio.get({ plain: true });
              let doctor = plainConsultorio.doctor;
              
              // Si hay un doctorId pero no hay doctor, intentar obtenerlo directamente
              if (plainConsultorio.doctorId && !doctor) {
                  doctor = await db.User.findOne({
                      where: { 
                          id: plainConsultorio.doctorId,
                          active: true
                      },
                      attributes: ['id', 'username', 'especialidad'],
                      include: [{
                          model: db.Role,
                          as: 'roles',
                          through: { attributes: [] }
                      }]
                  });
                  if (doctor) {
                      doctor = doctor.get({ plain: true });
                  }
              }
              
              let tipo = null;
              let especialidad = null;
              
              if (doctor && doctor.roles) {
                  const roles = doctor.roles.map(r => r.nombre);
                  tipo = roles.includes('doctor') ? 'Doctor' : (roles.includes('dentista') ? 'Dentista' : null);
                  especialidad = roles.includes('dentista') ? 'Odontología' : doctor.especialidad;

                  return {
                      ...plainConsultorio,
                      doctor: {
                          id: doctor.id,
                          username: doctor.username,
                          especialidad: especialidad,
                          tipo: tipo,
                          roles: roles
                      }
                  };
              }

              return {
                  ...plainConsultorio,
                  doctor: null
              };
          }));

          res.json(consultoriosFormateados);
      } catch (error) {
          console.error('Error al obtener consultorios:', error);
          res.status(500).json({ 
              success: false,
              message: 'Error al obtener consultorios',
              error: error.message
          });
      }
    },

    // Crear consultorio
    create: async (req, res) => {
      let t;
      
      try {
        console.log('Datos recibidos:', req.body);
        const { numero, descripcion, doctorId, horarios } = req.body;
  
        // Validaciones iniciales sin transacción
        if (!numero || !doctorId || !horarios) {
          return res.status(400).json({ 
            success: false,
            message: 'Faltan datos requeridos'
          });
        }

        // Verificar si ya existe el consultorio (sin transacción)
        const existingConsultorio = await db.Consultorio.findOne({
          where: { numero },
          attributes: ['id', 'numero', 'descripcion', 'doctorId', 'estado']
        });
  
        if (existingConsultorio) {
          return res.status(400).json({ 
            success: false,
            message: 'Ya existe un consultorio con este número'
          });
        }

        // Verificar que el doctor exista y tenga el rol correcto (sin transacción)
        const doctor = await db.User.findOne({
          where: { id: doctorId },
          attributes: ['id', 'username', 'especialidad'],
          include: [{
            model: db.Role,
            as: 'roles',
            through: { attributes: [] }
          }]
        });

        if (!doctor) {
          return res.status(404).json({ 
            success: false,
            message: 'El profesional especificado no existe' 
          });
        }

        // Verificar que tenga el rol de doctor o dentista
        const roles = doctor.roles.map(r => r.nombre);
        const isDoctor = roles.includes('doctor');
        const isDentista = roles.includes('dentista');

        if (!isDoctor && !isDentista) {
          return res.status(400).json({ 
            success: false,
            message: 'Solo los doctores y dentistas pueden ser asignados a consultorios',
            rolesActuales: roles
          });
        }

        // Verificar que no tenga ambos roles
        if (isDoctor && isDentista) {
          return res.status(400).json({ 
            success: false,
            message: 'Un usuario no puede ser asignado como doctor y dentista simultáneamente',
            rolesActuales: roles
          });
        }

        console.log('Roles del profesional:', roles);

        // Solo verificar especialidad si es doctor (no para dentista)
        if (isDoctor && !doctor.especialidad) {
          return res.status(400).json({ 
            success: false,
            message: 'El doctor debe tener una especialidad asignada' 
          });
        }

        // Iniciar transacción solo para las operaciones de escritura
        t = await db.sequelize.transaction();
  
        // Crear consultorio
        const consultorio = await db.Consultorio.create({
          numero,
          descripcion,
          doctorId,
          estado: 'activo'
        }, { transaction: t });
  
        // Crear horarios con el mapeo de días
        if (horarios && horarios.length > 0) {
          const horariosFormateados = horarios.map(h => ({
            ...h,
            dia: mapDiaToEnum(h.dia),
            fecha: h.fecha,
            consultorioId: consultorio.id
          }));
  
          await db.HorarioConsultorio.bulkCreate(horariosFormateados, { transaction: t });
        }
  
        // Commit de la transacción
        await t.commit();
  
        // Obtener consultorio creado con sus relaciones
        const consultorioCreado = await db.Consultorio.findOne({
          where: { id: consultorio.id },
          attributes: ['id', 'numero', 'descripcion', 'doctorId', 'estado', 'createdAt', 'updatedAt'],
          include: [
            {
              model: db.User,
              as: 'doctor',
              attributes: ['id', 'username', 'especialidad'],
              include: [{
                model: db.Role,
                as: 'roles',
                through: { attributes: [] }
              }]
            },
            {
              model: db.HorarioConsultorio,
              as: 'horarios',
              attributes: ['id', 'dia', 'fecha', 'horaInicio', 'horaFin']
            }
          ]
        });

        // Formatear la respuesta eliminando referencias circulares
        const consultorioPlain = consultorioCreado.get({ plain: true });
        
        // Formatear el objeto de respuesta manualmente
        const response = {
          id: consultorioPlain.id,
          numero: consultorioPlain.numero,
          descripcion: consultorioPlain.descripcion,
          doctorId: consultorioPlain.doctorId,
          estado: consultorioPlain.estado,
          createdAt: consultorioPlain.createdAt,
          updatedAt: consultorioPlain.updatedAt,
          doctor: consultorioPlain.doctor ? {
            id: consultorioPlain.doctor.id,
            username: consultorioPlain.doctor.username,
            especialidad: consultorioPlain.doctor.especialidad,
            roles: consultorioPlain.doctor.roles ? 
                  consultorioPlain.doctor.roles.map(r => r.nombre) : []
          } : null,
          horarios: consultorioPlain.horarios ? 
                   consultorioPlain.horarios.map(h => ({
                     id: h.id,
                     dia: h.dia,
                     fecha: h.fecha,
                     horaInicio: h.horaInicio,
                     horaFin: h.horaFin
                   })) : []
        };
  
        res.status(201).json({
          success: true,
          message: 'Consultorio creado exitosamente',
          data: response
        });
      } catch (error) {
        console.error('Error al crear consultorio:', error);
        if (t) {
          try {
            await t.rollback();
          } catch (rollbackError) {
            console.error('Error al hacer rollback:', rollbackError);
          }
        }
        res.status(500).json({ 
          success: false,
          message: 'Error al crear consultorio',
          error: error.message 
        });
      }
    },

    // Actualizar consultorio
    update: async (req, res) => {
      try {
        const { id } = req.params;
        const { numero, descripcion, doctorId, horarios } = req.body;
        
        console.log('Datos recibidos para actualizar:', { horarios }); // Debug
  
        const consultorio = await db.Consultorio.findByPk(id);
        if (!consultorio) {
          return res.status(404).json({ message: 'Consultorio no encontrado' });
        }
  
        const t = await db.sequelize.transaction();
  
        try {
          // Verificar que el doctor exista y tenga el rol correcto si se está actualizando
          if (doctorId) {
            const doctor = await db.User.findOne({
              where: { id: doctorId },
              attributes: ['id', 'username', 'especialidad'],
              include: [{
                model: db.Role,
                as: 'roles',
                through: { attributes: [] }
              }],
              transaction: t
            });

            if (!doctor) {
              await t.rollback();
              return res.status(404).json({ 
                success: false,
                message: 'El profesional especificado no existe' 
              });
            }

            // Verificar que tenga el rol de doctor o dentista
            const roles = doctor.roles.map(r => r.nombre);
            if (!roles.includes('doctor') && !roles.includes('dentista')) {
              await t.rollback();
              return res.status(400).json({ 
                success: false,
                message: 'Solo los doctores y dentistas pueden ser asignados a consultorios' 
              });
            }

            // Verificar que tenga especialidad asignada
            if (!doctor.especialidad) {
              await t.rollback();
              return res.status(400).json({ 
                success: false,
                message: 'El profesional debe tener una especialidad asignada' 
              });
            }
          }

          // Actualizar consultorio
          await consultorio.update(
            { numero, descripcion, doctorId },
            { transaction: t }
          );
  
          // Actualizar horarios
          if (horarios && horarios.length > 0) {
            // Eliminar horarios existentes
            await db.HorarioConsultorio.destroy({
              where: { consultorioId: id },
              transaction: t
            });
  
            // Crear nuevos horarios con fecha
            const horariosNuevos = horarios.map(h => ({
              consultorioId: id,
              dia: h.dia,
              fecha: h.fecha,
              horaInicio: h.horaInicio,
              horaFin: h.horaFin
            }));
  
            console.log('Horarios a crear:', horariosNuevos); // Debug
  
            await db.HorarioConsultorio.bulkCreate(horariosNuevos, { transaction: t });
          }
  
          await t.commit();
  
          // Obtener consultorio actualizado con todos los campos
          const consultorioActualizado = await db.Consultorio.findOne({
            where: { id },
            include: [
              {
                model: db.User,
                as: 'doctor',
                attributes: ['id', 'username', 'especialidad'],
                include: [{
                  model: db.Role,
                  as: 'roles',
                  through: { attributes: [] }
                }]
              },
              {
                model: db.HorarioConsultorio,
                as: 'horarios',
                attributes: ['id', 'dia', 'fecha', 'horaInicio', 'horaFin']
              }
            ]
          });

          // Formatear la respuesta eliminando referencias circulares
          let response = null;
          
          if (consultorioActualizado) {
            const consultorioPlain = consultorioActualizado.get({ plain: true });
            
            response = {
              id: consultorioPlain.id,
              numero: consultorioPlain.numero,
              descripcion: consultorioPlain.descripcion,
              doctorId: consultorioPlain.doctorId,
              estado: consultorioPlain.estado,
              createdAt: consultorioPlain.createdAt,
              updatedAt: consultorioPlain.updatedAt,
              doctor: consultorioPlain.doctor ? {
                id: consultorioPlain.doctor.id,
                username: consultorioPlain.doctor.username,
                especialidad: consultorioPlain.doctor.especialidad,
                roles: consultorioPlain.doctor.roles ? 
                      consultorioPlain.doctor.roles.map(r => r.nombre) : []
              } : null,
              horarios: consultorioPlain.horarios ? 
                       consultorioPlain.horarios.map(h => ({
                         id: h.id,
                         dia: h.dia,
                         fecha: h.fecha,
                         horaInicio: h.horaInicio,
                         horaFin: h.horaFin
                       })) : []
            };
          }
  
          console.log('Consultorio actualizado:', response); // Debug
          res.json({
            success: true,
            message: 'Consultorio actualizado exitosamente',
            data: response
          });
  
        } catch (error) {
          await t.rollback();
          throw error;
        }
      } catch (error) {
        console.error('Error al actualizar consultorio:', error);
        res.status(500).json({ 
          message: 'Error al actualizar consultorio',
          error: error.message 
        });
      }
  },

    // Eliminar consultorio
    delete: async (req, res) => {
        const t = await db.sequelize.transaction();
        
        try {
            const { id } = req.params;
            console.log('Intentando eliminar consultorio con ID:', id);
    
            // Verificar si el consultorio existe
            const consultorio = await db.Consultorio.findByPk(id, { transaction: t });
            if (!consultorio) {
                await t.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Consultorio no encontrado'
                });
            }
    
            // Verificar citas pendientes
            const citasPendientes = await db.Cita.findAll({
                where: {
                    consultorioId: id,
                    estado: 'pendiente'
                },
                transaction: t
            });
    
            if (citasPendientes.length > 0) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el consultorio porque tiene citas pendientes'
                });
            }
    
            // 1. Primero actualizar todas las citas a histórico
            await db.Cita.update(
                { estado: 'histórico' },
                {
                    where: {
                        consultorioId: id,
                        estado: {
                            [Op.in]: ['atendido', 'cancelado']
                        }
                    },
                    transaction: t
                }
            );
    
            // 2. Luego eliminar todas las citas históricas
            await db.Cita.destroy({
                where: {
                    consultorioId: id,
                    estado: 'histórico'
                },
                transaction: t
            });
    
            // 3. Eliminar horarios
            await db.HorarioConsultorio.destroy({
                where: { consultorioId: id },
                transaction: t
            });
    
            // 4. Finalmente eliminar el consultorio
            await consultorio.destroy({ transaction: t });
    
            await t.commit();
            
            return res.status(200).json({
                success: true,
                message: 'Consultorio eliminado exitosamente'
            });
    
        } catch (error) {
            console.error('Error detallado:', error);
            if (t) await t.rollback();
            
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar el consultorio',
                error: error.message
            });
        }
    },
    // Obtener doctores
    getDoctores: async (req, res) => {
        try {
            // Primero obtener todos los usuarios activos con sus roles
            const doctors = await db.User.findAll({
                attributes: ['id', 'username', 'especialidad'],
                include: [{
                    model: db.Role,
                    as: 'roles',
                    through: { attributes: [] }
                }],
                where: {
                    active: true
                },
                order: [
                    ['especialidad', 'ASC'],
                    ['username', 'ASC']
                ]
            });

            // Buscar los IDs de profesionales que ya tienen consultorio asignado
            const doctoresConConsultorio = await db.Consultorio.findAll({
                attributes: ['doctorId'],
                where: {
                    doctorId: {
                        [db.Sequelize.Op.not]: null
                    }
                }
            });
            
            const doctoresOcupados = doctoresConConsultorio.map(c => c.doctorId);

            // Filtrar solo los usuarios que son doctores o dentistas
            const profesionalesSalud = doctors.filter(user => {
                const roles = user.roles.map(r => r.nombre);
                // Los doctores necesitan especialidad, los dentistas no
                return (roles.includes('doctor') && user.especialidad) || roles.includes('dentista');
            });

            // Filtrar los que no tienen consultorio asignado
            const disponibles = profesionalesSalud.filter(prof => 
                !doctoresOcupados.includes(prof.id)
            );

            // Formatear la respuesta
            const respuesta = disponibles.map(prof => {
                const roles = prof.roles.map(r => r.nombre);
                const isDoctor = roles.includes('doctor');
                const isDentista = roles.includes('dentista');
                return {
                    id: prof.id,
                    username: prof.username,
                    especialidad: isDoctor ? prof.especialidad : (isDentista ? 'Odontología' : 'Sin especialidad'),
                    roles: roles,
                    tipo: isDoctor ? 'Doctor' : (isDentista ? 'Dentista' : 'Otro')
                };
            });

            // Logs para debug
            console.log('Total de profesionales encontrados:', profesionalesSalud.length);
            console.log('Roles encontrados:', [...new Set(profesionalesSalud.flatMap(p => p.roles.map(r => r.nombre)))]);
            console.log('Profesionales disponibles:', disponibles.length);
            console.log('Detalle de profesionales:', respuesta);

            // Enviar una única respuesta
            res.json(respuesta);
        } catch (error) {
            console.error('Error detallado al obtener doctores:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener doctores',
                error: error.message,
                stack: error.stack
            });
        }
    }
};

module.exports = consultorioController;
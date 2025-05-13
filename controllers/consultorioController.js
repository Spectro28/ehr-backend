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
              include: [
                  {
                      model: db.User,
                      as: 'doctor',
                      attributes: ['id', 'username', 'especialidad']
                  },
                  {
                      model: db.HorarioConsultorio,
                      as: 'horarios',
                      attributes: ['id', 'dia', 'fecha', 'horaInicio', 'horaFin']  // Agregamos fecha
                  }
              ]
          });
          res.json(consultorios);
      } catch (error) {
          console.error('Error al obtener consultorios:', error);
          res.status(500).json({ 
              message: 'Error al obtener consultorios',
              error: error.message
          });
      }
    },

    // Crear consultorio
    create: async (req, res) => {
      try {
        const { numero, descripcion, doctorId, horarios } = req.body;
  
        // Validaciones
        if (!numero || !doctorId || !horarios) {
          return res.status(400).json({ message: 'Faltan datos requeridos' });
        }
  
        // Verificar si ya existe el consultorio
        const existingConsultorio = await db.Consultorio.findOne({
          where: { numero }
        });
  
        if (existingConsultorio) {
          return res.status(400).json({ message: 'Ya existe un consultorio con este número' });
        }
  
        // Crear consultorio
        const consultorio = await db.Consultorio.create({
          numero,
          descripcion,
          doctorId,
          estado: 'activo'
        });
  
        // Crear horarios con el mapeo de días
        if (horarios && horarios.length > 0) {
          const horariosFormateados = horarios.map(h => ({
            ...h,
            dia: mapDiaToEnum(h.dia),
            fecha: h.fecha, // Incluimos la fecha
            consultorioId: consultorio.id
          }));
  
          await db.HorarioConsultorio.bulkCreate(horariosFormateados);
        }
  
        // Obtener consultorio creado con sus relaciones
        const consultorioCreado = await db.Consultorio.findOne({
          where: { id: consultorio.id },
          include: ['doctor', 'horarios']
        });
  
        res.status(201).json(consultorioCreado);
      } catch (error) {
        console.error('Error al crear consultorio:', error);
        res.status(500).json({ 
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
                attributes: ['id', 'username', 'especialidad']
              },
              {
                model: db.HorarioConsultorio,
                as: 'horarios',
                attributes: ['id', 'dia', 'fecha', 'horaInicio', 'horaFin']
              }
            ]
          });
  
          console.log('Consultorio actualizado:', consultorioActualizado); // Debug
          res.json(consultorioActualizado);
  
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
            const doctors = await db.User.findAll({
                where: {
                    role: 'doctor',
                    active: true
                },
                attributes: ['id', 'username', 'especialidad']
            });
            res.json(doctors);
        } catch (error) {
            console.error('Error al obtener doctores:', error);
            res.status(500).json({ message: 'Error al obtener doctores' });
        }
    }
};

module.exports = consultorioController;
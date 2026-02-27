const db = require('../models');

const examenFisicoController = {
  async upsert(req, res) {
    try {
      const { evolucionId, vistaInicial, items } = req.body;
      const doctorId = req.user.id;

      if (!evolucionId) {
        return res.status(400).json({ success: false, message: 'evolucionId es requerido' });
      }

      let examen = await db.ExamenFisico.findOne({ where: { evolucionId } });
      if (!examen) {
        examen = await db.ExamenFisico.create({ evolucionId, doctorId, vistaInicial: vistaInicial || 'anverso' });
      } else {
        await examen.update({ vistaInicial: vistaInicial || examen.vistaInicial });
      }

      if (Array.isArray(items)) {
        for (const item of items) {
          let itemRow = await db.ExamenFisicoItem.findOne({
            where: {
              examenFisicoId: examen.id,
              [item.bodyPartId ? 'bodyPartId' : 'bodyPartNombre']: item.bodyPartId || item.bodyPartNombre
            }
          });
          if (!itemRow) {
            itemRow = await db.ExamenFisicoItem.create({
              examenFisicoId: examen.id,
              bodyPartId: item.bodyPartId || null,
              bodyPartNombre: item.bodyPartNombre,
              observaciones: item.observaciones || null
            });
          } else {
            await itemRow.update({ observaciones: item.observaciones || itemRow.observaciones });
          }
          if (Array.isArray(item.lesiones)) {
            for (const lesion of item.lesiones) {
              let existingLesion = await db.ExamenFisicoItemLesion.findOne({
                where: {
                  itemId: itemRow.id,
                  [lesion.lesionId ? 'lesionId' : 'lesionTexto']: lesion.lesionId || lesion.lesionTexto
                }
              });
              if (!existingLesion) {
                await db.ExamenFisicoItemLesion.create({
                  itemId: itemRow.id,
                  lesionId: lesion.lesionId || null,
                  lesionTexto: lesion.lesionTexto || null
                });
              }
            }
          }
        }
      }

      const full = await db.ExamenFisico.findOne({
        where: { id: examen.id },
        include: [{
          model: db.ExamenFisicoItem,
          as: 'items',
          include: [{ model: db.ExamenFisicoItemLesion, as: 'lesiones' }, { model: db.BodyPart, as: 'bodyPart' }]
        }]
      });

      res.json({ success: true, data: full });
    } catch (error) {
      console.error('Error upsert examen físico:', error);
      res.status(500).json({ success: false, message: 'Error al guardar examen físico', error: error.message });
    }
  },

  async getByEvolucion(req, res) {
    try {
      const { evolucionId } = req.params;
      console.log('Buscando examen físico para evolución:', evolucionId);
      
      const examen = await db.ExamenFisico.findOne({
        where: { evolucionId },
        include: [{
          model: db.ExamenFisicoItem,
          as: 'items',
          include: [{ model: db.ExamenFisicoItemLesion, as: 'lesiones' }, { model: db.BodyPart, as: 'bodyPart' }]
        }]
      });
      
      if (!examen) {
        console.log('No existe examen físico para evolución:', evolucionId);
        return res.json({ 
          success: true, 
          data: null,
          message: 'No existe examen físico para esta evolución'
        });
      }
      
      console.log('Examen físico encontrado:', examen.id);
      res.json({ success: true, data: examen });
    } catch (error) {
      console.error('Error al obtener examen físico:', error);
      res.status(500).json({ success: false, message: 'Error al obtener examen físico', error: error.message });
    }
  },

  async catalogos(req, res) {
    try {
      // Partes del cuerpo para examen físico
      const partes = [
        // Anverso (frente)
        { id: 'frente-cabeza', nombre: 'Cabeza', vista: 'anverso' },
        { id: 'frente-ojo-izquierdo', nombre: 'Ojo Izquierdo', vista: 'anverso' },
        { id: 'frente-ojo-derecho', nombre: 'Ojo Derecho', vista: 'anverso' },
        { id: 'frente-nariz', nombre: 'Nariz', vista: 'anverso' },
        { id: 'frente-boca', nombre: 'Boca', vista: 'anverso' },
        { id: 'frente-cuello', nombre: 'Cuello', vista: 'anverso' },
        { id: 'frente-hombro-izquierdo', nombre: 'Hombro Izquierdo', vista: 'anverso' },
        { id: 'frente-hombro-derecho', nombre: 'Hombro Derecho', vista: 'anverso' },
        { id: 'frente-pecho', nombre: 'Pecho', vista: 'anverso' },
        { id: 'frente-brazo-izquierdo', nombre: 'Brazo Izquierdo', vista: 'anverso' },
        { id: 'frente-brazo-derecho', nombre: 'Brazo Derecho', vista: 'anverso' },
        { id: 'frente-codo-izquierdo', nombre: 'Codo Izquierdo', vista: 'anverso' },
        { id: 'frente-codo-derecho', nombre: 'Codo Derecho', vista: 'anverso' },
        { id: 'frente-antebrazo-izquierdo', nombre: 'Antebrazo Izquierdo', vista: 'anverso' },
        { id: 'frente-antebrazo-derecho', nombre: 'Antebrazo Derecho', vista: 'anverso' },
        { id: 'frente-mano-izquierda', nombre: 'Mano Izquierda', vista: 'anverso' },
        { id: 'frente-mano-derecha', nombre: 'Mano Derecha', vista: 'anverso' },
        { id: 'frente-abdomen', nombre: 'Abdomen', vista: 'anverso' },
        { id: 'frente-cadera', nombre: 'Cadera', vista: 'anverso' },
        { id: 'frente-muslo-izquierdo', nombre: 'Muslo Izquierdo', vista: 'anverso' },
        { id: 'frente-muslo-derecho', nombre: 'Muslo Derecho', vista: 'anverso' },
        { id: 'frente-rodilla-izquierda', nombre: 'Rodilla Izquierda', vista: 'anverso' },
        { id: 'frente-rodilla-derecha', nombre: 'Rodilla Derecha', vista: 'anverso' },
        { id: 'frente-pantorrilla-izquierda', nombre: 'Pantorrilla Izquierda', vista: 'anverso' },
        { id: 'frente-pantorrilla-derecha', nombre: 'Pantorrilla Derecha', vista: 'anverso' },
        { id: 'frente-tobillo-izquierdo', nombre: 'Tobillo Izquierdo', vista: 'anverso' },
        { id: 'frente-tobillo-derecho', nombre: 'Tobillo Derecho', vista: 'anverso' },
        { id: 'frente-pie-izquierdo', nombre: 'Pie Izquierdo', vista: 'anverso' },
        { id: 'frente-pie-derecho', nombre: 'Pie Derecho', vista: 'anverso' },
        { id: 'frente-genitales', nombre: 'Genitales', vista: 'anverso' },
        
        // Reverso (espalda)
        { id: 'reverso-cabeza', nombre: 'Cabeza Posterior', vista: 'reverso' },
        { id: 'reverso-occipital', nombre: 'Occipital', vista: 'reverso' },
        { id: 'reverso-cuello', nombre: 'Cuello Posterior', vista: 'reverso' },
        { id: 'reverso-hombro-izquierdo', nombre: 'Hombro Izquierdo', vista: 'reverso' },
        { id: 'reverso-hombro-derecho', nombre: 'Hombro Derecho', vista: 'reverso' },
        { id: 'reverso-omoplato-izquierdo', nombre: 'Omóplato Izquierdo', vista: 'reverso' },
        { id: 'reverso-omoplato-derecho', nombre: 'Omóplato Derecho', vista: 'reverso' },
        { id: 'reverso-columna-cervical', nombre: 'Columna Cervical', vista: 'reverso' },
        { id: 'reverso-columna-toracica', nombre: 'Columna Torácica', vista: 'reverso' },
        { id: 'reverso-columna-lumbar', nombre: 'Columna Lumbar', vista: 'reverso' },
        { id: 'reverso-brazo-izquierdo', nombre: 'Brazo Izquierdo', vista: 'reverso' },
        { id: 'reverso-brazo-derecho', nombre: 'Brazo Derecho', vista: 'reverso' },
        { id: 'reverso-codo-izquierdo', nombre: 'Codo Izquierdo', vista: 'reverso' },
        { id: 'reverso-codo-derecho', nombre: 'Codo Derecho', vista: 'reverso' },
        { id: 'reverso-antebrazo-izquierdo', nombre: 'Antebrazo Izquierdo', vista: 'reverso' },
        { id: 'reverso-antebrazo-derecho', nombre: 'Antebrazo Derecho', vista: 'reverso' },
        { id: 'reverso-mano-izquierda', nombre: 'Mano Izquierda', vista: 'reverso' },
        { id: 'reverso-mano-derecha', nombre: 'Mano Derecha', vista: 'reverso' },
        { id: 'reverso-espalda-baja', nombre: 'Espalda Baja', vista: 'reverso' },
        { id: 'reverso-cresta-iliaca-izquierda', nombre: 'Cresta Ilíaca Izquierda', vista: 'reverso' },
        { id: 'reverso-cresta-iliaca-derecha', nombre: 'Cresta Ilíaca Derecha', vista: 'reverso' },
        { id: 'reverso-sacro', nombre: 'Sacro', vista: 'reverso' },
        { id: 'reverso-gluteo-izquierdo', nombre: 'Glúteo Izquierdo', vista: 'reverso' },
        { id: 'reverso-gluteo-derecho', nombre: 'Glúteo Derecho', vista: 'reverso' },
        { id: 'reverso-muslo-izquierdo', nombre: 'Muslo Izquierdo', vista: 'reverso' },
        { id: 'reverso-muslo-derecho', nombre: 'Muslo Derecho', vista: 'reverso' },
        { id: 'reverso-rodilla-izquierda', nombre: 'Rodilla Izquierda', vista: 'reverso' },
        { id: 'reverso-rodilla-derecha', nombre: 'Rodilla Derecha', vista: 'reverso' },
        { id: 'reverso-pantorrilla-izquierda', nombre: 'Pantorrilla Izquierda', vista: 'reverso' },
        { id: 'reverso-pantorrilla-derecha', nombre: 'Pantorrilla Derecha', vista: 'reverso' },
        { id: 'reverso-talon-izquierdo', nombre: 'Talón Izquierdo', vista: 'reverso' },
        { id: 'reverso-talon-derecho', nombre: 'Talón Derecho', vista: 'reverso' },
        { id: 'reverso-pie-izquierdo', nombre: 'Pie Izquierdo', vista: 'reverso' },
        { id: 'reverso-pie-derecho', nombre: 'Pie Derecho', vista: 'reverso' },
        { id: 'reverso-escroto', nombre: 'Escroto', vista: 'reverso' }
      ];

      // Catálogo de lesiones
      const lesiones = [
        { id: 1, nombre: 'Hematoma', codigo: 'HEM' },
        { id: 2, nombre: 'Herida', codigo: 'HER' },
        { id: 3, nombre: 'Inflamación', codigo: 'INF' },
        { id: 4, nombre: 'Dolor', codigo: 'DOL' },
        { id: 5, nombre: 'Rigidez', codigo: 'RIG' },
        { id: 6, nombre: 'Hinchazón', codigo: 'HIN' },
        { id: 7, nombre: 'Enrojecimiento', codigo: 'ENR' },
        { id: 8, nombre: 'Cicatriz', codigo: 'CIC' },
        { id: 9, nombre: 'Deformidad', codigo: 'DEF' },
        { id: 10, nombre: 'Limitación de movimiento', codigo: 'LIM' }
      ];
      
      res.json({
        success: true,
        data: {
          partes: partes,
          lesiones: lesiones
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener catálogos', error: error.message });
    }
  }
};

module.exports = examenFisicoController;



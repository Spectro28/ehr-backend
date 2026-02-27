const { 
    Odontograma, 
    PiezaOdontograma, 
    IndiceOdontograma,
    Diagnostico,
    Procedimiento,
    DiagnosticoOdontograma,
    ProcedimientoOdontograma,
    Patient,
    User,
    sequelize,
    Op 
} = require('../models');

const odontogramaController = {
    // Crear nuevo odontograma
    async create(req, res) {
        const t = await sequelize.transaction();
        try {
            const { pacienteId, evolucionId, observaciones, piezas, indices, tipo } = req.body;
            const dentistaId = req.user.id; // Obtenido del token JWT

            console.log('Datos recibidos en create:', { pacienteId, evolucionId, observaciones, piezas, indices, tipo });
            
            // Si evolucionId es 0 o no válido, establecerlo como null
            const evolucionIdValido = evolucionId && evolucionId > 0 ? evolucionId : null;

            // Validar que el paciente existe
            const paciente = await Patient.findByPk(pacienteId);
            if (!paciente) {
                await t.rollback();
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }

            // Calcular edad y determinar tipo automáticamente
            let edad = null;
            if (paciente.fecha_nacimiento) {
                const fechaNacimiento = new Date(paciente.fecha_nacimiento);
                const hoy = new Date();
                edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
                const mes = hoy.getMonth() - fechaNacimiento.getMonth();
                if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                    edad--;
                }
            }

            // Determinar tipo basado en edad (≤13 años = infantil, >13 = adulto)
            const tipoAutomatico = edad !== null && edad <= 13 ? 'infantil' : 'adulto';

            // Validar tipo proporcionado vs tipo automático
            if (tipo && tipo !== tipoAutomatico) {
                console.warn(`Tipo de odontograma inconsistente. Recibido: ${tipo}, Automático basado en edad (${edad !== null ? edad : 'desconocida'}): ${tipoAutomatico}. Se usará el tipo automático.`);
            }

            // Crear el odontograma
            const odontograma = await Odontograma.create({
                pacienteId,
                evolucionId: evolucionIdValido,
                dentistaId,
                tipo: tipoAutomatico, // Usar tipo automático basado en edad
                observaciones,
                fecha: new Date()
            }, { transaction: t });

            // Si se proporciona imagen del paladar, guardarla en el paciente
            if (req.body.imagen_paladar) {
                console.log('💾 Guardando imagen del paladar en el paciente...');
                await Patient.update(
                    { imagen_paladar: req.body.imagen_paladar },
                    { where: { id: pacienteId }, transaction: t }
                );
                console.log('✅ Imagen guardada en paciente');
            }

            // Si se proporcionaron piezas dentales, crearlas
            if (piezas && Array.isArray(piezas)) {
                const piezasParaCrear = [];
                
                piezas.forEach(pieza => {
                    // Si la pieza tiene caras, crear una entrada por cada cara
                    if (pieza.caras && Array.isArray(pieza.caras)) {
                        pieza.caras.forEach(cara => {
                            piezasParaCrear.push({
                                odontogramaId: odontograma.id,
                                numeroPieza: pieza.numeroPieza,
                                cara: cara.cara,
                                estado: cara.estado || {},
                                diagnostico: pieza.diagnostico || '',
                                procedimiento: pieza.procedimiento || '',
                                movilidad: pieza.movilidad || 1,
                                recesion: pieza.recesion || 1
                            });
                        });
                    } else {
                        // Estructura antigua para compatibilidad
                        piezasParaCrear.push({
                            ...pieza,
                            odontogramaId: odontograma.id
                        });
                    }
                });
                
                if (piezasParaCrear.length > 0) {
                    // Quitar cualquier dato de diagnóstico/procedimiento para evitar FKs y almacenar sólo la pieza
                    piezasParaCrear.forEach(pieza => {
                        // Campos permitidos: odontogramaId, numeroPieza, cara, estado, movilidad, recesion, hallazgos, tratamientos
                        // Eliminar campos relacionados con diagnósticos/procedimientos enviados por el cliente
                        delete pieza.diagnostico;
                        delete pieza.procedimiento;
                        delete pieza.diagnosticoId;
                        delete pieza.procedimientoId;
                        delete pieza.diagnostico_texto;
                        delete pieza.procedimiento_texto;
                    });

                    await PiezaOdontograma.bulkCreate(piezasParaCrear, { transaction: t });
                }
            }

            // Si se proporcionaron índices, crearlos
            if (indices && Array.isArray(indices)) {
                await IndiceOdontograma.bulkCreate(
                    indices.map(indice => ({
                        ...indice,
                        odontogramaId: odontograma.id
                    })),
                    { transaction: t }
                );
            }

            // Obtener el odontograma completo con sus relaciones
            const odontogramaCompleto = await Odontograma.findByPk(odontograma.id, {
                include: [
                    {
                        model: PiezaOdontograma,
                        as: 'piezas',
                        include: [
                            {
                                model: Diagnostico,
                                as: 'diagnostico'
                            },
                            {
                                model: Procedimiento,
                                as: 'procedimiento'
                            }
                        ]
                    },
                    {
                        model: IndiceOdontograma,
                        as: 'indices'
                    },
                    {
                        model: Patient,
                        as: 'paciente',
                        attributes: ['id', 'primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno', 'cedula']
                    },
                    {
                        model: User,
                        as: 'dentista',
                        attributes: ['id', 'username', 'email', 'especialidad']
                    }
                ],
                transaction: t
            });

            await t.commit();
            res.status(201).json(odontogramaCompleto);
        } catch (error) {
            if (!t.finished) {
                await t.rollback();
            }
            console.error('Error al crear odontograma:', error);
            res.status(500).json({
                message: 'Error al crear el odontograma',
                error: error.message
            });
        }
    },

    // Obtener odontograma por ID de evolución
    async getByEvolucion(req, res) {
        try {
            const { evolucionId } = req.params;
            const odontograma = await Odontograma.findOne({
                where: { evolucionId },
                include: [
                    {
                        model: PiezaOdontograma,
                        as: 'piezas',
                        include: [
                            { model: Diagnostico, as: 'diagnostico' },
                            { model: Procedimiento, as: 'procedimiento' }
                        ]
                    },
                    { model: IndiceOdontograma, as: 'indices' },
                    {
                        model: Patient,
                        as: 'paciente',
                        attributes: ['id', 'primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno', 'cedula']
                    },
                    {
                        model: User,
                        as: 'dentista',
                        attributes: ['id', 'username', 'email', 'especialidad']
                    }
                ]
            });

            if (!odontograma) {
                return res.status(404).json({ message: 'Odontograma no encontrado para la evolución proporcionada' });
            }

            res.json(odontograma);
        } catch (error) {
            console.error('Error al obtener odontograma por evolución:', error);
            res.status(500).json({
                message: 'Error al obtener el odontograma por evolución',
                error: error.message
            });
        }
    },

    // Obtener un odontograma específico
    async getById(req, res) {
        try {
            const { id } = req.params;
            const odontograma = await Odontograma.findByPk(id, {
                include: [
                    {
                        model: PiezaOdontograma,
                        as: 'piezas',
                        include: [
                            {
                                model: Diagnostico,
                                as: 'diagnostico'
                            },
                            {
                                model: Procedimiento,
                                as: 'procedimiento'
                            }
                        ]
                    },
                    {
                        model: IndiceOdontograma,
                        as: 'indices'
                    },
                    {
                        model: Patient,
                        as: 'paciente',
                        attributes: ['id', 'primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno', 'cedula']
                    },
                    {
                        model: User,
                        as: 'dentista',
                        attributes: ['id', 'username', 'email', 'especialidad']
                    }
                ]
            });

            if (!odontograma) {
                return res.status(404).json({ message: 'Odontograma no encontrado' });
            }

            res.json(odontograma);
        } catch (error) {
            console.error('Error al obtener odontograma:', error);
            res.status(500).json({
                message: 'Error al obtener el odontograma',
                error: error.message
            });
        }
    },

    // Obtener todos los odontogramas de un paciente
    async getByPatient(req, res) {
        try {
            const { pacienteId } = req.params;
            
            // Verificar que el paciente existe
            const paciente = await Patient.findByPk(pacienteId);
            if (!paciente) {
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }

            const odontogramas = await Odontograma.findAll({
                where: { pacienteId },
                include: [
                    {
                        model: PiezaOdontograma,
                        as: 'piezas'
                    },
                    {
                        model: IndiceOdontograma,
                        as: 'indices'
                    },
                    {
                        model: User,
                        as: 'dentista',
                        attributes: ['id', 'username', 'email', 'especialidad']
                    }
                ],
                order: [['fecha', 'DESC']]
            });

            res.json(odontogramas);
        } catch (error) {
            console.error('Error al obtener odontogramas del paciente:', error);
            res.status(500).json({
                message: 'Error al obtener los odontogramas',
                error: error.message
            });
        }
    },

    // Actualizar un odontograma
    async update(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { observaciones, piezas, indices, evolucionId, tipo } = req.body;

            const odontograma = await Odontograma.findByPk(id, {
                include: [{
                    model: Patient,
                    as: 'paciente',
                    attributes: ['id', 'fecha_nacimiento']
                }]
            });
            if (!odontograma) {
                await t.rollback();
                return res.status(404).json({ message: 'Odontograma no encontrado' });
            }

            // Calcular edad del paciente y validar tipo
            const paciente = odontograma.paciente;
            let edad = null;
            if (paciente && paciente.fecha_nacimiento) {
                const fechaNacimiento = new Date(paciente.fecha_nacimiento);
                const hoy = new Date();
                edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
                const mes = hoy.getMonth() - fechaNacimiento.getMonth();
                if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                    edad--;
                }
            }

            // Determinar tipo basado en edad (≤13 años = infantil, >13 = adulto)
            const tipoAutomatico = edad !== null && edad <= 13 ? 'infantil' : 'adulto';

            // Validar tipo proporcionado vs tipo automático
            if (tipo && tipo !== tipoAutomatico) {
                console.warn(`Tipo de odontograma inconsistente en actualización. Recibido: ${tipo}, Automático basado en edad (${edad !== null ? edad : 'desconocida'}): ${tipoAutomatico}. Se usará el tipo automático.`);
            }

            // No mapear diagnósticos/procedimientos aquí: los manejaremos fuera para simplificar y evitar FKs

            // Actualizar datos básicos del odontograma
            const updateData = { observaciones };
            if (evolucionId && evolucionId > 0) {
                updateData.evolucionId = evolucionId;
            }
            // Siempre usar el tipo automático basado en edad
            updateData.tipo = tipoAutomatico;
            await odontograma.update(updateData, { transaction: t });

            // Si se proporciona imagen del paladar, actualizarla en el paciente
            if (req.body.imagen_paladar) {
                console.log('💾 Actualizando imagen del paladar en el paciente...');
                await Patient.update(
                    { imagen_paladar: req.body.imagen_paladar },
                    { where: { id: odontograma.pacienteId }, transaction: t }
                );
                console.log('✅ Imagen actualizada en paciente');
            }

            // Actualizar piezas dentales si se proporcionaron
            if (piezas && Array.isArray(piezas)) {
                // Eliminar piezas existentes que no estén en la nueva lista
                const piezasIds = piezas.map(p => p.id).filter(Boolean);
                if (piezasIds.length > 0) {
                    await PiezaOdontograma.destroy({
                        where: {
                            odontogramaId: id,
                            id: { [Op.notIn]: piezasIds }
                        },
                        transaction: t
                    });
                } else {
                    // Si no hay IDs, eliminar todas las piezas existentes
                    await PiezaOdontograma.destroy({
                        where: { odontogramaId: id },
                        transaction: t
                    });
                }

                // Actualizar o crear piezas: almacenar sólo la información de la pieza dental
                     for (const pieza of piezas) {
                         // Construir payload base con los campos relevantes
                         const payload = {
                             numeroPieza: pieza.numeroPieza,
                             estado: pieza.estado,
                             hallazgos: pieza.hallazgos,
                             tratamientos: pieza.tratamientos,
                             movilidad: pieza.movilidad || 1,
                             recesion: pieza.recesion || 1
                         };

                         if (pieza.id) {
                             await PiezaOdontograma.update(payload, {
                                 where: { id: pieza.id },
                                 transaction: t
                             });
                         } else {
                             await PiezaOdontograma.create({ ...payload, odontogramaId: id }, { transaction: t });
                         }
                     }
            }

            // Actualizar índices si se proporcionaron
            if (indices && Array.isArray(indices)) {
                // Eliminar índices existentes que no estén en la nueva lista
                const indicesIds = indices.map(i => i.id).filter(Boolean);
                if (indicesIds.length > 0) {
                    await IndiceOdontograma.destroy({
                        where: {
                            odontogramaId: id,
                            id: { [Op.notIn]: indicesIds }
                        },
                        transaction: t
                    });
                } else {
                    // Si no hay IDs, eliminar todos los índices existentes
                    await IndiceOdontograma.destroy({
                        where: { odontogramaId: id },
                        transaction: t
                    });
                }

                // Actualizar o crear índices
                for (const indice of indices) {
                    if (indice.id) {
                        await IndiceOdontograma.update(
                            {
                                tipo: indice.tipo,
                                valor: indice.valor,
                                detalles: indice.detalles
                            },
                            {
                                where: { id: indice.id },
                                transaction: t
                            }
                        );
                    } else {
                        await IndiceOdontograma.create(
                            {
                                ...indice,
                                odontogramaId: id
                            },
                            { transaction: t }
                        );
                    }
                }
            }

            await t.commit();

            // Obtener el odontograma actualizado
            const odontogramaActualizado = await Odontograma.findByPk(id, {
                include: [
                    {
                        model: PiezaOdontograma,
                        as: 'piezas'
                    },
                    {
                        model: IndiceOdontograma,
                        as: 'indices'
                    },
                    {
                        model: Patient,
                        as: 'paciente',
                        attributes: ['id', 'primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno', 'cedula']
                    },
                    {
                        model: User,
                        as: 'dentista',
                        attributes: ['id', 'username', 'email', 'especialidad']
                    }
                ]
            });

            res.json(odontogramaActualizado);
        } catch (error) {
            await t.rollback();
            console.error('Error al actualizar odontograma:', error);
            res.status(500).json({
                message: 'Error al actualizar el odontograma',
                error: error.message
            });
        }
    },

    // Eliminar un odontograma
    async delete(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const odontograma = await Odontograma.findByPk(id);
            
            if (!odontograma) {
                await t.rollback();
                return res.status(404).json({ message: 'Odontograma no encontrado' });
            }

            // La eliminación en cascada manejará las piezas e índices
            await odontograma.destroy({ transaction: t });
            await t.commit();

            res.json({ message: 'Odontograma eliminado correctamente' });
        } catch (error) {
            await t.rollback();
            console.error('Error al eliminar odontograma:', error);
            res.status(500).json({
                message: 'Error al eliminar el odontograma',
                error: error.message
            });
        }
    },

    // Obtener todos los diagnósticos
    async getDiagnosticos(req, res) {
        try {
            const diagnosticos = await Diagnostico.findAll({
                order: [['nombre', 'ASC']]
            });
            res.json(diagnosticos);
        } catch (error) {
            console.error('Error al obtener diagnósticos:', error);
            res.status(500).json({
                message: 'Error al obtener los diagnósticos',
                error: error.message
            });
        }
    },

    // Obtener todos los procedimientos
    async getProcedimientos(req, res) {
        try {
            const procedimientos = await Procedimiento.findAll({
                order: [['nombre', 'ASC']]
            });
            res.json(procedimientos);
        } catch (error) {
            console.error('Error al obtener procedimientos:', error);
            res.status(500).json({
                message: 'Error al obtener los procedimientos',
                error: error.message
            });
        }
    },

    // Crear un nuevo diagnóstico
    async createDiagnostico(req, res) {
        try {
            const { nombre, codigo, descripcion } = req.body;
            const diagnostico = await Diagnostico.create({
                nombre,
                codigo,
                descripcion
            });
            res.status(201).json(diagnostico);
        } catch (error) {
            console.error('Error al crear diagnóstico:', error);
            res.status(500).json({
                message: 'Error al crear el diagnóstico',
                error: error.message
            });
        }
    },

    // Crear un nuevo procedimiento
    async createProcedimiento(req, res) {
        try {
            const { nombre, codigo, descripcion } = req.body;
            const procedimiento = await Procedimiento.create({
                nombre,
                codigo,
                descripcion
            });
            res.status(201).json(procedimiento);
        } catch (error) {
            console.error('Error al crear procedimiento:', error);
            res.status(500).json({
                message: 'Error al crear el procedimiento',
                error: error.message
            });
        }
    },

    // Subir imagen del paladar (actualizar imagen del paciente)
    async uploadImagenPaladar(req, res) {
        try {
            const { id } = req.params; // ID del odontograma
            const { imagen } = req.body; // imagen en base64

            console.log('=== SUBIENDO IMAGEN DEL PALADAR ===');
            console.log('Odontograma ID:', id);
            console.log('Imagen recibida:', imagen ? 'SÍ' : 'NO');
            console.log('Longitud de imagen:', imagen ? imagen.length : 0);

            if (!imagen) {
                console.log('❌ No se proporcionó imagen');
                return res.status(400).json({ message: 'No se proporcionó imagen' });
            }

            // Verificar que el odontograma existe y obtener pacienteId
            const odontograma = await Odontograma.findByPk(id, {
                attributes: ['id', 'pacienteId']
            });
            if (!odontograma) {
                console.log('❌ Odontograma no encontrado con ID:', id);
                return res.status(404).json({ message: 'Odontograma no encontrado' });
            }

            console.log('✅ Odontograma encontrado, paciente ID:', odontograma.pacienteId);

            // Convertir base64 a buffer
            let imagenLimpia = imagen;
            if (imagen.includes('data:image')) {
                console.log('Removiendo header data:image de la imagen');
                imagenLimpia = imagen.replace(/^data:image\/\w+;base64,/, '');
            }

            console.log('Imagen limpia (primeros 100 caracteres):', imagenLimpia.substring(0, 100));

            // Guardar la imagen en el paciente
            console.log('✅ Imagen base64 válida, procediendo a guardar en paciente...');

            try {
                console.log('💾 Guardando imagen en paciente...');
                console.log('Tamaño de imagen a guardar:', imagenLimpia.length, 'caracteres');

                const resultado = await Patient.update(
                    { imagen_paladar: imagenLimpia },
                    { where: { id: odontograma.pacienteId } }
                );
                console.log('📝 Resultado de update en paciente:', resultado);

                // Verificar que se guardó correctamente
                const pacienteVerificado = await Patient.findByPk(odontograma.pacienteId, {
                    attributes: ['id', 'imagen_paladar']
                });

                console.log('🔍 Verificación después de guardar:');
                console.log('- Imagen guardada:', pacienteVerificado.imagen_paladar ? 'SÍ' : 'NO');
                if (pacienteVerificado.imagen_paladar) {
                    console.log('- Tamaño guardado:', pacienteVerificado.imagen_paladar.length, 'caracteres');
                    console.log('- Tipo de dato:', typeof pacienteVerificado.imagen_paladar);
                    console.log('- Primeros 50 chars:', pacienteVerificado.imagen_paladar.substring(0, 50));
                }

                console.log('✅ Imagen guardada exitosamente en paciente');
                res.json({ message: 'Imagen del paladar subida correctamente' });
            } catch (updateError) {
                console.error('❌ Error al guardar imagen en paciente:', updateError);
                res.status(500).json({
                    message: 'Error al guardar la imagen del paladar',
                    error: updateError.message
                });
            }
        } catch (error) {
            console.error('❌ Error al subir imagen del paladar:', error);
            console.error('Stack trace:', error.stack);
            res.status(500).json({
                message: 'Error al subir la imagen del paladar',
                error: error.message
            });
        }
    },

    // Obtener imagen del paladar
    async getImagenPaladar(req, res) {
        try {
            const { id } = req.params;

            console.log('=== OBTENIENDO IMAGEN DEL PALADAR ===');
            console.log('Buscando imagen para odontograma ID:', id);

            // Buscar el odontograma para obtener el pacienteId
            const odontograma = await Odontograma.findByPk(id, {
                attributes: ['id', 'pacienteId']
            });

            if (!odontograma) {
                console.log('❌ Odontograma no encontrado con ID:', id);
                return res.status(404).json({ message: 'Odontograma no encontrado' });
            }

            console.log('✅ Odontograma encontrado, paciente ID:', odontograma.pacienteId);

            // Buscar la imagen en el paciente
            const paciente = await Patient.findByPk(odontograma.pacienteId, {
                attributes: ['id', 'imagen_paladar']
            });

            if (!paciente) {
                console.log('❌ Paciente no encontrado');
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }

            console.log('✅ Paciente encontrado, verificando imagen...');
            console.log('Imagen existe:', !!paciente.imagen_paladar);
            console.log('Tipo de imagen_paladar:', typeof paciente.imagen_paladar);

            if (paciente.imagen_paladar) {
                console.log('Longitud de imagen_paladar:', paciente.imagen_paladar.length);
                console.log('Primeros 100 caracteres:', paciente.imagen_paladar.substring(0, 100));
                console.log('Últimos 50 caracteres:', paciente.imagen_paladar.substring(paciente.imagen_paladar.length - 50));
            } else {
                console.log('❌ No hay imagen en el paciente');
                return res.status(404).json({ message: 'Imagen no encontrada' });
            }

            console.log('✅ Imagen encontrada, tamaño:', paciente.imagen_paladar.length, 'caracteres');

            // Verificar que sea una cadena base64 válida
            if (typeof paciente.imagen_paladar !== 'string' || paciente.imagen_paladar.length === 0) {
                console.log('❌ La imagen no es una cadena base64 válida');
                return res.status(404).json({ message: 'Imagen no encontrada' });
            }

            // La imagen ya está en base64, verificar si ya tiene el header
            let imagenFinal = paciente.imagen_paladar;
            if (!paciente.imagen_paladar.startsWith('data:image')) {
                imagenFinal = `data:image/jpeg;base64,${paciente.imagen_paladar}`;
            }

            const responseData = {
                imagen: imagenFinal
            };

            console.log('✅ Enviando respuesta con imagen del paciente');
            console.log('Imagen final (primeros 100 chars):', imagenFinal.substring(0, 100));
            res.json(responseData);

        } catch (error) {
            console.error('❌ Error al obtener imagen:', error);
            console.error('Stack trace:', error.stack);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
};

module.exports = odontogramaController;
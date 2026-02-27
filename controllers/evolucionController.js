const db = require('../models');
const { Op } = require('sequelize');
const Evolucion = db.Evolucion;
const Patient = db.Patient;
const VitalSigns = db.VitalSigns;
const Diagnostico = db.Diagnostico;
const CIE = db.CIE;

exports.getPacientesConSignos = async (req, res) => {
    try {
        const medicoId = req.params.medicoId;
        
        // Obtener las citas del médico
        const citasDelMedico = await db.Cita.findAll({
            where: {
                doctorId: medicoId,
                estado: ['pendiente', 'atendido']
            }
        });

        const pacienteIds = [...new Set(citasDelMedico.map(cita => cita.pacienteId))];

        const pacientes = await db.Patient.findAll({
            where: {
                id: pacienteIds // Solo pacientes con citas con este médico
            },
            include: [{
                model: db.VitalSigns,
                as: 'signosVitales',
                required: true,
                attributes: [
                    'id',
                    'fecha_medicion',
                    'temperatura',
                    'presion_arterial',
                    'frecuencia_respiratoria',
                    'pulso',
                    'peso',
                    'talla',
                    'imc'
                ],
                order: [['fecha_medicion', 'DESC']],
                limit: 1,
                separate: true
            }],
            attributes: [
                'id',
                'primer_nombre',
                'segundo_nombre',
                'apellido_paterno',
                'apellido_materno',
                'cedula'
            ]
        });

        res.json({
            success: true,
            data: pacientes
        });
    } catch (error) {
        console.error('Error en getPacientesConSignos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los pacientes con signos vitales',
            error: error.message
        });
    }
};

exports.create = async (req, res) => {
    try {
        console.log('Datos recibidos completos:', req.body);
        
        // Crear la evolución
        const nuevaEvolucion = await db.Evolucion.create({
            motivo_consulta: req.body.motivo_consulta,
            enfermedad_actual: req.body.enfermedad_actual,
            antecedentes_personales: req.body.antecedentes_personales,
            antecedentes_familiares: req.body.antecedentes_familiares,
            pacienteId: req.body.pacienteId,
            medicoId: req.user.id,
            signosVitalesId: req.body.signosVitalesId,
            fecha: req.body.fecha || new Date()
        });

        // Verificar si el usuario es dentista
        const medico = await db.User.findByPk(req.user.id, {
            include: [{
                model: db.Role,
                as: 'roles',
                through: { attributes: [] }
            }]
        });

        const esDentista = medico?.roles?.some(role => role.nombre === 'dentista');
        
        // Para dentistas, validar que se haya proporcionado el motivo de consulta
        if (esDentista && !req.body.motivo_consulta) {
            throw new Error('Los dentistas deben proporcionar al menos el motivo de consulta');
        }

        // Manejar las prescripciones
        if (req.body.medicamentos && Array.isArray(req.body.medicamentos)) {
            const prescripciones = req.body.medicamentos.map(medicamento => ({
                ...medicamento,
                evolucionId: nuevaEvolucion.id,
                medicoId: req.user.id
            }));

            if (prescripciones.length > 0) {
                await db.Prescripcion.bulkCreate(prescripciones);
            }
        }

        // Manejar los diagnósticos
        if (req.body.diagnosticos && Array.isArray(req.body.diagnosticos)) {
            console.log('Diagnósticos recibidos:', req.body.diagnosticos);
            
            // Obtener información de los códigos CIE para los diagnósticos
            const cieIds = req.body.diagnosticos.map(d => d.cieId).filter(id => id);
            console.log('IDs de CIE a buscar:', cieIds);
            
            if (cieIds.length > 0) {
                const codigosCIE = await db.CIE.findAll({
                    where: { id: cieIds },
                    attributes: ['id', 'codigo', 'nombre']
                });
                console.log('Códigos CIE encontrados:', codigosCIE);

                const diagnosticos = req.body.diagnosticos.map(diagnostico => {
                    const codigoCIE = codigosCIE.find(cie => cie.id === diagnostico.cieId);
                    return {
                        evolucionId: nuevaEvolucion.id,
                        cieId: diagnostico.cieId,
                        tipo: diagnostico.tipo,
                        nombre: codigoCIE ? codigoCIE.nombre : 'Diagnóstico sin nombre',
                        codigo: codigoCIE ? codigoCIE.codigo : null
                    };
                });

                console.log('Diagnósticos a crear:', diagnosticos);

                // Usar upsert para evitar conflictos de claves únicas, manejando códigos null
                for (const diagnostico of diagnosticos) {
                    const conflictFields = diagnostico.codigo ? ['codigo'] : ['evolucionId', 'cieId'];
                    await db.Diagnostico.upsert(diagnostico, {
                        conflictFields: conflictFields
                    });
                }
            }
        }

        // Obtener la evolución completa con todas sus relaciones
        const evolucionCompleta = await db.Evolucion.findByPk(nuevaEvolucion.id, {
            include: [
                {
                    model: db.Patient,
                    as: 'paciente'
                },
                {
                    model: db.VitalSigns,
                    as: 'signosVitales'
                },
                {
                    model: db.Prescripcion,
                    as: 'prescripciones'
                },
                {
                    model: db.Diagnostico,
                    as: 'diagnosticos',
                    include: [{
                        model: db.CIE,
                        as: 'cie'
                    }]
                },
                {
                    model: db.Odontograma,
                    as: 'odontograma',
                    include: [
                        { model: db.PiezaOdontograma, as: 'piezas' },
                        { model: db.IndiceOdontograma, as: 'indices' }
                    ]
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Evolución creada correctamente',
            data: evolucionCompleta
        });
    } catch (error) {
        console.error('Error detallado:', error);
        res.status(400).json({
            success: false,
            message: 'Error al crear la evolución',
            error: error.message
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const evolucion = await db.Evolucion.findByPk(req.params.id, {
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
                    ]
                },
                {
                    model: db.VitalSigns,
                    as: 'signosVitales',
                    attributes: [
                        'id',
                        'fecha_medicion',
                        'temperatura',
                        'presion_arterial',
                        'frecuencia_respiratoria',
                        'pulso',
                        'peso',
                        'talla',
                        'imc',
                        'pacienteId'
                    ]
                },
                {
                    model: db.Diagnostico,
                    as: 'diagnosticos',
                    include: [{
                        model: db.CIE,
                        as: 'cie',
                        attributes: [
                            ['id', 'ID'],
                            ['codigo', 'CODIGO'],
                            ['nombre', 'NOMBRE']
                        ]
                    }]
                },
                {
                    model: db.Prescripcion,
                    as: 'prescripciones',
                    attributes: [
                        'id',
                        'fecha_emision',
                        'nombre_generico',
                        'nombre_comercial',
                        'concentracion',
                        'forma_farmaceutica',
                        'dosis',
                        'frecuencia',
                        'duracion_tratamiento',
                        'via_administracion',
                        'indicaciones_adicionales',
                        'evolucionId',
                        'medicoId'
                    ]
                },
                {
                    model: db.User,
                    as: 'medico',
                    attributes: [
                        'id', 
                        'username',
                        'identificacion',
                        'especialidad'
                    ]
                },
                {
                    model: db.Odontograma,
                    as: 'odontograma',
                    required: false,
                    include: [
                        {
                            model: db.PiezaOdontograma,
                            as: 'piezas',
                            required: false,
                            include: [
                                {
                                    model: db.Diagnostico,
                                    as: 'diagnostico',
                                    required: false
                                },
                                {
                                    model: db.Procedimiento,
                                    as: 'procedimiento',
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ],
            attributes: [
                'id',
                'motivo_consulta',
                'enfermedad_actual',
                'antecedentes_personales',
                'antecedentes_familiares',
                'fecha',
                'pacienteId',
                'medicoId',
                'signosVitalesId'
            ]
        });

        if (!evolucion) {
            return res.status(404).json({
                success: false,
                message: 'Evolución no encontrada'
            });
        }

        const evolucionData = evolucion.toJSON();

        // Formatear signos vitales
        if (evolucionData.signosVitales) {
            evolucionData.signosVitales = {
                ...evolucionData.signosVitales,
                frecuencia_cardiaca: evolucionData.signosVitales.pulso,
                fecha_medicion: evolucionData.signosVitales.fecha_medicion,
                imc: parseFloat(evolucionData.signosVitales.imc || 0).toFixed(2)
            };
        }

        // Formatear diagnósticos
        if (evolucionData.diagnosticos) {
            evolucionData.diagnosticos = evolucionData.diagnosticos.map(diagnostico => ({
                id: diagnostico.id,
                cieId: diagnostico.cie.ID,
                codigo: diagnostico.cie.CODIGO,
                nombre: diagnostico.cie.NOMBRE,
                tipo: diagnostico.tipo
            }));
        }

        // Formatear prescripciones/medicamentos
        if (evolucionData.prescripciones) {
            evolucionData.medicamentos = evolucionData.prescripciones.map(prescripcion => ({
                id: prescripcion.id,
                fecha_emision: prescripcion.fecha_emision,
                nombre_generico: prescripcion.nombre_generico,
                nombre_comercial: prescripcion.nombre_comercial,
                concentracion: prescripcion.concentracion,
                forma_farmaceutica: prescripcion.forma_farmaceutica,
                dosis: prescripcion.dosis,
                frecuencia: prescripcion.frecuencia,
                duracion_tratamiento: prescripcion.duracion_tratamiento,
                via_administracion: prescripcion.via_administracion,
                indicaciones_adicionales: prescripcion.indicaciones_adicionales
            }));
        }

        // Formatear información del médico
        if (evolucionData.medico) {
            evolucionData.medico = {
                id: evolucionData.medico.id,
                username: evolucionData.medico.username,
                cedula: evolucionData.medico.identificacion,
                especialidad: evolucionData.medico.especialidad
            };
        }

        // Log para debugging
        console.log('Datos de evolución completos:', {
            datosBasicos: {
                motivo_consulta: evolucionData.motivo_consulta,
                enfermedad_actual: evolucionData.enfermedad_actual,
                antecedentes_personales: evolucionData.antecedentes_personales,
                antecedentes_familiares: evolucionData.antecedentes_familiares
            },
            diagnosticos: evolucionData.diagnosticos,
            medicamentos: evolucionData.medicamentos,
            signosVitales: evolucionData.signosVitales
        });

        res.json({
            success: true,
            data: evolucionData
        });
    } catch (error) {
        console.error('Error detallado al obtener evolución:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la evolución',
            error: error.message
        });
    }
};
exports.buscarCIE = async (req, res) => {
    try {
        const q = req.query.q;
        console.log('Buscando CIE con término:', q);

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                data: []
            });
        }

        const resultados = await db.CIE.findAll({
            where: {
                [Op.or]: [
                    { codigo: { [Op.iLike]: `%${q}%` } },
                    { nombre: { [Op.iLike]: `%${q}%` } }
                ]
            },
            attributes: [
                ['id', 'ID'],
                ['codigo', 'CODIGO'],
                ['nombre', 'NOMBRE']
            ],
            order: [
                ['codigo', 'ASC']
            ],
            limit: 10
        });

        console.log('Resultados encontrados:', resultados.length);

        res.json({
            success: true,
            data: resultados
        });
    } catch (error) {
        console.error('Error en búsqueda CIE:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar códigos CIE',
            error: error.message
        });
    }
};
exports.getPacientesPorMedico = async (req, res) => {
    try {
        const medicoId = req.user.id; // Usar el ID del usuario autenticado
        
        // Obtener citas del médico
        const citasDelMedico = await db.Cita.findAll({
            where: {
                doctorId: medicoId,
                estado: ['pendiente', 'atendido']
            }
        });

        const pacienteIds = [...new Set(citasDelMedico.map(cita => cita.pacienteId))];

        // Buscar pacientes con sus evoluciones
        const pacientes = await db.Patient.findAll({
            where: {
                id: pacienteIds
            },
            include: [
                {
                    model: db.VitalSigns,
                    as: 'signosVitales',
                    required: true
                },
                {
                    model: db.Evolucion,
                    as: 'evoluciones',
                    required: false,
                    where: {
                        medicoId: medicoId
                    },
                    include: [
                        {
                            model: db.Prescripcion,
                            as: 'prescripciones',
                            required: false
                        },
                        {
                            model: db.Diagnostico,
                            as: 'diagnosticos',
                            required: false,
                            include: [{
                                model: db.CIE,
                                as: 'cie',
                                attributes: [
                                    ['id', 'ID'],
                                    ['codigo', 'CODIGO'],
                                    ['nombre', 'NOMBRE']
                                ]
                            }]
                        },
                        {
                            model: db.VitalSigns,
                            as: 'signosVitales'
                        },
                        {
                            model: db.Odontograma,
                            as: 'odontograma',
                            required: false
                        }
                    ]
                }
            ],
            attributes: [
                'id',
                'primer_nombre',
                'segundo_nombre',
                'apellido_paterno',
                'apellido_materno',
                'cedula'
            ]
        });

        // Clasificar pacientes
        const pacientesConEvolucion = pacientes.filter(p => p.evoluciones && p.evoluciones.length > 0);
        const pacientesSinEvolucion = pacientes.filter(p => !p.evoluciones || p.evoluciones.length === 0);

        console.log('Pacientes encontrados:', pacientes.length);
        console.log('Pacientes con evolución:', pacientesConEvolucion.length);
        console.log('Pacientes sin evolución:', pacientesSinEvolucion.length);
        
        // Log detallado de evoluciones
        pacientesConEvolucion.forEach(paciente => {
            console.log(`Paciente ${paciente.primer_nombre} ${paciente.apellido_paterno}:`, {
                evoluciones: paciente.evoluciones.length,
                conOdontograma: paciente.evoluciones.some(ev => ev.odontograma)
            });
        });

        res.json({
            success: true,
            data: {
                conEvolucion: pacientesConEvolucion,
                sinEvolucion: pacientesSinEvolucion
            }
        });
    } catch (error) {
        console.error('Error en getPacientesPorMedico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los pacientes',
            error: error.message
        });
    }
};
exports.getPacientesOtrosMedicos = async (req, res) => {
    try {
        const medicoId = req.user.id;
        
        // Obtener todos los pacientes que tienen citas con otros médicos
        const pacientes = await db.Patient.findAll({
            include: [
                {
                    model: db.Cita,
                    as: 'citas',
                    where: {
                        doctorId: { [Op.ne]: medicoId }, // Citas con otros médicos
                        estado: ['pendiente', 'atendido']
                    },
                    required: true
                },
                {
                    model: db.Evolucion,
                    as: 'evoluciones',
                    required: false,
                    include: [
                        {
                            model: db.User,
                            as: 'medico',
                            attributes: ['id', 'username', 'especialidad']
                        }
                    ]
                }
            ],
            attributes: [
                'id',
                'primer_nombre',
                'segundo_nombre',
                'apellido_paterno',
                'apellido_materno',
                'cedula'
            ]
        });

        res.json({
            success: true,
            data: pacientes
        });
    } catch (error) {
        console.error('Error en getPacientesOtrosMedicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los pacientes',
            error: error.message
        });
    }
};

exports.getPacientesConSignosPorMedico = async (req, res) => {
    try {
        const medicoId = req.user.id; // Usar el ID del usuario autenticado
        console.log('Obteniendo pacientes con signos para médico ID:', medicoId);
        
        // Obtener citas del médico
        const citasDelMedico = await db.Cita.findAll({
            where: {
                doctorId: medicoId,
                estado: ['pendiente', 'atendido']
            }
        });

        const pacienteIds = [...new Set(citasDelMedico.map(cita => cita.pacienteId))];
        console.log('Citas encontradas:', citasDelMedico.length);
        console.log('IDs de pacientes únicos:', pacienteIds);

        const pacientes = await db.Patient.findAll({
            where: {
                id: pacienteIds
            },
            include: [{
                model: db.VitalSigns,
                as: 'signosVitales',
                required: true
            }]
        });

        console.log('Pacientes con signos vitales encontrados:', pacientes.length);

        res.json({
            success: true,
            data: pacientes
        });
    } catch (error) {
        console.error('Error en getPacientesConSignosPorMedico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los pacientes',
            error: error.message
        });
    }
};

exports.getTodasEvolucionesPaciente = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const medicoActualId = req.user.id;

        // Obtener datos del paciente
        const paciente = await db.Patient.findByPk(pacienteId, {
            attributes: ['id', 'primer_nombre', 'apellido_paterno', 'cedula']
        });

        if (!paciente) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }

        // Obtener todas las evoluciones del paciente
        const evoluciones = await db.Evolucion.findAll({
            where: { pacienteId },
            include: [
                {
                    model: db.VitalSigns,
                    as: 'signosVitales'
                },
                {
                    model: db.Prescripcion,
                    as: 'prescripciones'
                },
                {
                    model: db.Diagnostico,
                    as: 'diagnosticos',
                    include: [{
                        model: db.CIE,
                        as: 'cie'
                    }]
                },
                {
                    model: db.Odontograma,
                    as: 'odontograma',
                    required: false,
                    include: [
                        {
                            model: db.PiezaOdontograma,
                            as: 'piezas',
                            required: false,
                            include: [
                                {
                                    model: db.Diagnostico,
                                    as: 'diagnostico',
                                    required: false
                                },
                                {
                                    model: db.Procedimiento,
                                    as: 'procedimiento',
                                    required: false
                                }
                            ]
                        }
                    ]
                },
                {
                    model: db.ExamenFisico,
                    as: 'examenFisico',
                    required: false,
                    include: [
                        {
                            model: db.ExamenFisicoItem,
                            as: 'items',
                            required: false,
                            include: [
                                {
                                    model: db.BodyPart,
                                    as: 'bodyPart',
                                    required: false
                                },
                                {
                                    model: db.ExamenFisicoItemLesion,
                                    as: 'lesiones',
                                    required: false,
                                    include: [
                                        {
                                            model: db.LesionCatalog,
                                            as: 'lesion',
                                            required: false
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: db.User,
                    as: 'medico',
                    attributes: ['id', 'username', 'especialidad']
                }
            ],
            order: [['fecha', 'DESC']]
        });


        // Debug: Verificar si hay odontogramas en la base de datos
        console.log('=== DEBUG ODONTOGRAMAS ===');
        const odontogramasEnBD = await db.Odontograma.findAll({
            where: { pacienteId },
            include: [
                {
                    model: db.PiezaOdontograma,
                    as: 'piezas',
                    required: false,
                    include: [
                        {
                            model: db.Diagnostico,
                            as: 'diagnostico',
                            required: false
                        },
                        {
                            model: db.Procedimiento,
                            as: 'procedimiento',
                            required: false
                        }
                    ]
                }
            ]
        });
        console.log('Odontogramas encontrados en BD para paciente', pacienteId, ':', odontogramasEnBD.length);
        odontogramasEnBD.forEach((odonto, index) => {
            console.log(`  Odontograma ${index + 1}: ID=${odonto.id}, evolucionId=${odonto.evolucionId}, piezas=${odonto.piezas.length}`);
            if (odonto.piezas && odonto.piezas.length > 0) {
                console.log(`    - Primera pieza:`, JSON.stringify(odonto.piezas[0], null, 2));
            }
        });


        // Log para verificar que el examen físico y odontograma se están incluyendo
        console.log('Evoluciones encontradas en getTodasEvolucionesPaciente:', evoluciones.length);
        evoluciones.forEach((evol, index) => {
            console.log(`Evolución ${index + 1} (ID: ${evol.id}):`);
            console.log(`  - examenFisico:`, evol.examenFisico ? 'PRESENTE' : 'AUSENTE');
            console.log(`  - odontograma:`, evol.odontograma ? 'PRESENTE' : 'AUSENTE');
            
            if (evol.examenFisico) {
                console.log(`    - ExamenFisico ID: ${evol.examenFisico.id}`);
                console.log(`    - Items: ${evol.examenFisico.items ? evol.examenFisico.items.length : 0}`);
            }
            
            if (evol.odontograma) {
                console.log(`    - Odontograma ID: ${evol.odontograma.id}`);
                console.log(`    - Piezas: ${evol.odontograma.piezas ? evol.odontograma.piezas.length : 0}`);
                if (evol.odontograma.piezas && evol.odontograma.piezas.length > 0) {
                    console.log(`    - Primera pieza:`, JSON.stringify(evol.odontograma.piezas[0], null, 2));
                }
            }
        });
        console.log('=== FIN DEBUG ODONTOGRAMAS ===');

        // Debug final: verificar qué se está enviando
        console.log('=== DATOS FINALES ENVIADOS ===');
        console.log('Evoluciones a enviar:', evoluciones.length);
        evoluciones.forEach((evol, index) => {
            console.log(`Evolución ${index + 1}:`);
            console.log(`  - ID: ${evol.id}`);
            console.log(`  - odontograma:`, evol.odontograma ? 'PRESENTE' : 'AUSENTE');
            if (evol.odontograma) {
                console.log(`  - odontograma.id: ${evol.odontograma.id}`);
                console.log(`  - odontograma.piezas: ${evol.odontograma.piezas ? evol.odontograma.piezas.length : 0}`);
            }
        });

        res.json({
            success: true,
            data: {
                paciente,
                evoluciones,
                medicoActualId // Enviar el ID del médico actual
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las evoluciones',
            error: error.message
        });
    }
};

exports.getEvolucionesPacientePorMedico = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        
        // Obtener el paciente primero
        const paciente = await db.Patient.findByPk(pacienteId, {
            attributes: ['id', 'primer_nombre', 'apellido_paterno', 'cedula']
        });

        if (!paciente) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }

        // Obtener las evoluciones con todos sus datos relacionados
        const evoluciones = await db.Evolucion.findAll({
            where: {
                pacienteId
            },
            include: [
                {
                    model: db.VitalSigns,
                    as: 'signosVitales'
                },
                {
                    model: db.Prescripcion,
                    as: 'prescripciones'
                },
                {
                    model: db.Diagnostico,
                    as: 'diagnosticos',
                    include: [{
                        model: db.CIE,
                        as: 'cie',
                        attributes: [
                            ['id', 'ID'],
                            ['codigo', 'CODIGO'],
                            ['nombre', 'NOMBRE']
                        ]
                    }]
                },
                {
                    model: db.User,
                    as: 'medico',
                    attributes: ['id', 'username', 'especialidad']
                }
            ],
            order: [['fecha', 'DESC']]
        });

        // Log para debugging
        console.log('Evoluciones encontradas:', JSON.stringify(evoluciones, null, 2));

        res.json({
            success: true,
            data: {
                paciente,
                evoluciones
            }
        });
    } catch (error) {
        console.error('Error en getEvolucionesPacientePorMedico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las evoluciones',
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
   try {
       console.log('=== INICIO UPDATE EVOLUCIÓN ===');
       console.log('Actualizando evolución:', req.params.id);
       console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));
       console.log('Usuario:', req.user.id);

       // Validar que el ID sea un número válido
       const evolucionId = parseInt(req.params.id);
       if (isNaN(evolucionId)) {
           console.log('ID de evolución inválido:', req.params.id);
           return res.status(400).json({
               success: false,
               message: 'ID de evolución inválido'
           });
       }

       // Verificar el rol del usuario para validaciones específicas
       const medico = await db.User.findByPk(req.user.id, {
           include: [{
               model: db.Role,
               as: 'roles',
               through: { attributes: [] }
           }]
       });

       const esDentista = medico?.roles?.some(role => role.nombre === 'dentista');

       // Para dentistas, validar que se proporcione al menos motivo de consulta si se está actualizando
       if (esDentista && req.body.motivo_consulta !== undefined && !req.body.motivo_consulta) {
           throw new Error('Los dentistas deben proporcionar al menos el motivo de consulta');
       }

       // DIAGNOSTIC LOGGING: Log data types and validation
       console.log('=== DIAGNOSTIC LOGGING ===');
       console.log('motivo_consulta:', req.body.motivo_consulta, 'type:', typeof req.body.motivo_consulta);
       console.log('enfermedad_actual:', req.body.enfermedad_actual, 'type:', typeof req.body.enfermedad_actual);
       console.log('antecedentes_personales:', req.body.antecedentes_personales, 'type:', typeof req.body.antecedentes_personales);
       console.log('antecedentes_familiares:', req.body.antecedentes_familiares, 'type:', typeof req.body.antecedentes_familiares);
       console.log('pacienteId:', req.body.pacienteId, 'type:', typeof req.body.pacienteId);
       console.log('medicoId:', req.body.medicoId, 'type:', typeof req.body.medicoId);
       console.log('signosVitalesId:', req.body.signosVitalesId, 'type:', typeof req.body.signosVitalesId);
       console.log('diagnosticos:', req.body.diagnosticos, 'type:', typeof req.body.diagnosticos);
       console.log('medicamentos:', req.body.medicamentos, 'type:', typeof req.body.medicamentos);
       console.log('=== END DIAGNOSTIC LOGGING ===');
        
        const evolucion = await db.Evolucion.findByPk(evolucionId);

        if (!evolucion) {
            console.log('Evolución no encontrada o sin permisos');
            return res.status(404).json({
                success: false,
                message: 'Evolución no encontrada o no tiene permisos para editarla'
            });
        }

        console.log('Evolución encontrada:', evolucion.id);

        // Actualizar datos básicos de la evolución
        console.log('Actualizando datos básicos...');
        const updateData = {
            motivo_consulta: req.body.motivo_consulta,
            enfermedad_actual: req.body.enfermedad_actual,
            antecedentes_personales: req.body.antecedentes_personales,
            antecedentes_familiares: req.body.antecedentes_familiares
        };
        console.log('Datos a actualizar:', JSON.stringify(updateData, null, 2));

        try {
            await evolucion.update(updateData);
            console.log('Datos básicos actualizados exitosamente');
        } catch (updateError) {
            console.error('ERROR al actualizar datos básicos:', updateError);
            console.error('Error name:', updateError.name);
            console.error('Error message:', updateError.message);
            console.error('Error details:', updateError.errors);
            throw updateError;
        }

        // Actualizar diagnósticos - solo si se proporcionan en el request
        if (req.body.diagnosticos !== undefined) {
            console.log('=== PROCESANDO DIAGNÓSTICOS ===');
            console.log('Diagnósticos recibidos:', JSON.stringify(req.body.diagnosticos, null, 2));
            console.log('Tipo de diagnosticos:', typeof req.body.diagnosticos);
            console.log('Es array:', Array.isArray(req.body.diagnosticos));
            console.log('Longitud:', req.body.diagnosticos ? req.body.diagnosticos.length : 'N/A');

            // Eliminar diagnósticos existentes solo si se proporcionan nuevos
            try {
                const deletedCount = await db.Diagnostico.destroy({
                    where: { evolucionId: evolucion.id }
                });
                console.log('Diagnósticos existentes eliminados:', deletedCount);
            } catch (deleteError) {
                console.error('ERROR eliminando diagnósticos existentes:', deleteError);
                throw deleteError;
            }

            // Crear nuevos diagnósticos solo si hay datos
            if (Array.isArray(req.body.diagnosticos) && req.body.diagnosticos.length > 0) {
                console.log('Creando nuevos diagnósticos:', req.body.diagnosticos.length);

                // Obtener información de los códigos CIE para los diagnósticos (igual que en create)
                const cieIds = req.body.diagnosticos.map(d => d.cieId).filter(id => id);
                console.log('IDs de CIE extraídos:', cieIds);
                console.log('IDs de CIE únicos:', [...new Set(cieIds)]);

                let codigosCIE = [];
                if (cieIds.length > 0) {
                    try {
                        codigosCIE = await db.CIE.findAll({
                            where: { id: cieIds },
                            attributes: ['id', 'codigo', 'nombre']
                        });
                        console.log('Códigos CIE encontrados:', codigosCIE.length);
                        console.log('Códigos CIE detallados:', JSON.stringify(codigosCIE, null, 2));
                    } catch (cieError) {
                        console.error('ERROR buscando códigos CIE:', cieError);
                        throw cieError;
                    }
                } else {
                    console.log('No hay IDs de CIE válidos para buscar');
                }

                // Usar upsert para cada diagnóstico para manejar conflictos mejor
                let processedCount = 0;
                for (const [index, diagnostico] of req.body.diagnosticos.entries()) {
                    console.log(`Procesando diagnóstico ${index + 1}:`, JSON.stringify(diagnostico, null, 2));

                    const codigoCIE = codigosCIE.find(cie => cie.id === diagnostico.cieId);
                    console.log(`Código CIE encontrado para cieId ${diagnostico.cieId}:`, codigoCIE ? JSON.stringify(codigoCIE, null, 2) : 'NO ENCONTRADO');

                    const diagnosticoData = {
                        evolucionId: evolucion.id,
                        cieId: diagnostico.cieId,
                        tipo: diagnostico.tipo,
                        nombre: codigoCIE ? codigoCIE.nombre : 'Diagnóstico sin nombre',
                        codigo: codigoCIE ? codigoCIE.codigo : null
                    };

                    console.log(`Datos del diagnóstico a insertar:`, JSON.stringify(diagnosticoData, null, 2));

                    // Usar upsert con campos de conflicto apropiados
                    const conflictFields = diagnosticoData.codigo ? ['codigo'] : ['evolucionId', 'cieId'];
                    console.log(`Campos de conflicto:`, conflictFields);

                    try {
                        const result = await db.Diagnostico.upsert(diagnosticoData, {
                            conflictFields: conflictFields
                        });
                        console.log(`Diagnóstico ${index + 1} upsert result:`, result);
                        processedCount++;
                    } catch (upsertError) {
                        console.error(`ERROR en upsert del diagnóstico ${index + 1}:`, upsertError);
                        console.error('Error name:', upsertError.name);
                        console.error('Error message:', upsertError.message);
                        console.error('Diagnóstico problemático:', JSON.stringify(diagnosticoData, null, 2));
                        throw upsertError;
                    }
                }
                console.log(`Diagnósticos procesados exitosamente: ${processedCount}/${req.body.diagnosticos.length}`);
            } else {
                console.log('No hay diagnósticos para crear (array vacío o no es array)');
            }
        } else {
            console.log('Diagnósticos no incluidos en el request - manteniendo existentes');
        }
        console.log('=== FIN PROCESAMIENTO DIAGNÓSTICOS ===');

        // Actualizar prescripciones - solo si se proporcionan en el request
        if (req.body.medicamentos !== undefined) {
            console.log('Procesando medicamentos:', req.body.medicamentos);
            
            // Eliminar prescripciones existentes solo si se proporcionan nuevas
            await db.Prescripcion.destroy({
                where: { evolucionId: evolucion.id }
            });
            console.log('Prescripciones existentes eliminadas');

            // Crear nuevas prescripciones solo si hay datos
            if (Array.isArray(req.body.medicamentos) && req.body.medicamentos.length > 0) {
                const prescripciones = req.body.medicamentos.map(medicamento => ({
                    ...medicamento,
                    evolucionId: evolucion.id,
                    medicoId: req.user.id
                }));

                console.log('Creando nuevas prescripciones:', prescripciones);
                await db.Prescripcion.bulkCreate(prescripciones);
                console.log('Prescripciones creadas');
            } else {
                console.log('No hay medicamentos para crear');
            }
        } else {
            console.log('Medicamentos no incluidos en el request - manteniendo existentes');
        }

        console.log('Obteniendo evolución actualizada...');
        
        // Obtener la evolución actualizada con todas sus relaciones
        const evolucionActualizada = await db.Evolucion.findByPk(evolucion.id, {
            include: [
                {
                    model: db.Patient,
                    as: 'paciente',
                    attributes: ['id', 'primer_nombre', 'apellido_paterno', 'cedula']
                },
                {
                    model: db.VitalSigns,
                    as: 'signosVitales'
                },
                {
                    model: db.Diagnostico,
                    as: 'diagnosticos',
                    include: [{
                        model: db.CIE,
                        as: 'cie'
                    }]
                },
                {
                    model: db.Prescripcion,
                    as: 'prescripciones',
                    attributes: [
                        'id',
                        'fecha_emision',
                        'nombre_generico',
                        'nombre_comercial',
                        'concentracion',
                        'forma_farmaceutica',
                        'dosis',
                        'frecuencia',
                        'duracion_tratamiento',
                        'via_administracion',
                        'indicaciones_adicionales',
                        'evolucionId',
                        'medicoId'
                    ]
                },
                {
                    model: db.Odontograma,
                    as: 'odontograma',
                    required: false,
                    include: [
                        { model: db.PiezaOdontograma, as: 'piezas' },
                        { model: db.IndiceOdontograma, as: 'indices' }
                    ]
                }
            ]
        });

        console.log('Evolución actualizada obtenida:', evolucionActualizada.id);
        console.log('=== FIN UPDATE EVOLUCIÓN ===');

        res.json({
            success: true,
            message: 'Evolución actualizada correctamente',
            data: evolucionActualizada
        });
    } catch (error) {
        console.error('=== ERROR EN UPDATE EVOLUCIÓN ===');
        console.error('Error al actualizar evolución:', error);
        console.error('Stack trace:', error.stack);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        // Enhanced error logging for debugging
        if (error.name === 'SequelizeValidationError') {
            console.error('VALIDATION ERRORS:');
            error.errors.forEach(err => {
                console.error(`- Field: ${err.path}, Value: ${err.value}, Message: ${err.message}, Validator: ${err.validatorName}`);
            });
        } else if (error.name === 'SequelizeForeignKeyConstraintError') {
            console.error('FOREIGN KEY ERROR:');
            console.error('- Table:', error.table);
            console.error('- Fields:', error.fields);
            console.error('- Parent table:', error.parent?.table);
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('UNIQUE CONSTRAINT ERROR:');
            console.error('- Fields:', error.fields);
            console.error('- Constraint:', error.constraint);
        }

        // Determinar el tipo de error y el código de estado apropiado
        let statusCode = 400;
        let errorMessage = 'Error al actualizar la evolución';

        if (error.name === 'SequelizeValidationError') {
            statusCode = 400;
            errorMessage = 'Error de validación de datos';
        } else if (error.name === 'SequelizeForeignKeyConstraintError') {
            statusCode = 400;
            errorMessage = 'Error de referencia de clave foránea';
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            statusCode = 400;
            errorMessage = 'Error de restricción única';
        } else if (error.name === 'SequelizeDatabaseError') {
            statusCode = 500;
            errorMessage = 'Error de base de datos';
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: error.message,
            details: error.details || error.errors || 'Sin detalles adicionales',
            errorType: error.name,
            diagnosticInfo: {
                receivedData: req.body,
                userId: req.user?.id,
                evolucionId: req.params.id
            }
        });
    }
};


exports.getPacientesConYSinEvolucion = async (req, res) => {
    try {
        console.log('Iniciando búsqueda de pacientes clasificados');
        
        const pacientes = await db.Patient.findAll({
            include: [
                {
                    model: db.VitalSigns,
                    as: 'signosVitales',
                    required: true,
                    attributes: [
                        'id',
                        'fecha_medicion',
                        'temperatura',
                        'presion_arterial',
                        'frecuencia_respiratoria'
                    ]
                },
                {
                    model: db.Evolucion,
                    as: 'evoluciones',
                    required: false,
                    include: [{
                        model: db.Prescripcion,
                        as: 'prescripciones',
                        required: false
                    }]
                }
            ],
            attributes: [
                'id',
                'primer_nombre',
                'segundo_nombre',
                'apellido_paterno',
                'apellido_materno',
                'cedula'
            ]
        });

        // Clasificar pacientes
        const pacientesConEvolucion = pacientes.filter(p => p.evoluciones && p.evoluciones.length > 0);
        const pacientesSinEvolucion = pacientes.filter(p => !p.evoluciones || p.evoluciones.length === 0);

        res.json({
            success: true,
            data: {
                conEvolucion: pacientesConEvolucion,
                sinEvolucion: pacientesSinEvolucion
            }
        });
    } catch (error) {
        console.error('Error en getPacientesConYSinEvolucion:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los pacientes clasificados',
            error: error.message
        });
    }
};

exports.getEvolucionesPaciente = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const medicoId = req.user.id; // Obtener el ID del médico del token

        // Primero verificar si el paciente tiene cita con este médico
        const tieneCita = await db.Cita.findOne({
            where: {
                pacienteId: pacienteId,
                doctorId: medicoId,
                estado: ['pendiente', 'atendido']
            }
        });

        if (!tieneCita) {
            return res.status(403).json({
                success: false,
                message: 'No tiene autorización para ver las evoluciones de este paciente'
            });
        }
        
        // Buscar evoluciones
        console.log('Buscando evoluciones para paciente:', pacienteId, 'médico:', medicoId);
        const evoluciones = await db.Evolucion.findAll({
            where: { 
                pacienteId,
                medicoId // Filtrar solo las evoluciones de este médico
            },
            include: [
                {
                    model: db.VitalSigns,
                    as: 'signosVitales'
                },
                {
                    model: db.Prescripcion,
                    as: 'prescripciones'
                },
                {
                    model: db.User,
                    as: 'medico',
                    attributes: ['id', 'username', 'especialidad']
                },
                {
                    model: db.ExamenFisico,
                    as: 'examenFisico',
                    required: false, // LEFT JOIN para incluir evoluciones sin examen físico
                    include: [
                        {
                            model: db.ExamenFisicoItem,
                            as: 'items',
                            required: false,
                            include: [
                                {
                                    model: db.BodyPart,
                                    as: 'bodyPart',
                                    required: false
                                },
                                {
                                    model: db.ExamenFisicoItemLesion,
                                    as: 'lesiones',
                                    required: false,
                                    include: [
                                        {
                                            model: db.LesionCatalog,
                                            as: 'lesion',
                                            required: false
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['fecha', 'DESC']]
        });

        // Obtener datos del paciente
        const paciente = await db.Patient.findByPk(pacienteId, {
            attributes: ['id', 'primer_nombre', 'apellido_paterno', 'cedula']
        });

        if (!paciente) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }

        console.log('Evoluciones encontradas:', evoluciones.length);
        console.log('Primera evolución:', evoluciones[0] ? JSON.stringify(evoluciones[0], null, 2) : 'No hay evoluciones');
        
        // Verificar si las asociaciones están funcionando
        console.log('Verificando asociaciones...');
        console.log('Modelos disponibles:', Object.keys(db));
        console.log('ExamenFisico model:', db.ExamenFisico ? 'OK' : 'NO ENCONTRADO');
        console.log('Evolucion associations:', db.Evolucion.associations ? Object.keys(db.Evolucion.associations) : 'NO ENCONTRADAS');
        
        // Verificar si hay examen físico en las evoluciones
        for (let i = 0; i < evoluciones.length; i++) {
            const evol = evoluciones[i];
            console.log(`Evolución ${evol.id}: examenFisico =`, evol.examenFisico);
            console.log(`Evolución ${evol.id}: examenFisicoId =`, evol.examenFisicoId);
        }
        
        // Verificar si hay examen físico en la base de datos para este paciente
        const examenesFisicos = await db.ExamenFisico.findAll({
            where: {
                evolucionId: evoluciones.map(e => e.id)
            }
        });
        console.log('Exámenes físicos encontrados en BD:', examenesFisicos.length);
        console.log('Exámenes físicos:', examenesFisicos.map(e => ({ id: e.id, evolucionId: e.evolucionId })));
        
        
        res.json({
            success: true,
            data: {
                paciente,
                evoluciones
            }
        });
    } catch (error) {
        console.error('Error al obtener evoluciones del paciente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las evoluciones del paciente',
            error: error.message
        });
    }
};
exports.delete = async (req, res) => {
    try {
        const evolucion = await db.Evolucion.findOne({
            where: {
                id: req.params.id,
                medicoId: req.user.id
            }
        });

        if (!evolucion) {
            return res.status(404).json({
                success: false,
                message: 'Evolución no encontrada o no tiene permisos para eliminarla'
            });
        }

        await evolucion.destroy();

        res.json({
            success: true,
            message: 'Evolución eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar evolución:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la evolución',
            error: error.message
        });
    }
};


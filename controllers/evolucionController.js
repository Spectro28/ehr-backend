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
            const diagnosticos = req.body.diagnosticos.map(diagnostico => ({
                evolucionId: nuevaEvolucion.id,
                cieId: diagnostico.cieId,
                tipo: diagnostico.tipo
            }));

            if (diagnosticos.length > 0) {
                await db.Diagnostico.bulkCreate(diagnosticos);
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
                        'cedula',
                        'especialidad'
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
                cedula: evolucionData.medico.cedula,
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
        const medicoId = req.params.medicoId;
        
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
        const medicoId = req.params.medicoId;
        
        // Obtener citas del médico
        const citasDelMedico = await db.Cita.findAll({
            where: {
                doctorId: medicoId,
                estado: ['pendiente', 'atendido']
            }
        });

        const pacienteIds = [...new Set(citasDelMedico.map(cita => cita.pacienteId))];

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
                    model: db.User,
                    as: 'medico',
                    attributes: ['id', 'username', 'especialidad']
                }
            ],
            order: [['fecha', 'DESC']]
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
        const evolucion = await db.Evolucion.findOne({
            where: {
                id: req.params.id,
                medicoId: req.user.id
            }
        });

        if (!evolucion) {
            return res.status(404).json({
                success: false,
                message: 'Evolución no encontrada o no tiene permisos para editarla'
            });
        }

        // Actualizar datos básicos de la evolución
        await evolucion.update({
            motivo_consulta: req.body.motivo_consulta,
            enfermedad_actual: req.body.enfermedad_actual,
            antecedentes_personales: req.body.antecedentes_personales,
            antecedentes_familiares: req.body.antecedentes_familiares
        });

        // Actualizar diagnósticos
        if (req.body.diagnosticos && Array.isArray(req.body.diagnosticos)) {
            // Eliminar diagnósticos existentes
            await db.Diagnostico.destroy({
                where: { evolucionId: evolucion.id }
            });

            // Crear nuevos diagnósticos
            const diagnosticos = req.body.diagnosticos.map(diagnostico => ({
                evolucionId: evolucion.id,
                cieId: diagnostico.cieId,
                tipo: diagnostico.tipo
            }));

            if (diagnosticos.length > 0) {
                await db.Diagnostico.bulkCreate(diagnosticos);
            }
        }

        // Actualizar prescripciones
        if (req.body.medicamentos && Array.isArray(req.body.medicamentos)) {
            // Eliminar prescripciones existentes
            await db.Prescripcion.destroy({
                where: { evolucionId: evolucion.id }
            });

            // Crear nuevas prescripciones
            const prescripciones = req.body.medicamentos.map(medicamento => ({
                ...medicamento,
                evolucionId: evolucion.id,
                medicoId: req.user.id
            }));

            if (prescripciones.length > 0) {
                await db.Prescripcion.bulkCreate(prescripciones);
            }
        }

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
                    as: 'prescripciones'
                }
            ]
        });

        res.json({
            success: true,
            message: 'Evolución actualizada correctamente',
            data: evolucionActualizada
        });
    } catch (error) {
        console.error('Error al actualizar evolución:', error);
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la evolución',
            error: error.message
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


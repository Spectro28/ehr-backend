const db = require('../models');

async function initializeDentalData() {
    try {
        // Crear diagnósticos
        const diagnosticos = [
            { nombre: 'Caries dental', codigo: 'C001' },
            { nombre: 'Gingivitis', codigo: 'G001' },
            { nombre: 'Periodontitis', codigo: 'P001' },
            { nombre: 'Pulpitis', codigo: 'PU001' },
            { nombre: 'Absceso dental', codigo: 'A001' },
            { nombre: 'Fractura dental', codigo: 'F001' },
            { nombre: 'Desgaste dental', codigo: 'D001' },
            { nombre: 'Sensibilidad dental', codigo: 'S001' },
            { nombre: 'Malposición dental', codigo: 'M001' },
            { nombre: 'Placa bacteriana', codigo: 'PB001' }
        ];

        // Crear procedimientos
        const procedimientos = [
            { 
                nombre: 'Obturación',
                descripcion: 'Restauración dental con material de relleno',
                codigo: 'OB001'
            },
            { 
                nombre: 'Extracción',
                descripcion: 'Remoción de pieza dental',
                codigo: 'EX001'
            },
            { 
                nombre: 'Limpieza dental',
                descripcion: 'Profilaxis y remoción de placa bacteriana',
                codigo: 'LD001'
            },
            { 
                nombre: 'Endodoncia',
                descripcion: 'Tratamiento de conductos',
                codigo: 'EN001'
            },
            { 
                nombre: 'Corona dental',
                descripcion: 'Restauración con corona artificial',
                codigo: 'CD001'
            },
            { 
                nombre: 'Sellantes',
                descripcion: 'Aplicación de selladores dentales',
                codigo: 'SE001'
            },
            { 
                nombre: 'Fluorización',
                descripcion: 'Aplicación tópica de flúor',
                codigo: 'FL001'
            },
            { 
                nombre: 'Curetaje',
                descripcion: 'Limpieza profunda de bolsas periodontales',
                codigo: 'CU001'
            },
            { 
                nombre: 'Blanqueamiento',
                descripcion: 'Procedimiento estético de blanqueamiento dental',
                codigo: 'BL001'
            },
            { 
                nombre: 'Ortodoncia',
                descripcion: 'Tratamiento de alineación dental',
                codigo: 'OR001'
            }
        ];

        // Insertar diagnósticos
        await db.DiagnosticoOdontograma.bulkCreate(diagnosticos, {
            ignoreDuplicates: true
        });
        console.log('✅ Diagnósticos odontológicos creados');

        // Insertar procedimientos
        await db.Procedimiento.bulkCreate(procedimientos, {
            ignoreDuplicates: true
        });
        console.log('✅ Procedimientos odontológicos creados');

        console.log('✅ Datos odontológicos inicializados correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar datos odontológicos:', error);
    } finally {
        process.exit();
    }
}

// Conectar a la base de datos y ejecutar la inicialización
db.sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a la base de datos establecida');
        initializeDentalData();
    })
    .catch(err => {
        console.error('❌ Error al conectar con la base de datos:', err);
        process.exit(1);
    });

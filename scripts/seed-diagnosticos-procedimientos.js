const { Diagnostico, Procedimiento } = require('../models');

const diagnosticosEjemplo = [
    { nombre: 'Caries', codigo: 'K02', descripcion: 'Caries dental' },
    { nombre: 'Gingivitis', codigo: 'K05.0', descripcion: 'Gingivitis aguda' },
    { nombre: 'Periodontitis', codigo: 'K05.2', descripcion: 'Periodontitis crónica' },
    { nombre: 'Absceso dental', codigo: 'K04.7', descripcion: 'Absceso periapical' },
    { nombre: 'Pulpa necrótica', codigo: 'K04.1', descripcion: 'Necrosis de la pulpa' },
    { nombre: 'Fractura dental', codigo: 'S02.5', descripcion: 'Fractura de diente' },
    { nombre: 'Recesión gingival', codigo: 'K06.0', descripcion: 'Recesión gingival' },
    { nombre: 'Bruxismo', codigo: 'F45.8', descripcion: 'Bruxismo' }
];

const procedimientosEjemplo = [
    { nombre: 'Obturación', codigo: 'D2140', descripcion: 'Obturación de amalgama' },
    { nombre: 'Endodoncia', codigo: 'D3310', descripcion: 'Tratamiento de conducto' },
    { nombre: 'Extracción', codigo: 'D7140', descripcion: 'Extracción dental' },
    { nombre: 'Limpieza dental', codigo: 'D1110', descripcion: 'Profilaxis dental' },
    { nombre: 'Corona', codigo: 'D2740', descripcion: 'Corona de porcelana' },
    { nombre: 'Puente', codigo: 'D6240', descripcion: 'Puente fijo' },
    { nombre: 'Implante', codigo: 'D6010', descripcion: 'Implante dental' },
    { nombre: 'Ortodoncia', codigo: 'D8080', descripcion: 'Tratamiento ortodóncico' },
    { nombre: 'Cirugía periodontal', codigo: 'D4263', descripcion: 'Cirugía de colgajo' },
    { nombre: 'Blanqueamiento', codigo: 'D9971', descripcion: 'Blanqueamiento dental' }
];

async function seedDiagnosticosYProcedimientos() {
    try {
        console.log('Iniciando seed de diagnósticos y procedimientos...');
        
        // Verificar si ya existen datos
        const countDiagnosticos = await Diagnostico.count();
        const countProcedimientos = await Procedimiento.count();
        
        if (countDiagnosticos === 0) {
            console.log('Insertando diagnósticos...');
            await Diagnostico.bulkCreate(diagnosticosEjemplo);
            console.log(`${diagnosticosEjemplo.length} diagnósticos insertados`);
        } else {
            console.log(`Ya existen ${countDiagnosticos} diagnósticos en la base de datos`);
        }
        
        if (countProcedimientos === 0) {
            console.log('Insertando procedimientos...');
            await Procedimiento.bulkCreate(procedimientosEjemplo);
            console.log(`${procedimientosEjemplo.length} procedimientos insertados`);
        } else {
            console.log(`Ya existen ${countProcedimientos} procedimientos en la base de datos`);
        }
        
        console.log('Seed completado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('Error durante el seed:', error);
        process.exit(1);
    }
}

seedDiagnosticosYProcedimientos();

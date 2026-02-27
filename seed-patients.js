/**
 * SCRIPT DE PRUEBA DE RENDIMIENTO - GENERADOR DE PACIENTES
 * 
 * Uso:
 *   node seed-patients.js          → genera 1,000 pacientes (default)
 *   node seed-patients.js 5000     → genera 5,000 pacientes
 *   node seed-patients.js 10000    → genera 10,000 pacientes
 * 
 * Para eliminar los datos de prueba después:
 *   node seed-patients.js --clean
 */

const { Sequelize, DataTypes, Op } = require('sequelize');

// ─── CONFIGURACIÓN DE BASE DE DATOS ────────────────────────────────────────
// Ajusta estos valores a tu configuración
const sequelize = new Sequelize({
  dialect: 'postgres',       // Cambia a 'mysql' si usas MySQL
  host: 'localhost',
  port: 5432,
  database: 'ehr_system',  // ← Cambia esto
  username: 'postgres',         // ← Cambia esto
  password: '12345',        // ← Cambia esto
  logging: false                  // Sin logs para mayor velocidad
});

// ─── DATOS FICTICIOS ────────────────────────────────────────────────────────
const primerNombres = [
  'Carlos', 'María', 'José', 'Ana', 'Luis', 'Rosa', 'Jorge', 'Carmen',
  'Pedro', 'Isabel', 'Miguel', 'Patricia', 'Andrés', 'Lucía', 'Fernando',
  'Gabriela', 'Roberto', 'Verónica', 'Eduardo', 'Daniela', 'Sebastián',
  'Valentina', 'Diego', 'Camila', 'Alejandro', 'Natalia', 'Cristian',
  'Paola', 'Mauricio', 'Estefanía'
];

const segundoNombres = [
  'Alejandro', 'Elizabeth', 'Antonio', 'Beatriz', 'Enrique', 'Fernanda',
  'Ramón', 'Sofía', 'Javier', 'Andrea', 'Hernán', 'Karina', 'Fabián',
  'Lorena', 'Gonzalo', 'Melissa', 'Rodrigo', 'Vanessa', 'Nicolás', 'Tatiana',
  '', '', '', '' // Algunos sin segundo nombre
];

const apellidosPaternos = [
  'García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Torres',
  'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Cruz', 'Morales', 'Ortiz',
  'Herrera', 'Medina', 'Castro', 'Vargas', 'Romero', 'Jiménez', 'Álvarez',
  'Mora', 'Muñoz', 'Vega', 'Mendoza', 'Ramos', 'Ruiz', 'Guerrero', 'Silva'
];

const apellidosMaternos = [
  'Salinas', 'Paredes', 'Escobar', 'Benítez', 'Pacheco', 'Cárdenas', 'Ríos',
  'Aguilar', 'Fuentes', 'Gutiérrez', 'Sánchez', 'Ramírez', 'Espinoza',
  'Delgado', 'Ponce', 'Suárez', 'Cabrera', 'Rojas', 'Ibarra', 'Lara',
  'Navarro', 'Cortés', 'Molina', 'Castillo', 'León', 'Andrade', 'Vásquez',
  'Palacios', 'Alvarado', 'Carrillo'
];

const ciudades = [
  'Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Riobamba', 'Loja', 'Manta',
  'Portoviejo', 'Machala', 'Esmeraldas', 'Santo Domingo', 'Ibarra'
];

const calles = [
  'Av. 6 de Diciembre', 'Av. Amazonas', 'Calle 10 de Agosto', 'Av. Colón',
  'Calle Sucre', 'Av. República', 'Calle Bolívar', 'Av. Patria',
  'Calle García Moreno', 'Av. Eloy Alfaro', 'Calle Olmedo', 'Av. Shyris'
];

const sangres = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const generos = ['masculino', 'femenino'];
const estadosCiviles = ['soltero', 'casado', 'divorciado', 'viudo', 'union_libre'];
const tiposIdentificacion = ['cedula', 'pasaporte', 'ruc'];
const empresas = ['CARDIOVASC', 'INVITROMED', 'Centro de Especialidades Médicas Prado Gómez', 'COIDHEX'];
const ocupaciones = [
  'Ingeniero', 'Médico', 'Abogado', 'Contador', 'Profesor', 'Comerciante',
  'Agricultor', 'Estudiante', 'Enfermero', 'Arquitecto', 'Economista', 'Obrero'
];

// ─── FUNCIONES UTILITARIAS ──────────────────────────────────────────────────
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateCedula = (index) => {
  // Genera cédulas únicas ficticias con prefijo 99 para identificarlas fácilmente
  const numero = String(index).padStart(8, '0');
  return `99${numero}`.substring(0, 10);
};

const generateFechaNacimiento = () => {
  const year = randomInt(1940, 2005);
  const month = String(randomInt(1, 12)).padStart(2, '0');
  const day = String(randomInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateTelefono = () => {
  return `09${randomInt(10000000, 99999999)}`;
};

const generateEmail = (nombre, apellido, index) => {
  const dominios = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
  const nombre_clean = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const apellido_clean = apellido.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return `${nombre_clean}.${apellido_clean}${index}@${random(dominios)}`;
};

// ─── GENERADOR DE PACIENTE ──────────────────────────────────────────────────
const generatePatient = (index) => {
  const primer_nombre = random(primerNombres);
  const apellido_paterno = random(apellidosPaternos);

  return {
    // ── OBLIGATORIOS ──
    apellido_paterno,
    apellido_materno: random(apellidosMaternos),
    primer_nombre,
    segundo_nombre: random(segundoNombres),
    cedula: generateCedula(index),
    telefono: generateTelefono(),
    fecha_nacimiento: generateFechaNacimiento(),
    lugar_nacimiento: random(ciudades),
    nacionalidad: 'Ecuatoriana',
    sexo: random(['H', 'M']),

    // ── OPCIONALES ──
    direccion: `${random(calles)} N${randomInt(1, 99)}-${randomInt(10, 99)}`,
    barrio: `Barrio ${random(apellidosPaternos)}`,
    canton: random(ciudades),
    provincia: 'Pichincha',
    parroquia: 'Iñaquito',
    estado_civil: random(estadosCiviles),
    instruccion: random(['primaria', 'secundaria', 'superior', 'ninguna']),
    ocupacion: random(ocupaciones),
    empresa_trabajo: random(empresas),
    tipo_seguro: random(['IESS', 'Privado', 'Ninguno']),
    grupo_cultural: random(['Mestizo', 'Indígena', 'Afroecuatoriano', 'Montubio', 'Blanco']),
    contacto_emergencia: `${random(primerNombres)} ${random(apellidosPaternos)}`,
    parentesco_emergencia: random(['Cónyuge', 'Hijo/a', 'Padre', 'Madre', 'Hermano/a']),
    direccion_emergencia: `${random(calles)} N${randomInt(1, 99)}-${randomInt(10, 99)}`,
    telefono_emergencia: generateTelefono(),
    grupo_cultural: 'REGISTRO_DE_PRUEBA',
  };
};

// ─── INSERCIÓN EN LOTES ─────────────────────────────────────────────────────
const insertBatch = async (Patient, patients) => {
  await Patient.bulkCreate(patients, {
    validate: false,      // Saltar validaciones para mayor velocidad
    ignoreDuplicates: true
  });
};

// ─── FUNCIÓN PRINCIPAL ──────────────────────────────────────────────────────
const main = async () => {
  const args = process.argv.slice(2);

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa\n');

    // Definir modelo mínimo para la inserción
  const Patient = sequelize.define('Patient', {
  apellido_paterno: DataTypes.STRING,
  apellido_materno: DataTypes.STRING,
  primer_nombre: DataTypes.STRING,
  segundo_nombre: DataTypes.STRING,
  cedula: DataTypes.STRING,
  direccion: DataTypes.STRING,
  barrio: DataTypes.STRING,
  parroquia: DataTypes.STRING,
  canton: DataTypes.STRING,
  provincia: DataTypes.STRING,
  telefono: DataTypes.STRING,
  fecha_nacimiento: DataTypes.DATE,
  lugar_nacimiento: DataTypes.STRING,
  nacionalidad: DataTypes.STRING,
  grupo_cultural: DataTypes.STRING,
  estado_civil: DataTypes.STRING,
  sexo: DataTypes.STRING,
  instruccion: DataTypes.STRING,
  ocupacion: DataTypes.STRING,
  empresa_trabajo: DataTypes.STRING,
  tipo_seguro: DataTypes.STRING,
  contacto_emergencia: DataTypes.STRING,
  parentesco_emergencia: DataTypes.STRING,
  direccion_emergencia: DataTypes.STRING,
  telefono_emergencia: DataTypes.STRING,

}, { 
  tableName: 'Patients',
  timestamps: true,
  underscored: true
});

    // ── MODO LIMPIEZA ──
    if (args[0] === '--clean') {
      console.log('🧹 Eliminando registros de prueba...');
     const deleted = await Patient.destroy({
  where: { grupo_cultural: 'REGISTRO_DE_PRUEBA' }
});
      console.log(`✅ Se eliminaron ${deleted} registros de prueba`);
      process.exit(0);
    }

    // ── MODO INSERCIÓN ──
    const TOTAL = parseInt(args[0]) || 1000;
    const BATCH_SIZE = 500; // Insertar de 500 en 500 para no sobrecargar
    const totalBatches = Math.ceil(TOTAL / BATCH_SIZE);

    console.log(`🚀 Iniciando generación de ${TOTAL} pacientes de prueba`);
    console.log(`📦 Se insertarán en ${totalBatches} lotes de ${BATCH_SIZE}\n`);

    const startTime = Date.now();
    let inserted = 0;

    for (let batch = 0; batch < totalBatches; batch++) {
      const batchStart = batch * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL);
      const patients = [];

      for (let i = batchStart; i < batchEnd; i++) {
        patients.push(generatePatient(i));
      }

      await insertBatch(Patient, patients);
      inserted += patients.length;

      const progress = Math.round((inserted / TOTAL) * 100);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(`\r⏳ Progreso: ${inserted}/${TOTAL} (${progress}%) - ${elapsed}s`);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n\n✅ ¡Listo! Se insertaron ${inserted} pacientes en ${totalTime} segundos`);
    console.log(`📊 Velocidad: ${Math.round(inserted / totalTime)} pacientes/segundo`);
    console.log(`\n💡 Para eliminar estos datos de prueba ejecuta:`);
    console.log(`   node seed-patients.js --clean\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

main();

const db = require('./models');
const { Patient, Consultorio, User, HorarioConsultorio } = db;

async function testConnection() {
  try {
    // Verificar conexión
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Verificar si hay pacientes
    const patientCount = await Patient.count();
    console.log(`📊 Número de pacientes en la base de datos: ${patientCount}`);

    // Verificar consultorios
    const consultorios = await Consultorio.findAll({
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'username', 'especialidad']
        },
        {
          model: HorarioConsultorio,
          as: 'horarios',
          attributes: ['id', 'dia', 'fecha', 'horaInicio', 'horaFin']
        }
      ]
    });

    console.log(`🏥 Número de consultorios en la base de datos: ${consultorios.length}`);
    
    if (consultorios.length > 0) {
      console.log('📋 Consultorios disponibles:');
      consultorios.forEach(consultorio => {
        console.log(`  - Consultorio ${consultorio.numero} (ID: ${consultorio.id})`);
        console.log(`    Doctor: ${consultorio.doctor?.username || 'Sin doctor'} (ID: ${consultorio.doctorId})`);
        console.log(`    Horarios: ${consultorio.horarios?.length || 0} configurados`);
      });
    } else {
      console.log('⚠️ No hay consultorios en la base de datos');
    }

    // Verificar doctores
    const doctores = await User.findAll({
      where: { active: true },
      attributes: ['id', 'username', 'especialidad']
    });

    console.log(`👨‍⚕️ Número de doctores activos: ${doctores.length}`);
    if (doctores.length > 0) {
      console.log('📋 Doctores disponibles:');
      doctores.forEach(doctor => {
        console.log(`  - ${doctor.username} (ID: ${doctor.id}) - ${doctor.especialidad}`);
      });
    }

    if (patientCount === 0) {
      console.log('➕ No hay pacientes, agregando algunos de prueba...');
      
      // Agregar pacientes de prueba
      const testPatients = [
        {
          primer_nombre: 'Juan',
          apellido_paterno: 'Pérez',
          apellido_materno: 'García',
          cedula: '1750106054',
          fecha_nacimiento: new Date('1990-05-15'),
          lugar_nacimiento: 'Quito',
          nacionalidad: 'Ecuatoriana',
          sexo: 'H',
          empresa: 'CARDIOVASC',
          direccion: 'Av. Amazonas 123',
          telefono: '0987654321'
        },
        {
          primer_nombre: 'María',
          apellido_paterno: 'González',
          apellido_materno: 'López',
          cedula: '1750106055',
          fecha_nacimiento: new Date('1985-08-20'),
          lugar_nacimiento: 'Guayaquil',
          nacionalidad: 'Ecuatoriana',
          sexo: 'M',
          empresa: 'INVITROMED',
          direccion: 'Calle 10 de Agosto 456',
          telefono: '0987654322'
        },
        {
          primer_nombre: 'Carlos',
          apellido_paterno: 'Rodríguez',
          apellido_materno: 'Martínez',
          cedula: '1750106056',
          fecha_nacimiento: new Date('1992-12-10'),
          lugar_nacimiento: 'Cuenca',
          nacionalidad: 'Ecuatoriana',
          sexo: 'H',
          empresa: 'Centro de Especialidades Médicas Prado Gómez',
          direccion: 'Av. 6 de Diciembre 789',
          telefono: '0987654323'
        }
      ];

      for (const patientData of testPatients) {
        try {
          const patient = await Patient.create(patientData);
          console.log(`✅ Paciente creado: ${patient.primer_nombre} ${patient.apellido_paterno}`);
        } catch (error) {
          console.error(`❌ Error al crear paciente ${patientData.cedula}:`, error.message);
        }
      }

      console.log('✅ Pacientes de prueba agregados correctamente.');
    } else {
      console.log('📋 Listando los primeros 5 pacientes:');
      const patients = await Patient.findAll({
        limit: 5,
        attributes: ['id', 'primer_nombre', 'apellido_paterno', 'cedula']
      });
      
      patients.forEach(patient => {
        console.log(`  - ${patient.primer_nombre} ${patient.apellido_paterno} (${patient.cedula})`);
      });
    }

    await db.sequelize.close();
    console.log('🔌 Conexión cerrada.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testConnection();

    
    
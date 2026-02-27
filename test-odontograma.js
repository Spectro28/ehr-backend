const { sequelize } = require('./models');
const { Odontograma, Patient, User } = require('./models');

async function testCreate() {
  try {
    console.log('Probando creación de odontograma...');
    
    // Verificar que el paciente existe
    const paciente = await Patient.findByPk(36);
    console.log('Paciente encontrado:', !!paciente);
    
    if (paciente) {
      // Verificar que el usuario existe
      const user = await User.findByPk(1);
      console.log('Usuario encontrado:', !!user);
      
      if (user) {
        // Intentar crear un odontograma simple
        const odontograma = await Odontograma.create({
          pacienteId: 36,
          evolucionId: null,
          dentistaId: 1,
          observaciones: 'Test',
          fecha: new Date()
        });
        
        console.log('Odontograma creado exitosamente:', odontograma.id);
        
        // Eliminar el odontograma de prueba
        await odontograma.destroy();
        console.log('Odontograma de prueba eliminado');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error al crear odontograma:', error);
    process.exit(1);
  }
}

testCreate();

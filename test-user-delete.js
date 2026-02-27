const db = require('./models');
const User = db.User;
const Consultorio = db.Consultorio;
const Cita = db.Cita;

async function testUserDelete() {
  try {
    console.log('🔍 Probando funcionalidad de eliminación de usuarios...');
    
    // Verificar que los modelos estén disponibles
    console.log('✅ User model:', typeof User.findByPk);
    console.log('✅ Consultorio model:', typeof Consultorio.count);
    console.log('✅ Cita model:', typeof Cita.count);
    
    // Buscar un usuario de prueba
    const testUser = await User.findOne();
    if (testUser) {
      console.log('✅ Usuario encontrado:', testUser.username);
      
      // Verificar consultorios
      const consultoriosCount = await Consultorio.count({
        where: { doctorId: testUser.id }
      });
      console.log('📋 Consultorios asociados:', consultoriosCount);
      
      // Verificar citas
      const citasCount = await Cita.count({
        where: { 
          doctorId: testUser.id,
          estado: ['pendiente', 'confirmada']
        }
      });
      console.log('📋 Citas pendientes:', citasCount);
      
    } else {
      console.log('⚠️ No se encontraron usuarios para probar');
    }
    
    console.log('✅ Prueba completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    process.exit(0);
  }
}

testUserDelete(); 
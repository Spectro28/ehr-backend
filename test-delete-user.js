const db = require('./models');
const User = db.User;
const DeletedUser = db.DeletedUser;

async function testDeleteUser() {
  try {
    console.log('🔍 Probando funcionalidad de eliminación de usuarios...');
    
    // Buscar un usuario de prueba
    const testUser = await User.findOne({
      include: [
        {
          model: db.Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });
    
    if (testUser) {
      console.log('✅ Usuario encontrado:', testUser.username);
      console.log('📋 Roles:', testUser.roles ? testUser.roles.map(r => r.nombre) : 'Sin roles');
      
      // Simular la eliminación (sin ejecutar realmente)
      const userRole = testUser.roles && testUser.roles.length > 0 ? testUser.roles[0].nombre : 'sin_rol';
      
      console.log('📋 Datos que se guardarían en DeletedUsers:');
      console.log('- original_user_id:', testUser.id);
      console.log('- username:', testUser.username);
      console.log('- role:', userRole);
      console.log('- especialidad:', testUser.especialidad);
      console.log('- empresa:', testUser.empresa);
      console.log('- email:', testUser.email);
      console.log('- tipo_identificacion:', testUser.tipo_identificacion);
      console.log('- identificacion:', testUser.identificacion);
      
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

testDeleteUser(); 
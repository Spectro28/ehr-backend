const db = require('./models');
const User = db.User;
const DeletedUser = db.DeletedUser;

async function testFullDelete() {
  try {
    console.log('🔍 Probando eliminación completa de usuario...');
    
    // Buscar un usuario de prueba (que no sea admin)
    const testUser = await User.findOne({
      where: { username: { [db.Sequelize.Op.ne]: 'admin' } },
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
      
      // Obtener el primer rol del usuario
      const userRole = testUser.roles && testUser.roles.length > 0 ? testUser.roles[0].nombre : 'sin_rol';
      
      console.log('📋 Guardando en DeletedUsers...');
      
      // Guardar en DeletedUsers
      await DeletedUser.create({
        original_user_id: testUser.id,
        username: testUser.username,
        role: userRole,
        especialidad: testUser.especialidad,
        empresa: testUser.empresa,
        email: testUser.email,
        tipo_identificacion: testUser.tipo_identificacion,
        identificacion: testUser.identificacion,
        deleted_at: new Date(),
        deleted_by: 1, // ID del admin
        reason: 'Eliminado por administrador'
      });
      
      console.log('✅ Usuario guardado en DeletedUsers');
      
      // Eliminar relaciones de roles
      if (testUser.roles && testUser.roles.length > 0) {
        await testUser.removeRoles(testUser.roles);
        console.log('✅ Relaciones de roles eliminadas');
      }
      
      // Eliminar el usuario
      await testUser.destroy();
      console.log('✅ Usuario eliminado de Users');
      
      console.log('🎉 Eliminación completada exitosamente');
      
    } else {
      console.log('⚠️ No se encontraron usuarios para eliminar (excluyendo admin)');
    }
    
  } catch (error) {
    console.error('❌ Error en la eliminación:', error.message);
  } finally {
    process.exit(0);
  }
}

testFullDelete(); 
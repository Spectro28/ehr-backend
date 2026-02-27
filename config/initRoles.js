const db = require('../models');

async function initRoles() {
    try {
        // Lista de roles que deben existir
        const requiredRoles = ['doctor', 'secretaria', 'enfermera', 'dentista', 'administrador'];
        
        // Verificar y crear roles si no existen
        for (const role of requiredRoles) {
            const existingRole = await db.Role.findOne({
                where: { nombre: role }
            });

            if (!existingRole) {
                await db.Role.create({
                    nombre: role
                });
                console.log(`Role ${role} creado`);
            } else {
                console.log(`Role ${role} ya existe`);
            }
        }
    } catch (error) {
        console.error('Error al inicializar roles:', error);
        throw error;
    }
}

module.exports = initRoles;

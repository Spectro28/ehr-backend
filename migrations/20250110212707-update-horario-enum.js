'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 1. Crear nuevo tipo enum
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_HorarioConsultorios_dia_new" AS ENUM (
          'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'
        );
      `);

      // 2. Actualizar la columna para usar el nuevo tipo
      await queryInterface.sequelize.query(`
        ALTER TABLE "HorarioConsultorios" 
        ALTER COLUMN "dia" TYPE "enum_HorarioConsultorios_dia_new" 
        USING CASE 
          WHEN dia = 'LUNES' THEN 'Lunes'::text
          WHEN dia = 'MARTES' THEN 'Martes'::text
          WHEN dia = 'MIERCOLES' THEN 'Miercoles'::text
          WHEN dia = 'JUEVES' THEN 'Jueves'::text
          WHEN dia = 'VIERNES' THEN 'Viernes'::text
        END::"enum_HorarioConsultorios_dia_new";
      `);

      // 3. Eliminar el tipo enum antiguo
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_HorarioConsultorios_dia";
      `);

      // 4. Renombrar el nuevo tipo enum
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_HorarioConsultorios_dia_new" 
        RENAME TO "enum_HorarioConsultorios_dia";
      `);

    } catch (error) {
      console.error('Error en la migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // 1. Crear el tipo enum antiguo
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_HorarioConsultorios_dia_old" AS ENUM (
          'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'
        );
      `);

      // 2. Actualizar la columna para usar el tipo antiguo
      await queryInterface.sequelize.query(`
        ALTER TABLE "HorarioConsultorios" 
        ALTER COLUMN "dia" TYPE "enum_HorarioConsultorios_dia_old" 
        USING CASE 
          WHEN dia = 'Lunes' THEN 'LUNES'::text
          WHEN dia = 'Martes' THEN 'MARTES'::text
          WHEN dia = 'Miercoles' THEN 'MIERCOLES'::text
          WHEN dia = 'Jueves' THEN 'JUEVES'::text
          WHEN dia = 'Viernes' THEN 'VIERNES'::text
        END::"enum_HorarioConsultorios_dia_old";
      `);

      // 3. Eliminar el tipo enum nuevo
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_HorarioConsultorios_dia";
      `);

      // 4. Renombrar el tipo enum antiguo
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_HorarioConsultorios_dia_old" 
        RENAME TO "enum_HorarioConsultorios_dia";
      `);

    } catch (error) {
      console.error('Error en la migración down:', error);
      throw error;
    }
  }
};
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Primero creamos los tipos ENUM si no existen
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Patients_estado_civil" AS ENUM ('S', 'C', 'D', 'V', 'UL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Patients_sexo" AS ENUM ('H', 'M');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Luego creamos la tabla
    await queryInterface.createTable('Patients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      apellido_paterno: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apellido_materno: {
        type: Sequelize.STRING,
        allowNull: true
      },
      primer_nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      segundo_nombre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cedula: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      direccion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      barrio: {
        type: Sequelize.STRING,
        allowNull: true
      },
      parroquia: {
        type: Sequelize.STRING,
        allowNull: true
      },
      canton: {
        type: Sequelize.STRING,
        allowNull: false
      },
      provincia: {
        type: Sequelize.STRING,
        allowNull: false
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fecha_nacimiento: {
        type: Sequelize.DATE,
        allowNull: false
      },
      lugar_nacimiento: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nacionalidad: {
        type: Sequelize.STRING,
        allowNull: false
      },
      grupo_cultural: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estado_civil: {
        type: 'enum_Patients_estado_civil',
        allowNull: false
      },
      sexo: {
        type: 'enum_Patients_sexo',
        allowNull: false
      },
      instruccion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ocupacion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      empresa_trabajo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tipo_seguro: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contacto_emergencia: {
        type: Sequelize.STRING,
        allowNull: true
      },
      parentesco_emergencia: {
        type: Sequelize.STRING,
        allowNull: true
      },
      direccion_emergencia: {
        type: Sequelize.STRING,
        allowNull: true
      },
      telefono_emergencia: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminamos la tabla
    await queryInterface.dropTable('Patients');
    // Eliminamos los tipos ENUM
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Patients_estado_civil";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Patients_sexo";');
  }
};
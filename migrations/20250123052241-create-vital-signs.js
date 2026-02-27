'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VitalSigns', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      fecha_medicion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      temperatura: {
        type: Sequelize.DECIMAL(4,1),
        allowNull: false
      },
      presion_arterial: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pulso: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      frecuencia_respiratoria: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      peso: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false
      },
      talla: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      imc: {
        type: Sequelize.DECIMAL(4,2),
        allowNull: true
      },
      citaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Citas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pacienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      enfermeroId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Añadir índices para mejorar el rendimiento
    await queryInterface.addIndex('VitalSigns', ['pacienteId']);
    await queryInterface.addIndex('VitalSigns', ['citaId']);
    await queryInterface.addIndex('VitalSigns', ['enfermeroId']);
    await queryInterface.addIndex('VitalSigns', ['fecha_medicion']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VitalSigns');
  }
};
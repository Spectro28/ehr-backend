'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Evoluciones', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      motivo_consulta: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      enfermedad_actual: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      antecedentes_personales: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      antecedentes_familiares: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({
          cardiopatia: false,
          diabetes: false,
          enfermedad_cardiovascular: false,
          hipertension: false,
          cancer: false,
          tuberculosis: false,
          enfermedad_mental: false,
          enfermedad_infecciosa: false,
          otro_antecedente: '',
          sin_antecedentes: false
        })
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
      medicoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      signosVitalesId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'VitalSigns',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Evoluciones');
  }
};
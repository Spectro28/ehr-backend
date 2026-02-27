'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('HorarioConsultorios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dia: {
        type: Sequelize.ENUM('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'),
        allowNull: false
      },
      horaInicio: {
        type: Sequelize.TIME,
        allowNull: false
      },
      horaFin: {
        type: Sequelize.TIME,
        allowNull: false
      },
      consultorioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Consultorios',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('HorarioConsultorios');
  }
};

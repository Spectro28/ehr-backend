'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Odontogramas', 'tipo', {
      type: Sequelize.ENUM('adulto', 'infantil'),
      allowNull: false,
      defaultValue: 'adulto'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Odontogramas', 'tipo');
  }
};
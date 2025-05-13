'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('HorariosConsultorio', 'fecha', {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_DATE') // valor por defecto temporal
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('HorariosConsultorio', 'fecha');
  }
};
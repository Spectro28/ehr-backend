'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const columns = [
      'direccion', 'canton', 'provincia', 'estado_civil'
      // Agrega aquí otros campos que estaban como allowNull: false
    ];

    for (const column of columns) {
      await queryInterface.changeColumn('Patients', column, {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const columns = [
      'direccion', 'canton', 'provincia', 'estado_civil'
      // Los mismos campos que en up
    ];

    for (const column of columns) {
      await queryInterface.changeColumn('Patients', column, {
        type: Sequelize.STRING,
        allowNull: false
      });
    }
  }
};
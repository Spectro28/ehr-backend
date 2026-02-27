'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar si la columna existe
    const tableInfo = await queryInterface.describeTable('Users');
    if (!tableInfo.especialidad) {
      await queryInterface.addColumn('Users', 'especialidad', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'role'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Users');
    if (tableInfo.especialidad) {
      await queryInterface.removeColumn('Users', 'especialidad');
    }
  }
};
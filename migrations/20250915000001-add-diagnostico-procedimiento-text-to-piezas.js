'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('PiezasOdontograma', 'diagnostico_texto', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'procedimientoId'
    });

    await queryInterface.addColumn('PiezasOdontograma', 'procedimiento_texto', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'diagnostico_texto'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PiezasOdontograma', 'diagnostico_texto');
    await queryInterface.removeColumn('PiezasOdontograma', 'procedimiento_texto');
  }
};
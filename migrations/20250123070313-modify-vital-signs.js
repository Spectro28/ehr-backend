'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('VitalSigns', 'peso', {
      type: Sequelize.DECIMAL(6,2),
      allowNull: false
    });
    
    await queryInterface.changeColumn('VitalSigns', 'talla', {
      type: Sequelize.DECIMAL(5,2),
      allowNull: false
    });
    
    await queryInterface.changeColumn('VitalSigns', 'imc', {
      type: Sequelize.DECIMAL(5,2),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('VitalSigns', 'peso', {
      type: Sequelize.DECIMAL(5,2),
      allowNull: false
    });
    
    await queryInterface.changeColumn('VitalSigns', 'talla', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    
    await queryInterface.changeColumn('VitalSigns', 'imc', {
      type: Sequelize.DECIMAL(4,2),
      allowNull: true
    });
  }
};
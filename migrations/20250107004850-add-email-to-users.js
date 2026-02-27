'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Users');
    
    // Verificar y agregar columna email
    if (!tableInfo.email) {
      await queryInterface.addColumn('Users', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      });
    }

    // Verificar y agregar columna resetPasswordToken
    if (!tableInfo.resetPasswordToken) {
      await queryInterface.addColumn('Users', 'resetPasswordToken', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    // Verificar y agregar columna resetPasswordExpires
    if (!tableInfo.resetPasswordExpires) {
      await queryInterface.addColumn('Users', 'resetPasswordExpires', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Users');
    
    // Verificar y eliminar columnas solo si existen
    if (tableInfo.email) {
      await queryInterface.removeColumn('Users', 'email');
    }
    if (tableInfo.resetPasswordToken) {
      await queryInterface.removeColumn('Users', 'resetPasswordToken');
    }
    if (tableInfo.resetPasswordExpires) {
      await queryInterface.removeColumn('Users', 'resetPasswordExpires');
    }
  }
};
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Primero agregamos la columna permitiendo valores nulos
      await queryInterface.addColumn(
        'Users',
        'cedula',
        {
          type: Sequelize.STRING(10),
          allowNull: true, // Temporalmente permitimos NULL
          unique: true,
          after: 'username'
        },
        { transaction }
      );

      // 2. Actualizamos los registros existentes con un valor por defecto
      await queryInterface.sequelize.query(
        `UPDATE "Users" SET cedula = CONCAT('DEFAULT', id) WHERE cedula IS NULL`,
        { transaction }
      );

      // 3. Ahora modificamos la columna para no permitir nulos
      await queryInterface.changeColumn(
        'Users',
        'cedula',
        {
          type: Sequelize.STRING(10),
          allowNull: false,
          unique: true,
        },
        { transaction }
      );

      // 4. Agregamos el índice
      await queryInterface.addIndex(
        'Users',
        ['cedula'],
        {
          name: 'users_cedula_unique',
          unique: true,
          transaction
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Revertir los cambios
      await queryInterface.removeIndex('Users', 'users_cedula_unique', { transaction });
      await queryInterface.removeColumn('Users', 'cedula', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
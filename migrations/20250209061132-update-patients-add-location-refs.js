// migrations/XXXXXXXXXXXXXX-update-patients-add-location-refs.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Agregar columnas de referencias
      await queryInterface.addColumn(
        'Patients',
        'provincia_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Provincias',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'Patients',
        'canton_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Cantones',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'Patients',
        'parroquia_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Parroquias',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        { transaction }
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
      await queryInterface.removeColumn('Patients', 'provincia_id', { transaction });
      await queryInterface.removeColumn('Patients', 'canton_id', { transaction });
      await queryInterface.removeColumn('Patients', 'parroquia_id', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
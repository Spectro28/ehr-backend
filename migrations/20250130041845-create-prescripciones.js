'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Prescripciones', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            fecha_emision: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.NOW
            },
            nombre_generico: {
                type: Sequelize.STRING,
                allowNull: true
            },
            nombre_comercial: {
                type: Sequelize.STRING,
                allowNull: true
            },
            forma_farmaceutica: {
                type: Sequelize.STRING,
                allowNull: true
            },
            concentracion: {
                type: Sequelize.STRING,
                allowNull: true
            },
            dosis: {
                type: Sequelize.STRING,
                allowNull: true
            },
            frecuencia: {
                type: Sequelize.STRING,
                allowNull: true
            },
            duracion_tratamiento: {
                type: Sequelize.STRING,
                allowNull: true
            },
            via_administracion: {
                type: Sequelize.STRING,
                allowNull: true
            },
            indicaciones_adicionales: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            estado: {
                type: Sequelize.ENUM('activa', 'completada', 'cancelada'),
                defaultValue: 'activa',
                allowNull: true
            },
            evolucionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Evoluciones',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            medicoId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Prescripciones');
    }
};
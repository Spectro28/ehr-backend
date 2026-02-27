// models/diagnosticoOdontograma.js
module.exports = (sequelize, DataTypes) => {
    const DiagnosticoOdontograma = sequelize.define('DiagnosticoOdontograma', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        piezaOdontogramaId: {
            type: DataTypes.INTEGER,
            field: 'piezaOdontogramaId',
            allowNull: false,
            references: {
                model: 'PiezasOdontograma',
                key: 'id'
            }
        },
        diagnosticoId: {
            type: DataTypes.INTEGER,
            field: 'diagnosticoId',
            allowNull: false,
            references: {
                model: 'Diagnosticos',
                key: 'id'
            }
        },
        observaciones: {
            type: DataTypes.TEXT,
            field: 'observaciones',
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'createdAt',
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updatedAt',
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'DiagnosticoOdontograma',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    // Definir las asociaciones
    DiagnosticoOdontograma.associate = (models) => {
        DiagnosticoOdontograma.belongsTo(models.PiezaOdontograma, {
            foreignKey: 'piezaOdontogramaId',
            as: 'piezaOdontograma'
        });

        DiagnosticoOdontograma.belongsTo(models.Diagnostico, {
            foreignKey: 'diagnosticoId',
            as: 'diagnostico'
        });
    };

    return DiagnosticoOdontograma;
};

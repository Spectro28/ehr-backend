// models/procedimientoOdontograma.js
module.exports = (sequelize, DataTypes) => {
    const ProcedimientoOdontograma = sequelize.define('ProcedimientoOdontograma', {
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
        procedimientoId: {
            type: DataTypes.INTEGER,
            field: 'procedimientoId',
            allowNull: false,
            references: {
                model: 'Procedimientos',
                key: 'id'
            }
        },
        observaciones: {
            type: DataTypes.TEXT,
            field: 'observaciones',
            allowNull: true
        },
        fecha: {
            type: DataTypes.DATE,
            field: 'fecha',
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
        tableName: 'ProcedimientoOdontograma',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    // Definir las asociaciones
    ProcedimientoOdontograma.associate = (models) => {
        ProcedimientoOdontograma.belongsTo(models.PiezaOdontograma, {
            foreignKey: 'piezaOdontogramaId',
            as: 'piezaOdontograma'
        });

        ProcedimientoOdontograma.belongsTo(models.Procedimiento, {
            foreignKey: 'procedimientoId',
            as: 'procedimiento'
        });
    };

    return ProcedimientoOdontograma;
};

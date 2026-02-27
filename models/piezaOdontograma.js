// models/piezaOdontograma.js
module.exports = (sequelize, DataTypes) => {
    const PiezaOdontograma = sequelize.define('PiezaOdontograma', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        odontogramaId: {
            type: DataTypes.INTEGER,
            field: 'odontogramaId',
            allowNull: false,
            references: {
                model: 'Odontogramas',
                key: 'id'
            }
        },
        numeroPieza: {
            type: DataTypes.INTEGER,
            field: 'numeroPieza',
            allowNull: false
        },
        cara: {
            type: DataTypes.STRING(20),
            field: 'cara',
            allowNull: true
        },
        diagnosticoId: {
            type: DataTypes.INTEGER,
            field: 'diagnosticoId',
            allowNull: true,
            references: {
                model: 'Diagnosticos',
                key: 'id'
            }
        },
        procedimientoId: {
            type: DataTypes.INTEGER,
            field: 'procedimientoId',
            allowNull: true,
            references: {
                model: 'Procedimientos',
                key: 'id'
            }
        },
        diagnostico_texto: {
            type: DataTypes.STRING(255),
            field: 'diagnostico_texto',
            allowNull: true
        },
        procedimiento_texto: {
            type: DataTypes.STRING(255),
            field: 'procedimiento_texto',
            allowNull: true
        },
        tipo: {
            type: DataTypes.STRING(50),
            field: 'tipo',
            allowNull: true
        },
        descripcion: {
            type: DataTypes.TEXT,
            field: 'descripcion',
            allowNull: true
        },
        recesion: {
            type: DataTypes.STRING(10),
            field: 'recesion',
            allowNull: true
        },
        movilidad: {
            type: DataTypes.STRING(10),
            field: 'movilidad',
            allowNull: true
        },
        estado: {
            type: DataTypes.JSONB,
            field: 'estado',
            allowNull: false,
            defaultValue: {}
        },
        hallazgos: {
            type: DataTypes.JSONB,
            field: 'hallazgos',
            allowNull: true
        },
        tratamientos: {
            type: DataTypes.JSONB,
            field: 'tratamientos',
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
        tableName: 'PiezasOdontograma',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        indexes: [
            {
                unique: true,
                fields: ['odontogramaId', 'numeroPieza', 'cara']
            }
        ]
    });

    // Definir las asociaciones
    PiezaOdontograma.associate = (models) => {
        // Una pieza dental pertenece a un odontograma
        PiezaOdontograma.belongsTo(models.Odontograma, {
            foreignKey: 'odontogramaId',
            as: 'odontograma'
        });

        // Una pieza dental puede tener un diagnóstico
        PiezaOdontograma.belongsTo(models.Diagnostico, {
            foreignKey: 'diagnosticoId',
            as: 'diagnostico'
        });

        // Una pieza dental puede tener un procedimiento
        PiezaOdontograma.belongsTo(models.Procedimiento, {
            foreignKey: 'procedimientoId',
            as: 'procedimiento'
        });
    };

    return PiezaOdontograma;
};

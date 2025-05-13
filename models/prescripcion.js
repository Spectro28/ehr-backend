const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Prescripcion extends Model {
        static associate(models) {
            Prescripcion.belongsTo(models.Evolucion, {
                foreignKey: 'evolucionId',
                as: 'evolucion'
            });
            Prescripcion.belongsTo(models.User, {
                foreignKey: 'medicoId',
                as: 'medico'
            });
        }
    }

    Prescripcion.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fecha_emision: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        nombre_generico: {
            type: DataTypes.STRING,
            allowNull: true
        },
        nombre_comercial: {
            type: DataTypes.STRING,
            allowNull: true
        },
        forma_farmaceutica: {
            type: DataTypes.STRING,
            allowNull: true
        },
        concentracion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dosis: {
            type: DataTypes.STRING,
            allowNull: true
        },
        frecuencia: {
            type: DataTypes.STRING,
            allowNull: true
        },
        duracion_tratamiento: {
            type: DataTypes.STRING,
            allowNull: true
        },
        via_administracion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        indicaciones_adicionales: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        estado: {
            type: DataTypes.ENUM('activa', 'completada', 'cancelada'),
            defaultValue: 'activa',
            allowNull: true
        },
        evolucionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Evoluciones',
                key: 'id'
            }
        },
        medicoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'Prescripcion',
        tableName: 'Prescripciones',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Prescripcion;
};
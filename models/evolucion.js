const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Evolucion extends Model {
        static associate(models) {
            Evolucion.belongsTo(models.Patient, {
                foreignKey: 'pacienteId',
                as: 'paciente'
            });
            Evolucion.belongsTo(models.User, {
                foreignKey: 'medicoId',
                as: 'medico'
            });
            Evolucion.belongsTo(models.VitalSigns, {
                foreignKey: 'signosVitalesId',
                as: 'signosVitales'
            });
            Evolucion.hasMany(models.Prescripcion, {
                foreignKey: 'evolucionId',
                as: 'prescripciones'
            });
            // Agregar esta nueva asociación
    Evolucion.hasMany(models.Diagnostico, {
        foreignKey: 'evolucionId',
        as: 'diagnosticos'
    });
        }
    }

    Evolucion.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        motivo_consulta: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        enfermedad_actual: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        antecedentes_personales: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        antecedentes_familiares: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                cardiopatia: false,
                diabetes: false,
                enfermedad_cardiovascular: false,
                hipertension: false,
                cancer: false,
                tuberculosis: false,
                enfermedad_mental: false,
                enfermedad_infecciosa: false,
                otro_antecedente: '',
                sin_antecedentes: false
            }
        },
        pacienteId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Patients',
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
        },
        signosVitalesId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'VitalSigns',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'Evolucion',
        tableName: 'Evoluciones',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Evolucion;
};

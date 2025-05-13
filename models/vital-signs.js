const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VitalSigns extends Model {
        static associate(models) {
            VitalSigns.belongsTo(models.Cita, {
                foreignKey: 'citaId',
                as: 'cita'
            });
            VitalSigns.belongsTo(models.Patient, {
                foreignKey: 'pacienteId',
                as: 'paciente'
            });
            VitalSigns.belongsTo(models.User, {
                foreignKey: 'enfermeroId',
                as: 'enfermero'
            });
        }
    }

    VitalSigns.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fecha_medicion: {
            type: DataTypes.DATE,
            allowNull: false
        },
        temperatura: {
            type: DataTypes.DECIMAL(4,1),
            allowNull: false,
            validate: {
                min: 30.0,
                max: 45.0
            }
        },
        presion_arterial: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^\d{2,3}\/\d{2,3}$/
            }
        },
        pulso: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 40,
                max: 200
            }
        },
        frecuencia_respiratoria: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 8,
                max: 40
            }
        },
        peso: {
            type: DataTypes.DECIMAL(6,2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        talla: {
            type: DataTypes.DECIMAL(5,2),
            allowNull: false,
            validate: {
                min: 30,
                max: 250
            }
        },
        imc: {
            type: DataTypes.DECIMAL(5,2),
            allowNull: true
        },
        citaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Citas',
                key: 'id'
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
        enfermeroId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'VitalSigns',
        tableName: 'VitalSigns',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeValidate: (vitalSign) => {
                if (vitalSign.peso && vitalSign.talla) {
                    const tallaMetros = vitalSign.talla / 100;
                    const imcCalculado = vitalSign.peso / (tallaMetros * tallaMetros);
                    vitalSign.imc = parseFloat(imcCalculado.toFixed(2));
                }
            }
        }
    });

    return VitalSigns;
};
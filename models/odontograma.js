// models/odontograma.js
module.exports = (sequelize, DataTypes) => {
    const Odontograma = sequelize.define('Odontograma', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        pacienteId: {
            type: DataTypes.INTEGER,
            field: 'pacienteId',
            allowNull: false,
            references: {
                model: 'Patients',
                key: 'id'
            }
        },
        evolucionId: {
            type: DataTypes.INTEGER,
            field: 'evolucionId',
            allowNull: true,
            references: {
                model: 'Evoluciones',
                key: 'id'
            }
        },
        dentistaId: {
            type: DataTypes.INTEGER,
            field: 'dentistaId',
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        tipo: {
            type: DataTypes.ENUM('adulto', 'infantil'),
            field: 'tipo',
            allowNull: false,
            defaultValue: 'adulto'
        },
        fecha: {
            type: DataTypes.DATE,
            field: 'fecha',
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        observaciones: {
            type: DataTypes.TEXT,
            field: 'observaciones',
            allowNull: true
        },
        imagen_paladar: {
            type: DataTypes.TEXT,
            field: 'imagen_paladar',
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
        tableName: 'Odontogramas',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    // Definir las asociaciones
    Odontograma.associate = (models) => {
        // Un odontograma pertenece a un paciente
        Odontograma.belongsTo(models.Patient, {
            foreignKey: 'pacienteId',
            as: 'paciente'
        });

        // Un odontograma pertenece a un dentista (User)
        Odontograma.belongsTo(models.User, {
            foreignKey: 'dentistaId',
            as: 'dentista'
        });

        // Un odontograma puede pertenecer a una evolución
        Odontograma.belongsTo(models.Evolucion, {
            foreignKey: 'evolucionId',
            as: 'evolucion'
        });

        // Un odontograma tiene muchas piezas dentales
        Odontograma.hasMany(models.PiezaOdontograma, {
            foreignKey: 'odontogramaId',
            as: 'piezas'
        });

        // Un odontograma tiene muchos índices
        Odontograma.hasMany(models.IndiceOdontograma, {
            foreignKey: 'odontogramaId',
            as: 'indices'
        });
    };

    return Odontograma;
};

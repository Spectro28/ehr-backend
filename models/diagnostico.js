// models/diagnostico.js
module.exports = (sequelize, DataTypes) => {
    const Diagnostico = sequelize.define('Diagnostico', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        nombre: {
            type: DataTypes.STRING(255),
            field: 'nombre',
            allowNull: false
        },
        codigo: {
            type: DataTypes.STRING(50),
            field: 'codigo',
            allowNull: true,
            unique: true
        },
        descripcion: {
            type: DataTypes.TEXT,
            field: 'descripcion',
            allowNull: true
        },
        // Campos para compatibilidad con el sistema existente
        evolucionId: {
            type: DataTypes.INTEGER,
            field: 'evolucionid',
            allowNull: true
        },
        cieId: {
            type: DataTypes.INTEGER,
            field: 'cieid',
            allowNull: true
        },
        tipo: {
            type: DataTypes.STRING,
            field: 'tipo',
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
        tableName: 'Diagnosticos',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    // Definir las asociaciones
    Diagnostico.associate = (models) => {
        // Un diagnóstico puede estar en muchas piezas dentales
        Diagnostico.hasMany(models.PiezaOdontograma, {
            foreignKey: 'diagnosticoId',
            as: 'piezas'
        });

        // Asociaciones para compatibilidad con el sistema existente
        Diagnostico.belongsTo(models.CIE, {
            foreignKey: 'cieid',
            as: 'cie',
            targetKey: 'id'
        });
        
        Diagnostico.belongsTo(models.Evolucion, {
            foreignKey: 'evolucionid',
            as: 'evolucion'
        });
    };

    return Diagnostico;
};
// models/procedimiento.js
module.exports = (sequelize, DataTypes) => {
    const Procedimiento = sequelize.define('Procedimiento', {
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
        tableName: 'Procedimientos',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    // Definir las asociaciones
    Procedimiento.associate = (models) => {
        // Un procedimiento puede estar en muchas piezas dentales
        Procedimiento.hasMany(models.PiezaOdontograma, {
            foreignKey: 'procedimientoId',
            as: 'piezas'
        });
    };

    return Procedimiento;
};

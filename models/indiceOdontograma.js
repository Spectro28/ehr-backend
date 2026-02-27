// models/indiceOdontograma.js
module.exports = (sequelize, DataTypes) => {
    const IndiceOdontograma = sequelize.define('IndiceOdontograma', {
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
        tipo: {
            type: DataTypes.STRING(255),
            field: 'tipo',
            allowNull: false
        },
        valor: {
            type: DataTypes.FLOAT,
            field: 'valor',
            allowNull: false
        },
        detalles: {
            type: DataTypes.JSONB,
            field: 'detalles',
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
        tableName: 'IndicesOdontograma',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        indexes: [
            {
                unique: true,
                fields: ['odontogramaId', 'tipo']
            }
        ]
    });

    // Definir las asociaciones
    IndiceOdontograma.associate = (models) => {
        // Un índice pertenece a un odontograma
        IndiceOdontograma.belongsTo(models.Odontograma, {
            foreignKey: 'odontogramaId',
            as: 'odontograma'
        });
    };

    return IndiceOdontograma;
};

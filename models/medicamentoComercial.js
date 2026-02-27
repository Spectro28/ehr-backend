module.exports = (sequelize, DataTypes) => {
    const MedicamentoComercial = sequelize.define('MedicamentoComercial', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        medicamento_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'medicamentos',
                key: 'id'
            }
        },
        nombre_comercial: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        estado: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'medicamentos_comerciales',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });

    MedicamentoComercial.associate = function(models) {
        MedicamentoComercial.belongsTo(models.Medicamento, {
            foreignKey: 'medicamento_id',
            as: 'medicamento'
        });
    };

    return MedicamentoComercial;
}; 
module.exports = (sequelize, DataTypes) => {
    const Medicamento = sequelize.define('Medicamento', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre_generico: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        nombre_comercial: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        forma_farmaceutica: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        concentracion: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        via_administracion: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        categoria: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        estado: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'medicamentos',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true // Esto asegura que Sequelize use snake_case para los nombres de columnas
    });

    return Medicamento;
};
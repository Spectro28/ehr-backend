module.exports = (sequelize, DataTypes) => {
    const Provincia = sequelize.define('Provincia', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    }, {
      tableName: 'Provincias',
      underscored: true,
      timestamps: true,
      schema: 'public'
    });
  
    Provincia.associate = function(models) {
      Provincia.hasMany(models.Canton, {
        foreignKey: 'provincia_id',
        as: 'cantones'
      });
    };
  
    return Provincia;
  };
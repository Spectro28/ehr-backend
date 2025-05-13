module.exports = (sequelize, DataTypes) => {
    const Canton = sequelize.define('Canton', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      provincia_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'Cantones',
      underscored: true,
      timestamps: true,
      schema: 'public'
    });
  
    Canton.associate = function(models) {
      Canton.belongsTo(models.Provincia, {
        foreignKey: 'provincia_id',
        as: 'provincia'
      });
      Canton.hasMany(models.Parroquia, {
        foreignKey: 'canton_id',
        as: 'parroquias'
      });
    };
  
    return Canton;
  };
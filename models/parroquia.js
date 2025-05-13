module.exports = (sequelize, DataTypes) => {
    const Parroquia = sequelize.define('Parroquia', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      canton_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'Parroquias',
      underscored: true,
      timestamps: true,
      schema: 'public'
    });
  
    Parroquia.associate = function(models) {
      Parroquia.belongsTo(models.Canton, {
        foreignKey: 'canton_id',
        as: 'canton'
      });
    };
  
    return Parroquia;
  };
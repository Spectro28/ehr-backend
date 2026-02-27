module.exports = (sequelize, DataTypes) => {
  const LesionCatalog = sequelize.define('LesionCatalog', {
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    codigo: {
      type: DataTypes.TEXT,
      unique: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'LesionCatalog'
  });

  LesionCatalog.associate = (models) => {
    LesionCatalog.hasMany(models.ExamenFisicoItemLesion, { as: 'usoLesiones', foreignKey: 'lesionId' });
  };

  return LesionCatalog;
};



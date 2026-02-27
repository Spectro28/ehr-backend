module.exports = (sequelize, DataTypes) => {
  const ExamenFisicoItem = sequelize.define('ExamenFisicoItem', {
    bodyPartNombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'ExamenFisicoItem'
  });

  ExamenFisicoItem.associate = (models) => {
    ExamenFisicoItem.belongsTo(models.ExamenFisico, { as: 'examenFisico', foreignKey: 'examenFisicoId', onDelete: 'CASCADE' });
    ExamenFisicoItem.belongsTo(models.BodyPart, { as: 'bodyPart', foreignKey: 'bodyPartId', onDelete: 'SET NULL' });
    ExamenFisicoItem.hasMany(models.ExamenFisicoItemLesion, { as: 'lesiones', foreignKey: 'itemId', onDelete: 'CASCADE' });
  };

  return ExamenFisicoItem;
};



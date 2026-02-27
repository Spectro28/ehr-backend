module.exports = (sequelize, DataTypes) => {
  const ExamenFisicoItemLesion = sequelize.define('ExamenFisicoItemLesion', {
    lesionTexto: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'ExamenFisicoItemLesion'
  });

  ExamenFisicoItemLesion.associate = (models) => {
    ExamenFisicoItemLesion.belongsTo(models.ExamenFisicoItem, { as: 'item', foreignKey: 'itemId', onDelete: 'CASCADE' });
    ExamenFisicoItemLesion.belongsTo(models.LesionCatalog, { as: 'lesion', foreignKey: 'lesionId', onDelete: 'SET NULL' });
  };

  return ExamenFisicoItemLesion;
};



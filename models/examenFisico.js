module.exports = (sequelize, DataTypes) => {
  const ExamenFisico = sequelize.define('ExamenFisico', {
    vistaInicial: {
      type: DataTypes.ENUM('anverso', 'reverso'),
      allowNull: false,
      defaultValue: 'anverso'
    }
  }, {
    tableName: 'ExamenFisico'
  });

  ExamenFisico.associate = (models) => {
    ExamenFisico.belongsTo(models.Evolucion, { as: 'evolucion', foreignKey: 'evolucionId', onDelete: 'CASCADE' });
    ExamenFisico.belongsTo(models.User, { as: 'doctor', foreignKey: 'doctorId', onDelete: 'RESTRICT' });
    ExamenFisico.hasMany(models.ExamenFisicoItem, { as: 'items', foreignKey: 'examenFisicoId', onDelete: 'CASCADE' });
  };

  return ExamenFisico;
};



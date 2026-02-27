module.exports = (sequelize, DataTypes) => {
  const BodyPart = sequelize.define('BodyPart', {
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codigo: {
      type: DataTypes.TEXT,
      unique: true
    },
    vista: {
      type: DataTypes.ENUM('anverso', 'reverso'),
      allowNull: false
    },
    svg_id: {
      type: DataTypes.TEXT
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'BodyParts'
  });

  BodyPart.associate = (models) => {
    BodyPart.hasMany(models.ExamenFisicoItem, { as: 'examenItems', foreignKey: 'bodyPartId' });
  };

  return BodyPart;
};



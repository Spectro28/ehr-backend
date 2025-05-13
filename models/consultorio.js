module.exports = (sequelize, DataTypes) => {
  const Consultorio = sequelize.define('Consultorio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    doctorId: {                // Cambiado a camelCase
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'activo'
    }
  }, {
    tableName: 'Consultorios',
    timestamps: true
  });

  Consultorio.associate = function(models) {
    Consultorio.belongsTo(models.User, {
      foreignKey: 'doctorId',  // Cambiado a camelCase
      as: 'doctor'
    });

    Consultorio.hasMany(models.HorarioConsultorio, {
      foreignKey: 'consultorioId',  // Cambiado a camelCase
      as: 'horarios'
    });
  };

  return Consultorio;
};
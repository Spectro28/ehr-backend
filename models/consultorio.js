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
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo'),
      defaultValue: 'activo'
    }
  }, {
    tableName: 'Consultorios',
    timestamps: true
  });

  Consultorio.associate = function(models) {
    Consultorio.belongsTo(models.User, {
      foreignKey: {
        name: 'doctorId',
        allowNull: false
      },
      as: 'doctor',
      onDelete: 'CASCADE',
      constraints: true
    });

    Consultorio.hasMany(models.HorarioConsultorio, {
      foreignKey: 'consultorioId',
      as: 'horarios',
      onDelete: 'CASCADE'
    });
  };

  return Consultorio;
};
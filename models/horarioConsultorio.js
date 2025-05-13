module.exports = (sequelize, DataTypes) => {
    const HorarioConsultorio = sequelize.define('HorarioConsultorio', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      consultorioId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      dia: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']]
        }
      },
      fecha: {
        type: DataTypes.DATEONLY,  // Usar DATEONLY para fechas sin hora
        allowNull: false
      },
      horaInicio: {
        type: DataTypes.STRING,
        allowNull: false
      },
      horaFin: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      tableName: 'HorariosConsultorio',
      timestamps: true
    });
  
    HorarioConsultorio.associate = function(models) {
      HorarioConsultorio.belongsTo(models.Consultorio, {
        foreignKey: 'consultorioId',
        as: 'consultorio'
      });
    };
  
    return HorarioConsultorio;
  };
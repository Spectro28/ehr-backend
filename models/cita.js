const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Cita extends Model {
      static associate(models) {
        Cita.belongsTo(models.Patient, {
          foreignKey: 'pacienteId',
          as: 'paciente'
        });
  
        Cita.belongsTo(models.User, {
          foreignKey: 'doctorId',
          as: 'doctor'
        });
  
        Cita.belongsTo(models.Consultorio, {
          foreignKey: 'consultorioId',
          as: 'consultorio'
        });

        // Agregar esta nueva relación
        Cita.hasOne(models.VitalSigns, {
          foreignKey: 'citaId',
          as: 'signosVitales'
      });
      }
    }

    Cita.init({
      pacienteId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      consultorioId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fecha: DataTypes.DATE,
      hora: DataTypes.TIME,
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente',
        validate: {
          isIn: {
            args: [['pendiente', 'atendido', 'cancelado', 'histórico']],
            msg: 'Estado debe ser: pendiente, atendido, cancelado o histórico'
          }
        }
      },
      notas: DataTypes.TEXT
    }, {
      sequelize,
      modelName: 'Cita',
      tableName: 'Citas',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      defaultScope: {
        attributes: ['id', 'pacienteId', 'consultorioId', 'doctorId', 'fecha', 'hora', 'estado', 'notas', 'created_at', 'updated_at']
      }
    });

    return Cita;
};
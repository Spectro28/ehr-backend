// models/diagnostico.js
module.exports = (sequelize, DataTypes) => {
    const Diagnostico = sequelize.define('Diagnostico', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      evolucionId: {
        type: DataTypes.INTEGER,
        field: 'evolucionid',
        allowNull: false
      },
      cieId: {
        type: DataTypes.INTEGER,
        field: 'cieid',
        allowNull: false
      },
      tipo: {
        type: DataTypes.STRING,
        field: 'tipo',
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updated_at: {
        type: DataTypes.DATE,
        field: 'updated_at'
      }
    }, {
      tableName: 'diagnosticos',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  
    // Definir las asociaciones
    Diagnostico.associate = (models) => {
        Diagnostico.belongsTo(models.CIE, {
            foreignKey: 'cieid',
            as: 'cie',
            targetKey: 'id'  // Asegúrate de que esto coincida con la clave primaria de CIE
        });
        
        Diagnostico.belongsTo(models.Evolucion, {
            foreignKey: 'evolucionid',
            as: 'evolucion'
        });
    };
  
    return Diagnostico;
  };
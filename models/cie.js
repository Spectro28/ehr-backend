module.exports = (sequelize, DataTypes) => {
    const CIE = sequelize.define('CIE', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,  // Agregado autoIncrement
        field: 'id'
      },
      cie_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'cie',
          key: 'id'
        }
      },
      versioncie: {
        type: DataTypes.STRING,
        field: 'versioncie'
      },
      codigo: {
        type: DataTypes.STRING,
        field: 'codigo'
      },
      nombre: {
        type: DataTypes.STRING,
        field: 'nombre'
      },
      ctsexo_id: {
        type: DataTypes.INTEGER,
        field: 'ctsexo_id'
      },
      edadmin: {
        type: DataTypes.INTEGER,
        field: 'edadmin'
      },
      unidadedadmin: {
        type: DataTypes.STRING,
        field: 'unidadedadmin'
      },
      edadmax: {
        type: DataTypes.INTEGER,
        field: 'edadmax'
      },
      unidadedadmax: {
        type: DataTypes.STRING,
        field: 'unidadedadmax'
      },
      estado: {
        type: DataTypes.INTEGER,  // Cambiado a INTEGER si es 0 o 1
        field: 'estado'
      }
    }, {
      tableName: 'cie',
      schema: 'public',
      timestamps: false,
      freezeTableName: true
    });
  
    // Definir las asociaciones
    CIE.associate = (models) => {
      // Asociación con Diagnostico
      CIE.hasMany(models.Diagnostico, {
        foreignKey: 'cieid',
        as: 'diagnosticos'
      });
  
      // Auto-asociaciones para la jerarquía padre-hijo
      CIE.belongsTo(models.CIE, {
        foreignKey: 'cie_id',
        as: 'parent',
        targetKey: 'id'
      });
  
      CIE.hasMany(models.CIE, {
        foreignKey: 'cie_id',
        as: 'children',
        sourceKey: 'id'
      });
    };
  
    return CIE;
  };
module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    // Datos personales (obligatorios)
    apellido_paterno: {
      type: DataTypes.STRING,
      allowNull: false
    },
    primer_nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    empresa: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'Sin empresa'
      },   
    cedula: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lugar_nacimiento: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nacionalidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sexo: {
      type: DataTypes.ENUM('H', 'M'),
      allowNull: false
    },

    // Campos opcionales
    apellido_materno: {
      type: DataTypes.STRING,
      allowNull: true
    },
    segundo_nombre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true
    },
    grupo_cultural: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Dirección (ahora opcional)
    direccion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    barrio: {
      type: DataTypes.STRING,
      allowNull: true
    },
    provincia_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Provincias',
        key: 'id'
      }
    },
    canton_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Cantones',
        key: 'id'
      }
    },
    parroquia_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Parroquias',
        key: 'id'
      }
    },

    // Estado civil (ahora opcional)
    estado_civil: {
      type: DataTypes.ENUM('S', 'C', 'D', 'V', 'UL'),
      allowNull: true // Cambiado a true
    },

    // Datos adicionales (opcionales)
    instruccion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ocupacion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    empresa_trabajo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tipo_seguro: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Contacto de emergencia (opcional)
    contacto_emergencia: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parentesco_emergencia: {
      type: DataTypes.STRING,
      allowNull: true
    },
    direccion_emergencia: {
      type: DataTypes.STRING,
      allowNull: true
    },
    telefono_emergencia: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Patients',
    schema: 'public',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  Patient.associate = function(models) {
    Patient.hasMany(models.Cita, {
        foreignKey: 'pacienteId',
        as: 'citas',
        onDelete: 'CASCADE'
    });
    
    Patient.hasMany(models.VitalSigns, {
        foreignKey: 'pacienteId',
        as: 'signosVitales'
    });

    // Agregar esta nueva relación
    Patient.hasMany(models.Evolucion, {
        foreignKey: 'pacienteId',
        as: 'evoluciones'
    });
    // Asociaciones de ubicación
    Patient.belongsTo(models.Provincia, {
      foreignKey: 'provincia_id',
      as: 'provincia_info'  // Cambiado de 'provincia' a 'provincia_info'
    });
    
    Patient.belongsTo(models.Canton, {
      foreignKey: 'canton_id',
      as: 'canton_info'    // Cambiado de 'canton' a 'canton_info'
    });
    
    Patient.belongsTo(models.Parroquia, {
      foreignKey: 'parroquia_id',
      as: 'parroquia_info' // Cambiado de 'parroquia' a 'parroquia_info'
    });
};

  return Patient;
};
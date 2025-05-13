module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        cedula: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
              notEmpty: true,
              is: /^[0-9]{10}$/i
          }
      },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
              isEmail: true
          }
        },
        empresa: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'Sin empresa'
      },    
        especialidad: {
            type: DataTypes.STRING,
            allowNull: true
        },
        resetPasswordToken: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'resetPasswordToken'  // Nombre exacto en la BD
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'resetPasswordExpires'  // Nombre exacto en la BD
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Users',
        timestamps: true,
        underscored: false,  // Cambiado a false porque tus columnas no usan snake_case
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
    
  
    // Agregar hooks para actualizar updated_at
    User.beforeUpdate(async (user) => {
        user.updated_at = new Date();
    });
    User.associate = function(models) {
      User.hasMany(models.Evolucion, {
          foreignKey: 'medicoId',
          as: 'evoluciones'
      });
  };
  
    return User;
  };
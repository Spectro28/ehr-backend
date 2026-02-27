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
     
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        tipo_identificacion: {
            type: DataTypes.ENUM('cedula', 'pasaporte', 'no_identificado'),
            allowNull: false,
            defaultValue: 'cedula'
        },
        identificacion: {
            type: DataTypes.STRING(20),
            allowNull: true, // Permitir null cuando es 'no_identificado'
            unique: true,
            validate: {
                customValidator(value) {
                    // Si el tipo es 'no_identificado', no validar el formato
                    if (this.tipo_identificacion === 'no_identificado') {
                        return;
                    }
                    
                    // Validar que el campo no esté vacío para otros tipos
                    if (!value) {
                        throw new Error('El número de identificación es requerido');
                    }
                    
                    if (this.tipo_identificacion === 'cedula' && value) {
                        // Validación básica de cédula (10 dígitos numéricos)
                        if (!/^[0-9]{10}$/.test(value)) {
                            throw new Error('La cédula debe tener 10 dígitos numéricos');
                        }
                        // Comentamos temporalmente la validación estricta de cédula
                        /*
                        let total = 0;
                        const coeficientes = [2,1,2,1,2,1,2,1,2];
                        const verificador = parseInt(value.charAt(9));

                        for (let i = 0; i < 9; i++) {
                            let producto = parseInt(value.charAt(i)) * coeficientes[i];
                            if (producto >= 10) producto -= 9;
                            total += producto;
                        }

                        const digitoVerificador = total % 10 === 0 ? 0 : 10 - (total % 10);
                        if (digitoVerificador !== verificador) {
                            throw new Error('Cédula ecuatoriana inválida');
                        }
                        */
                    } else if (this.tipo_identificacion === 'pasaporte' && value) {
                        if (!/^[A-Z0-9]{6,18}$/.test(value)) {
                            throw new Error('Formato de pasaporte inválido');
                        }
                    }
                }
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
            field: 'resetPasswordToken'
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'resetPasswordExpires'
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
        underscored: false,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    User.beforeUpdate(async (user) => {
        user.updated_at = new Date();
    });

    User.associate = function(models) {
        // Relación con Evolucion
        User.hasMany(models.Evolucion, {
            foreignKey: 'medicoId',
            as: 'evoluciones'
        });

        // Relación con Role
        User.belongsToMany(models.Role, {
            through: models.UserRole,
            foreignKey: 'usuario_id',
            otherKey: 'role_id',
            as: 'roles'
        });

        // Relación con Consultorio
        User.hasMany(models.Consultorio, {
            foreignKey: 'doctorId',
            as: 'consultorios'
        });

        // Relación con Cita
        User.hasMany(models.Cita, {
            foreignKey: 'doctorId',
            as: 'citas'
        });
    };

    return User;
};

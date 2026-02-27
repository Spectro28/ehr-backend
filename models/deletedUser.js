module.exports = (sequelize, DataTypes) => {
  const DeletedUser = sequelize.define('DeletedUser', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    original_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    especialidad: {
      type: DataTypes.STRING,
      allowNull: true
    },
    empresa: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tipo_identificacion: {
      type: DataTypes.ENUM('cedula', 'pasaporte', 'no_identificado'),
      allowNull: false
    },
    identificacion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID del administrador que eliminó el usuario'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo de la eliminación'
    }
  }, {
    tableName: 'DeletedUsers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return DeletedUser;
}; 
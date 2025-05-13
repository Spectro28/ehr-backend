'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    usuarioroleid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: DataTypes.INTEGER,
    role_id: DataTypes.INTEGER
  }, {
    tableName: 'usuariorole',
    schema: 'security',
    timestamps: false
  });

  UserRole.associate = function(models) {
    UserRole.belongsTo(models.User, {
      foreignKey: 'usuario_id'
    });
    UserRole.belongsTo(models.Role, {
      foreignKey: 'role_id'
    });
  };

  return UserRole;
};
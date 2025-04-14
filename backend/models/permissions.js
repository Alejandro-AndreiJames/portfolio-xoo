'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class permissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Permissions belongs to a role
      permissions.belongsTo(models.roles, {
        foreignKey: 'role_id'
      });
      
      // Permissions belongs to many suggestions
      permissions.belongsToMany(models.suggestions, {
        through: 'permissionsSuggestions',
        foreignKey: 'permission_id'
      });
    }
  }
  permissions.init({
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    can_create: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    can_edit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    can_soft_delete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    can_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    can_restore: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    can_perma_delete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'permissions',
  });
  return permissions;
};
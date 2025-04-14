'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class roles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Roles has many users
      roles.hasMany(models.users, {
        foreignKey: 'role_id'
      });
      
      // Roles has many courses
      roles.hasMany(models.courses, {
        foreignKey: 'role_id'
      });
      
      // Roles has many permissions
      roles.hasMany(models.permissions, {
        foreignKey: 'role_id'
      });
    }
  }
  roles.init({
    role_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'roles',
  });
  return roles;
};
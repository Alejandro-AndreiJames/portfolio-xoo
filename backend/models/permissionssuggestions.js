'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class permissionsSuggestions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // This is a junction table, no need to define associations here
      // The associations are defined in the related models
    }
  }
  permissionsSuggestions.init({
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    suggestion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'suggestions',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'permissionsSuggestions',
  });
  return permissionsSuggestions;
};
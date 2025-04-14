'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class suggestions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Suggestions belongs to a user
      suggestions.belongsTo(models.users, {
        foreignKey: 'user_id'
      });
      
      // Suggestions belongs to many permissions
      suggestions.belongsToMany(models.permissions, {
        through: 'permissionsSuggestions',
        foreignKey: 'suggestion_id'
      });
    }
  }
  suggestions.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'suggestions',
    paranoid: true // Enable soft-delete
  });
  return suggestions;
};
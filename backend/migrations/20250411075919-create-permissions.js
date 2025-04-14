'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role_id: {
        type: Sequelize.INTEGER
      },
      can_create: {
        type: Sequelize.BOOLEAN
      },
      can_edit: {
        type: Sequelize.BOOLEAN
      },
      can_soft_delete: {
        type: Sequelize.BOOLEAN
      },
      can_read: {
        type: Sequelize.BOOLEAN
      },
      can_restore: {
        type: Sequelize.BOOLEAN
      },
      can_perma_delete: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permissions');
  }
};
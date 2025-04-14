'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('permissions', [
      {
        role_id: 1, // Admin role
        can_create: true,
        can_edit: true,
        can_soft_delete: true,
        can_read: true,
        can_restore: true,
        can_perma_delete: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role_id: 2, // Student role
        can_create: true,
        can_edit: false,
        can_soft_delete: false,
        can_read: true,
        can_restore: false,
        can_perma_delete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
}; 
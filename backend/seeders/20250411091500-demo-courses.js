'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('courses', [
      {
        course_name: 'BS Information Technology',
        role_id: 2, // Student role
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        course_name: 'BSBA Major in Marketing Management',
        role_id: 2, // Student role
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        course_name: 'BSBA Major in Human Resource Management',
        role_id: 2, // Student role
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        course_name: 'BSED Major in English',
        role_id: 2, // Student role
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        course_name: 'BS Electrical Engineering',
        role_id: 2, // Student role
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('courses', null, {});
  }
}; 
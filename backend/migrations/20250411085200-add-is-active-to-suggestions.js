'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('suggestions', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: 'status'
    });

    // Update existing records to set is_active based on status
    await queryInterface.sequelize.query(`
      UPDATE suggestions 
      SET is_active = CASE 
        WHEN status = 'active' THEN 1 
        ELSE 0 
      END;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('suggestions', 'is_active');
  }
}; 
const db = require('../models');
const { suggestions, users, roles, courses, permissions, permissionsSuggestions } = db;
const { Op } = require('sequelize');

// Helper function to log errors only in development mode
const logError = (message, error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error);
  }
};

const createSuggestion = async (req, res) => {
  try {
    // First, find or create the user
    const [user, userCreated] = await users.findOrCreate({
      where: { email: req.body.email },
      defaults: {
        name: req.body.name,
        role_id: req.body.role_id || 2 // Default to role_id 2 (student) if not provided
      }
    });

    // Handle course if provided
    let courseId = null;
    if (req.body.course) {
      // Find or create the course
      const [course, courseCreated] = await courses.findOrCreate({
        where: { 
          course_name: req.body.course,
          role_id: user.role_id 
        },
        defaults: {
          course_name: req.body.course,
          role_id: user.role_id
        }
      });
      courseId = course.id;
    }

    // Then create the suggestion linked to this user
    const suggestion = await suggestions.create({
      user_id: user.id,
      message: req.body.message,
      status: 'active',  // Default to active
      is_active: 1      // Set is_active to 1 for active status
    });
    
    // If we have permissions (admin roles), connect them
    if (user.role_id === 1) {
      // Find or create admin permissions
      const [permission, permissionCreated] = await permissions.findOrCreate({
        where: { role_id: 1 },
        defaults: {
          role_id: 1,
          can_create: true,
          can_edit: true,
          can_soft_delete: true,
          can_read: true,
          can_restore: true,
          can_perma_delete: true
        }
      });

      // Create the permissions-suggestions association
      const permSuggestion = await permissionsSuggestions.create({
        permission_id: permission.id,
        suggestion_id: suggestion.id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Suggestion submitted successfully',
      data: {
        id: suggestion.id,
        message: suggestion.message,
        status: suggestion.status,
        is_active: suggestion.is_active,
        userName: user.name,
        userEmail: user.email,
        courseId: courseId
      }
    });
  } catch (error) {
    logError('Error creating suggestion:', error);
    res.status(400).json({ success: false, error: error.message, stack: error.stack });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const { role, email } = req.query;
    const whereClause = { status: 'active' };

    // If user is not admin, show suggestions based on email
    if (role !== 'admin' && email) {
      const user = await users.findOne({
        where: { email }
      });
      
      if (user) {
        whereClause.user_id = user.id;
      }
    }

    const activeSuggestions = await suggestions.findAll({
      where: whereClause,
      include: [
        {
          model: users,
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: activeSuggestions
    });
  } catch (error) {
    logError('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions'
    });
  }
};

const getArchivedSuggestions = async (req, res) => {
  try {
    const archivedSuggestions = await suggestions.findAll({
      where: {
        status: 'inactive'
      },
      paranoid: false,
      include: [
        {
          model: users,
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: archivedSuggestions
    });
  } catch (error) {
    logError('Error fetching archived suggestions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const suggestion = await suggestions.findByPk(id);
    
    if (!suggestion) {
      return res.status(404).json({ success: false, error: 'Suggestion not found' });
    }
    
    // Set is_active based on status if status is being updated
    if (req.body.status) {
      req.body.is_active = req.body.status === 'active' ? 1 : 0;
    }
    
    await suggestion.update(req.body);
    
    res.json({
      success: true,
      message: 'Suggestion updated successfully',
      data: suggestion
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const suggestion = await suggestions.findByPk(id);
  
    if (!suggestion) {
      return res.status(404).json({ success: false, error: 'Suggestion not found' });
    }

    // Update status to inactive and is_active to 0, then soft delete
    await suggestion.update({ 
      status: 'inactive',
      is_active: 0 
    });
    await suggestion.destroy(); // This will set deletedAt due to paranoid: true
    
    res.json({
      success: true,
      message: 'Suggestion archived successfully'
    });
  } catch (error) {
    logError('Error archiving suggestion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const restoreSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the deleted suggestion
    const suggestion = await suggestions.findOne({
      where: { id },
      paranoid: false // This allows us to find soft-deleted records
    });

    if (!suggestion) {
      return res.status(404).json({ success: false, error: 'Suggestion not found' });
    }

    // Restore the suggestion and set it as active
    await suggestion.restore();
    await suggestion.update({ 
      status: 'active',
      is_active: 1
    });

    res.json({
      success: true,
      message: 'Suggestion restored successfully',
      data: suggestion
    });
  } catch (error) {
    logError('Error restoring suggestion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const permanentlyDeleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, delete related records in permissionsSuggestions
    await permissionsSuggestions.destroy({
      where: { suggestion_id: id },
      force: true
    });

    // Then find and delete the suggestion
    const suggestion = await suggestions.findOne({
      where: { id },
      paranoid: false // Include soft-deleted records
    });

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'Suggestion not found'
      });
    }

    // Now perform hard delete on the suggestion
    await suggestions.destroy({
      where: { id },
      force: true // This enables hard delete
    });

    res.json({
      success: true,
      message: 'Suggestion permanently deleted'
    });
  } catch (error) {
    logError('Error permanently deleting suggestion:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete suggestion permanently'
    });
  }
};

const checkExistingUser = async (req, res) => {
  try {
    const { name, email } = req.query;
    
    const user = await users.findOne({
      where: {
        [Op.or]: [
          { name },
          { email }
        ]
      },
      include: [{
        model: suggestions,
        where: { status: 'active' },
        required: false,
        include: [{
          model: users,
          attributes: ['id', 'name', 'email']
        }]
      }]
    });

    res.json({
      success: true,
      data: user ? {
        exists: true,
        suggestions: user.suggestions,
        user: {
          name: user.name,
          email: user.email
        }
      } : {
        exists: false,
        suggestions: []
      }
    });
  } catch (error) {
    logError('Error checking existing user:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking existing user'
    });
  }
};

module.exports = {
  createSuggestion,
  getSuggestions,
  getArchivedSuggestions,
  updateSuggestion,
  deleteSuggestion,
  restoreSuggestion,
  permanentlyDeleteSuggestion,
  checkExistingUser
}; 
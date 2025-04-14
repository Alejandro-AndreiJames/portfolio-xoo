const db = require('../models');
const { suggestions, users, roles, courses, permissions, permissionsSuggestions } = db;

const createSuggestion = async (req, res) => {
  try {
    console.log('Received suggestion submission:', req.body);
    
    // First, find or create the user
    const [user, userCreated] = await users.findOrCreate({
      where: { email: req.body.email },
      defaults: {
        name: req.body.name,
        role_id: req.body.role_id || 2 // Default to role_id 2 (student) if not provided
      }
    });
    
    console.log('User found or created:', user.id, 'New user:', userCreated);

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
      console.log('Course found or created:', course.id, 'New course:', courseCreated);
    }

    // Then create the suggestion linked to this user
    const suggestion = await suggestions.create({
      user_id: user.id,
      message: req.body.message,
      status: 'active'  // Default to active
    });
    
    console.log('Suggestion created:', suggestion.id);

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
      
      console.log('Permission-Suggestion association created');
    }

    res.status(201).json({
      success: true,
      message: 'Suggestion submitted successfully',
      data: {
        id: suggestion.id,
        message: suggestion.message,
        status: suggestion.status,
        userName: user.name,
        userEmail: user.email,
        courseId: courseId
      }
    });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(400).json({ success: false, error: error.message, stack: error.stack });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const { userId, role } = req.query;
    const whereClause = { status: 'active' };

    // If user is not admin and userId is provided, only show their suggestions
    if (role !== 'admin' && userId) {
      whereClause.user_id = userId;
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
    console.error('Error fetching suggestions:', error);
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
    console.error('Error fetching archived suggestions:', error);
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

    // Update status to inactive and soft delete
    await suggestion.update({ status: 'inactive' });
    await suggestion.destroy(); // This will set deletedAt due to paranoid: true
    
    res.json({
      success: true,
      message: 'Suggestion archived successfully'
    });
  } catch (error) {
    console.error('Error archiving suggestion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const restoreSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First restore the soft-deleted record
    await suggestions.restore({
      where: { id }
    });
    
    // Then update the status to active
    const suggestion = await suggestions.findByPk(id);
    if (!suggestion) {
      return res.status(404).json({ success: false, error: 'Suggestion not found' });
    }
    
    await suggestion.update({ status: 'active' });
    
    res.json({
      success: true,
      message: 'Suggestion restored successfully',
      data: suggestion
    });
  } catch (error) {
    console.error('Error restoring suggestion:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const permanentlyDeleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const suggestion = await suggestions.findOne({
      where: { id },
      paranoid: false
    });
    
    if (!suggestion) {
      return res.status(404).json({ success: false, error: 'Suggestion not found' });
    }

    await suggestion.destroy({ force: true });
    
    res.json({
      success: true,
      message: 'Suggestion permanently deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createSuggestion,
  getSuggestions,
  getArchivedSuggestions,
  updateSuggestion,
  deleteSuggestion,
  restoreSuggestion,
  permanentlyDeleteSuggestion
}; 
const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');

// POST - Create a new suggestion (Contact form submission)
router.post('/suggestions', suggestionController.createSuggestion);

// GET - Get all active suggestions
router.get('/suggestions', suggestionController.getSuggestions);

// GET - Get archived suggestions
router.get('/suggestions/archived', suggestionController.getArchivedSuggestions);

// PUT - Update a suggestion
router.put('/suggestions/:id', suggestionController.updateSuggestion);

// DELETE - Soft delete a suggestion (archive)
router.delete('/suggestions/:id', suggestionController.deleteSuggestion);

// PUT - Restore a soft-deleted suggestion
router.put('/suggestions/:id/restore', suggestionController.restoreSuggestion);

// DELETE - Permanently delete a suggestion
router.delete('/suggestions/:id/permanent', suggestionController.permanentlyDeleteSuggestion);

module.exports = router; 
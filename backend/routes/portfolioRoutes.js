const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const suggestionController = require('../controllers/suggestionController');

// Portfolio routes
router.get('/portfolio', portfolioController.getPortfolioData);
router.get('/hero', portfolioController.getHero);
router.get('/projects', portfolioController.getProjects);
router.get('/hobbies', portfolioController.getHobbies);

// Suggestion routes
router.get('/suggestions', suggestionController.getSuggestions);
router.get('/suggestions/archived', suggestionController.getArchivedSuggestions);
router.post('/suggestions', suggestionController.createSuggestion);
router.put('/suggestions/:id', suggestionController.updateSuggestion);
router.delete('/suggestions/:id', suggestionController.deleteSuggestion);
router.post('/suggestions/:id/restore', suggestionController.restoreSuggestion);
router.delete('/suggestions/:id/permanent', suggestionController.permanentlyDeleteSuggestion);

module.exports = router;
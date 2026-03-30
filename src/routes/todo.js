const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/todos/generate
router.post('/generate', aiController.generateTodoMate);

module.exports = router;
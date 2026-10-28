const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', requireAuth, authController.getCurrentUser);
router.get('/demo-credentials', authController.getDemoCredentials);

module.exports = router;

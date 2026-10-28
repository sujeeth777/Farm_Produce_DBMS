const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/dashboard-summary', salesController.getDashboardSummary);
router.get('/', optionalAuth, salesController.getAllSales);
router.post('/', optionalAuth, salesController.recordSale);

module.exports = router;

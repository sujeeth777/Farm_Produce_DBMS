const express = require('express');
const router = express.Router();
const produceController = require('../controllers/produceController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, produceController.getAllProduce);
router.get('/categories', produceController.getAllCategories);
router.get('/:id', optionalAuth, produceController.getProduceById);
router.post('/', optionalAuth, produceController.createProduce);
router.put('/:id', optionalAuth, produceController.updateProduce);
router.delete('/:id', optionalAuth, produceController.deleteProduce);

module.exports = router;

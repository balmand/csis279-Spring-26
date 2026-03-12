const { Router } = require('express');
const StockAdjustmentController = require('../controllers/StockAdjustmentController');
const { stockAdjustmentRules } = require('../validators/stockValidators');

const router = Router();

router.get('/', StockAdjustmentController.getAll);
router.get('/item/:itemId', StockAdjustmentController.getByItemId);
router.post('/', stockAdjustmentRules, StockAdjustmentController.create);

module.exports = router;

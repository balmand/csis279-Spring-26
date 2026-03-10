const { Router } = require('express');
const TransactionController = require('../controllers/TransactionController');

const router = Router();

router.get('/', TransactionController.getAll);
router.get('/order/:orderId', TransactionController.getByOrderId);

module.exports = router;

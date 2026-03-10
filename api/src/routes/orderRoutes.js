const { Router } = require('express');
const OrderController = require('../controllers/OrderController');
const { orderRules, orderItemRules } = require('../validators/orderValidators');

const router = Router();

router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);
router.post('/', orderRules, OrderController.create);
router.put('/:id', orderRules, OrderController.update);
router.post('/:id/complete', OrderController.complete);
router.post('/:id/items', orderItemRules, OrderController.addItem);
router.delete('/:id', OrderController.remove);

module.exports = router;

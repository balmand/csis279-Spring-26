const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const orderRules = [
    body('client_id').isInt({ min: 1 }).withMessage('Client ID must be a positive integer'),
    body('order_status').optional().isIn(['pending', 'processing', 'completed', 'cancelled'])
        .withMessage('Status must be one of: pending, processing, completed, cancelled'),
    validate,
];

const orderItemRules = [
    body('item_id').isInt({ min: 1 }).withMessage('Item ID must be a positive integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validate,
];

module.exports = { orderRules, orderItemRules };

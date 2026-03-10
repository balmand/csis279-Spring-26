const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const stockAdjustmentRules = [
    body('item_id').isInt({ min: 1 }).withMessage('Item ID must be a positive integer'),
    body('quantity_change').isInt().withMessage('Quantity change must be an integer'),
    body('reason').trim().notEmpty().withMessage('Reason is required'),
    validate,
];

module.exports = { stockAdjustmentRules };

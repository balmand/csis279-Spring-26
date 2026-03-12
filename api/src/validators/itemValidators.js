const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const itemRules = [
    body('item_name').trim().notEmpty().withMessage('Item name is required'),
    body('item_sku').trim().notEmpty().withMessage('SKU is required'),
    body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
    body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
    body('product_id').optional().isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
    validate,
];

module.exports = { itemRules };

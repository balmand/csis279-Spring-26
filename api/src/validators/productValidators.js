const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const productRules = [
    body('product_name').trim().notEmpty().withMessage('Product name is required'),
    body('product_description').optional().isString(),
    body('category').optional().isString(),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    validate,
];

module.exports = { productRules };

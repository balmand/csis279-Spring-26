const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const clientRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    validate,
];

module.exports = { clientRules };

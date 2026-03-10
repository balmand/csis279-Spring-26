const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const registerRules = [
    body('client_name').trim().notEmpty().withMessage('Name is required'),
    body('client_email').trim().isEmail().withMessage('Valid email is required'),
    body('client_dob').optional().isDate().withMessage('Date of birth must be a valid date'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate,
];

const loginRules = [
    body('client_email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
];

module.exports = { registerRules, loginRules };

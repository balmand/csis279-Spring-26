const { body } = require('express-validator');
const validate = require("../middlewares/validate");

const employeeRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('email is required'),
    body('role').trim().notEmpty().withMessage('Role is required'),
    validate,
];

module.exports = { employeeRules };
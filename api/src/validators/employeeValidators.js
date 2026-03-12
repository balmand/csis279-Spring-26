const { body } = require('express-validator');
const validate = require("../middlewares/validate");

const employeeRules = [
    body('employee_name').trim().notEmpty().withMessage('Name is required'),
    body('employee_email').trim().isEmail().withMessage('email is required'),
    body('employee_role').trim().notEmpty().withMessage('Role is required'),
    validate,
];

module.exports = { employeeRules };
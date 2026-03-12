const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const departmentRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    validate,
];

module.exports = { departmentRules };

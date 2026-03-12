const { query } = require('express-validator');
const validate = require('../middlewares/validate');

const salesDashboardQueryRules = [
    query('startDate').optional().isISO8601({ strict: true }).withMessage('startDate must be a valid date'),
    query('endDate').optional().isISO8601({ strict: true }).withMessage('endDate must be a valid date'),
    query('employeeId').optional().isInt({ min: 1 }).withMessage('employeeId must be a positive integer'),
    query('itemId').optional().isInt({ min: 1 }).withMessage('itemId must be a positive integer'),
    query('category').optional().trim().notEmpty().withMessage('category cannot be empty'),
    query('bucket').optional().isIn(['day', 'week', 'month']).withMessage('bucket must be day, week, or month'),
    query('lowSalesThreshold').optional().isInt({ min: 0 }).withMessage('lowSalesThreshold must be a non-negative integer'),
    validate,
];

module.exports = { salesDashboardQueryRules };

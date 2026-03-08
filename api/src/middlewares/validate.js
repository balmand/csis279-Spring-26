const { validationResult } = require('express-validator');
const ApiError = require('./ApiError');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const details = {};
        errors.array().forEach((err) => {
            details[err.path] = err.msg;
        });
        throw ApiError.badRequest('Validation failed', details);
    }
    next();
};

module.exports = validate;

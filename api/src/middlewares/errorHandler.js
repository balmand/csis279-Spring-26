const ApiError = require('./ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
            details: err.details,
        });
    }

    console.error(err);
    return res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        details: {},
    });
};

module.exports = errorHandler;

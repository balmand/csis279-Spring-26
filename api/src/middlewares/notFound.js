const ApiError = require('./ApiError');

const notFound = (req, res, next) => {
    next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

module.exports = notFound;

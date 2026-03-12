class ApiError extends Error {
    constructor(statusCode, code, message, details = {}) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }

    static badRequest(message, details = {}) {
        return new ApiError(400, 'BAD_REQUEST', message, details);
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, 'UNAUTHORIZED', message);
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, 'FORBIDDEN', message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, 'NOT_FOUND', message);
    }

    static conflict(message, details = {}) {
        return new ApiError(409, 'CONFLICT', message, details);
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, 'INTERNAL_ERROR', message);
    }
}

module.exports = ApiError;

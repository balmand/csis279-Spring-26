const pool = require('../config/db');
const ApiError = require('./ApiError');

const requireAdmin = async (req, res, next) => {
    try {
        const headerValue = req.headers['x-client-id'];
        const clientId = Number.parseInt(headerValue, 10);

        if (Number.isNaN(clientId) || clientId < 1) {
            throw ApiError.unauthorized('Admin authentication is required');
        }

        const result = await pool.query(
            'SELECT role FROM clients WHERE client_id = $1',
            [clientId]
        );

        const client = result.rows[0];
        if (!client) {
            throw ApiError.unauthorized('Invalid user context');
        }

        if (client.role !== 'admin') {
            throw ApiError.forbidden('Admin access is required');
        }

        req.authenticatedClientId = clientId;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = requireAdmin;

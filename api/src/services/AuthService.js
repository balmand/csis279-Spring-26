const bcrypt = require('bcryptjs');
const ClientRepository = require('../repositories/ClientRepository');
const ApiError = require('../middlewares/ApiError');

const SALT_ROUNDS = 10;
const ALLOWED_ROLES = new Set(['admin', 'employee', 'customer']);

class AuthService {
    static async register({ client_name, client_email, client_dob, password, role }) {
        const existing = await ClientRepository.findByEmail(client_email);
        if (existing) {
            throw ApiError.conflict('Email already registered', { client_email: 'Email is already in use' });
        }

        const normalizedRole = (role || 'customer').toLowerCase();
        if (!ALLOWED_ROLES.has(normalizedRole)) {
            throw ApiError.badRequest('Role must be admin, employee, or customer');
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        return ClientRepository.create({ client_name, client_email, client_dob, password_hash, role: normalizedRole });
    }

    static async login({ client_email, password }) {
        const client = await ClientRepository.findByEmail(client_email);
        if (!client) {
            throw ApiError.unauthorized('Invalid email or password.');
        }
        const match = await bcrypt.compare(password, client.password_hash);
        if (!match) {
            throw ApiError.unauthorized('Invalid email or password.');
        }
        const { password_hash, ...safeClient } = client;
        return safeClient;
    }
}

module.exports = AuthService;

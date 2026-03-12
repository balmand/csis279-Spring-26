const pool = require('../config/db');

class ClientRepository {
    static async findAll() {
        const result = await pool.query(
            'SELECT client_id, client_name, client_email, client_dob, role FROM clients ORDER BY client_id ASC'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT client_id, client_name, client_email, client_dob, role FROM clients WHERE client_id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async findByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM clients WHERE client_email = $1',
            [email]
        );
        return result.rows[0] || null;
    }

    static async create({ client_name, client_email, client_dob, password_hash, role }) {
        const result = await pool.query(
            `INSERT INTO clients (client_name, client_email, client_dob, password_hash, role)
             VALUES ($1, $2, $3, $4, COALESCE($5, 'customer'))
             RETURNING client_id, client_name, client_email, client_dob, role`,
            [client_name, client_email, client_dob || null, password_hash || '', role || null]
        );
        return result.rows[0];
    }

    static async update(id, { client_name, client_email }) {
        const result = await pool.query(
            `UPDATE clients SET client_name = $1, client_email = $2, updated_at = NOW()
             WHERE client_id = $3
             RETURNING client_id, client_name, client_email, client_dob, role`,
            [client_name, client_email, id]
        );
        return result.rows[0] || null;
    }

    static async remove(id) {
        const result = await pool.query(
            'DELETE FROM clients WHERE client_id = $1', [id]
        );
        return result.rowCount > 0;
    }
}

module.exports = ClientRepository;

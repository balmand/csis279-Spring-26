const pool = require('../config/db');

class DepartmentRepository {
    static async findAll() {
        const result = await pool.query(
            'SELECT * FROM departments ORDER BY dep_id ASC'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM departments WHERE dep_id = $1', [id]
        );
        return result.rows[0] || null;
    }

    static async create({ dep_name }) {
        const result = await pool.query(
            'INSERT INTO departments (dep_name) VALUES ($1) RETURNING *',
            [dep_name]
        );
        return result.rows[0];
    }

    static async update(id, { dep_name }) {
        const result = await pool.query(
            `UPDATE departments SET dep_name = $1, updated_at = NOW()
             WHERE dep_id = $2 RETURNING *`,
            [dep_name, id]
        );
        return result.rows[0] || null;
    }

    static async remove(id) {
        const result = await pool.query(
            'DELETE FROM departments WHERE dep_id = $1', [id]
        );
        return result.rowCount > 0;
    }
}

module.exports = DepartmentRepository;

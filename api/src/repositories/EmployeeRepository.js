const pool = require('../config/db');

class EmployeeRepository {
    static async getAll() {
        const result = await pool.query(
            `SELECT
                client_id AS employee_id,
                client_name AS employee_name,
                client_email AS employee_email,
                role AS employee_role,
                client_dob AS employee_dob,
                NULL::INTEGER AS employee_department
            FROM clients
            WHERE role IN ('employee', 'admin')
            ORDER BY client_id ASC`
        );
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(
            `SELECT
                client_id AS employee_id,
                client_name AS employee_name,
                client_email AS employee_email,
                role AS employee_role,
                client_dob AS employee_dob,
                NULL::INTEGER AS employee_department
            FROM clients
            WHERE client_id = $1 AND role IN ('employee', 'admin')`,
            [id]
        );

        return result.rows[0] || null;
    }

    static async create({ employee_name, employee_email, employee_role, employee_dob }) {
        const result = await pool.query(
            `INSERT INTO clients (client_name, client_email, role, client_dob, password_hash)
             VALUES ($1, $2, $3, $4, '')
             RETURNING
                client_id AS employee_id,
                client_name AS employee_name,
                client_email AS employee_email,
                role AS employee_role,
                client_dob AS employee_dob,
                NULL::INTEGER AS employee_department`,
            [employee_name, employee_email, employee_role, employee_dob || null]
        );
        return result.rows[0];
    }

    static async update(id, { employee_name, employee_email, employee_role, employee_dob }) {
        const result = await pool.query(
            `UPDATE clients
             SET client_name = $1,
                 client_email = $2,
                 role = $3,
                 client_dob = $4,
                 updated_at = NOW()
             WHERE client_id = $5 AND role IN ('employee', 'admin')
             RETURNING
                client_id AS employee_id,
                client_name AS employee_name,
                client_email AS employee_email,
                role AS employee_role,
                client_dob AS employee_dob,
                NULL::INTEGER AS employee_department`,
                [employee_name, employee_email, employee_role, employee_dob || null, id]
        );
        return result.rows[0] || null;
    }

    static async remove(id) {
        const result = await pool.query(
            `DELETE FROM clients WHERE client_id = $1 AND role IN ('employee', 'admin')`,
            [id]
        );
        return result.rowCount > 0;
    }
}


module.exports = EmployeeRepository;

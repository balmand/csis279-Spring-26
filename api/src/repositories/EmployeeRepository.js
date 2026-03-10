const pool = require('../config/db');

class EmployeeRepository {
    static async findAll() {
        const result = await pool.query(
            'SELECT * FROM employees ORDER BY employee_id ASC'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT * FROM EMPLOYEES WHERE employee_id = $1`, [id]
        );

        return result.rows[0] || null;
    }

    static async create({ employee_name, employee_email, employee_role }) {
        const result = await pool.query(
            'INSERT INTO employees (employee_name, employee_email, employee_role) VALUES ($1, $2, $3) RETURNING *',
            [employee_name, employee_email, employee_role]
        );
        return result.rows[0];
    }

    static async update(id, { employee_name }) {
        const result = await pool.query(
            `UPDATE employees SET employee_name = $1, employee_email = $2, employee_role = $3
                WHERE employee_id = $4 RETURNING *`,
                [employee_name, employee_email, employee_role, id]
        );
        return result.rows[0] || null;
    }

    static async remove(id) {
        const result = await pool.query(
            `DELETE FROM employees WHERE employee_id = $1`, [id]
        );
        return result.rowCount > 0;
    }
}


module.exports = EmployeeRepository;
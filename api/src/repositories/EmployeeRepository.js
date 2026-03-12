const pool = require('../config/db');

class EmployeeRepository {
    static async getAll() {
        const result = await pool.query(
            'SELECT * FROM employees ORDER BY employee_id ASC'
        );
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(
            `SELECT * FROM EMPLOYEES WHERE employee_id = $1`, [id]
        );

        return result.rows[0] || null;
    }

    static async create({ employee_name, employee_email, employee_role, employee_dob, employee_department}) {
        const result = await pool.query(
            'INSERT INTO employees (employee_name, employee_email, employee_role, employee_dob, employee_department) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [employee_name, employee_email, employee_role, employee_dob, employee_department]
        );
        console.log(result);
        return result.rows[0];
    }

    static async update(id, { employee_name, employee_email, employee_role }) {
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
const pool = require('../config/db');

class OrderRepository {
    static async findAll({ page = 1, limit = 10, sortBy = 'order_id', sortDir = 'ASC' } = {}) {
        const offset = (page - 1) * limit;
        const validSortCols = ['order_id', 'client_id', 'order_date', 'order_total', 'order_status', 'completed_at', 'created_at', 'updated_at'];
        const validSortDirs = ['ASC', 'DESC'];
        
        const sortColumn = validSortCols.includes(sortBy) ? sortBy : 'order_id';
        const sortDirection = validSortDirs.includes(sortDir.toUpperCase()) ? sortDir.toUpperCase() : 'ASC';

        const countResult = await pool.query('SELECT COUNT(*) FROM orders');
        const total = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(
            `SELECT * FROM orders ORDER BY ${sortColumn} ${sortDirection} LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            data: result.rows,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        };
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM orders WHERE order_id = $1', [id]
        );
        return result.rows[0] || null;
    }

    static async findByClientId(clientId) {
        const result = await pool.query(
            'SELECT * FROM orders WHERE client_id = $1 ORDER BY order_date DESC',
            [clientId]
        );
        return result.rows;
    }

    static async create({ client_id, employee_id, order_date, order_total, order_status }) {
        const result = await pool.query(
            `INSERT INTO orders (client_id, employee_id, order_date, order_total, order_status)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [client_id, employee_id || null, order_date || new Date(), order_total || 0, order_status || 'pending']
        );
        return result.rows[0];
    }

    static async update(id, { order_total, order_status, employee_id }) {
        const result = await pool.query(
            `UPDATE orders
             SET order_total = COALESCE($1, order_total),
                 order_status = COALESCE($2, order_status),
                 employee_id = COALESCE($3, employee_id),
                 updated_at = NOW()
             WHERE order_id = $4 RETURNING *`,
            [order_total ?? null, order_status ?? null, employee_id ?? null, id]
        );
        return result.rows[0] || null;
    }

    static async markCompleted(id) {
        const result = await pool.query(
            `UPDATE orders SET order_status = 'completed', completed_at = NOW(), updated_at = NOW()
             WHERE order_id = $1 AND order_status != 'completed'
             RETURNING *`,
            [id]
        );
        return result.rows[0] || null;
    }

    static async remove(id) {
        const result = await pool.query(
            'DELETE FROM orders WHERE order_id = $1', [id]
        );
        return result.rowCount > 0;
    }
}

module.exports = OrderRepository;

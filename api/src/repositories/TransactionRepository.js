const pool = require('../config/db');

class TransactionRepository {
    static async findAll({ page = 1, limit = 10, sortBy = 'created_at', sortDir = 'DESC' } = {}) {
        const offset = (page - 1) * limit;
        const validSortCols = ['transaction_id', 'order_id', 'amount', 'transaction_type', 'created_at'];
        const validSortDirs = ['ASC', 'DESC'];
        
        const sortColumn = validSortCols.includes(sortBy) ? sortBy : 'created_at';
        const sortDirection = validSortDirs.includes(sortDir.toUpperCase()) ? sortDir.toUpperCase() : 'DESC';

        const countResult = await pool.query('SELECT COUNT(*) FROM transactions');
        const total = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(
            `SELECT * FROM transactions ORDER BY ${sortColumn} ${sortDirection} LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            data: result.rows,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        };
    }

    static async findByOrderId(orderId) {
        const result = await pool.query(
            'SELECT * FROM transactions WHERE order_id = $1 ORDER BY created_at DESC',
            [orderId]
        );
        return result.rows;
    }

    static async create({ order_id, amount, transaction_type }) {
        const result = await pool.query(
            `INSERT INTO transactions (order_id, amount, transaction_type)
             VALUES ($1, $2, $3) RETURNING *`,
            [order_id, amount, transaction_type || 'payment']
        );
        return result.rows[0];
    }
}

module.exports = TransactionRepository;

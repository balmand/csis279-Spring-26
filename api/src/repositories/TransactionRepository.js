const pool = require('../config/db');

class TransactionRepository {
    static async findAll() {
        const result = await pool.query(
            'SELECT * FROM transactions ORDER BY created_at DESC'
        );
        return result.rows;
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

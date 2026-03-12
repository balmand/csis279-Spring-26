const pool = require('../config/db');

class StockAdjustmentRepository {
    static async findAll() {
        const result = await pool.query(
            'SELECT * FROM stock_adjustments ORDER BY created_at DESC'
        );
        return result.rows;
    }

    static async findByItemId(itemId) {
        const result = await pool.query(
            'SELECT * FROM stock_adjustments WHERE item_id = $1 ORDER BY created_at DESC',
            [itemId]
        );
        return result.rows;
    }

    static async create({ item_id, quantity_change, reason, reference_type, reference_id }) {
        const result = await pool.query(
            `INSERT INTO stock_adjustments (item_id, quantity_change, reason, reference_type, reference_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [item_id, quantity_change, reason, reference_type || null, reference_id || null]
        );
        return result.rows[0];
    }
}

module.exports = StockAdjustmentRepository;

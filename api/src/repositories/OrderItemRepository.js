const pool = require('../config/db');

class OrderItemRepository {
    static async findByOrderId(orderId) {
        const result = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1 ORDER BY order_item_id ASC',
            [orderId]
        );
        return result.rows;
    }

    static async create({ order_id, item_id, quantity, unit_price, unit_cost }) {
        const result = await pool.query(
            `INSERT INTO order_items (order_id, item_id, quantity, unit_price, unit_cost)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [order_id, item_id, quantity, unit_price, unit_cost || 0]
        );
        return result.rows[0];
    }

    static async remove(id) {
        const result = await pool.query(
            'DELETE FROM order_items WHERE order_item_id = $1', [id]
        );
        return result.rowCount > 0;
    }

    static async removeByOrderId(orderId) {
        const result = await pool.query(
            'DELETE FROM order_items WHERE order_id = $1', [orderId]
        );
        return result.rowCount;
    }
}

module.exports = OrderItemRepository;

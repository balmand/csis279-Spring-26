const pool = require('../config/db');

class ItemRepository {
    static async findAll() {
        const result = await pool.query(
            'SELECT * FROM items ORDER BY item_id ASC'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM items WHERE item_id = $1', [id]
        );
        return result.rows[0] || null;
    }

    static async findBySku(sku) {
        const result = await pool.query(
            'SELECT * FROM items WHERE item_sku = $1', [sku]
        );
        return result.rows[0] || null;
    }

    static async create({ product_id, item_name, item_sku, unit_price, stock_quantity }) {
        const result = await pool.query(
            `INSERT INTO items (product_id, item_name, item_sku, unit_price, stock_quantity)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [product_id || null, item_name, item_sku, unit_price, stock_quantity || 0]
        );
        return result.rows[0];
    }

    static async update(id, { product_id, item_name, item_sku, unit_price, stock_quantity }) {
        const result = await pool.query(
            `UPDATE items
             SET product_id = $1, item_name = $2, item_sku = $3,
                 unit_price = $4, stock_quantity = $5, updated_at = NOW()
             WHERE item_id = $6 RETURNING *`,
            [product_id, item_name, item_sku, unit_price, stock_quantity, id]
        );
        return result.rows[0] || null;
    }

    static async adjustStock(id, quantityChange, client) {
        const result = await pool.query(
            `UPDATE items SET stock_quantity = stock_quantity + $1, updated_at = NOW()
             WHERE item_id = $2 RETURNING *`,
            [quantityChange, id]
        );
        return result.rows[0] || null;
    }

    static async remove(id) {
        const result = await pool.query(
            'DELETE FROM items WHERE item_id = $1', [id]
        );
        return result.rowCount > 0;
    }
}

module.exports = ItemRepository;

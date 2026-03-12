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

    static async create({ product_id, item_name, item_sku, unit_price, unit_cost, stock_quantity }) {
        const result = await pool.query(
            `INSERT INTO items (product_id, item_name, item_sku, unit_price, unit_cost, stock_quantity)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [product_id || null, item_name, item_sku, unit_price, unit_cost || 0, stock_quantity || 0]
        );
        return result.rows[0];
    }

    static async update(id, { product_id, item_name, item_sku, unit_price, unit_cost, stock_quantity }) {
        const result = await pool.query(
            `UPDATE items
             SET product_id = COALESCE($1, product_id),
                 item_name = COALESCE($2, item_name),
                 item_sku = COALESCE($3, item_sku),
                 unit_price = COALESCE($4, unit_price),
                 unit_cost = COALESCE($5, unit_cost),
                 stock_quantity = COALESCE($6, stock_quantity),
                 updated_at = NOW()
             WHERE item_id = $7 RETURNING *`,
            [product_id ?? null, item_name ?? null, item_sku ?? null, unit_price ?? null, unit_cost ?? null, stock_quantity ?? null, id]
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

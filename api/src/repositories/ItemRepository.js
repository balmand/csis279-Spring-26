const pool = require('../config/db');

class ItemRepository {
    static async findAll({ page = 1, limit = 10, sortBy = 'item_id', sortDir = 'ASC' } = {}) {
        const offset = (page - 1) * limit;
        const validSortCols = ['item_id', 'product_id', 'item_name', 'item_sku', 'unit_price', 'stock_quantity', 'created_at', 'updated_at'];
        const validSortDirs = ['ASC', 'DESC'];
        
        const sortColumn = validSortCols.includes(sortBy) ? sortBy : 'item_id';
        const sortDirection = validSortDirs.includes(sortDir.toUpperCase()) ? sortDir.toUpperCase() : 'ASC';

        const countResult = await pool.query('SELECT COUNT(*) FROM items');
        const total = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(
            `SELECT * FROM items ORDER BY ${sortColumn} ${sortDirection} LIMIT $1 OFFSET $2`,
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

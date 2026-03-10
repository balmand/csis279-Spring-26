const pool = require('../config/db');

class ProductRepository {
    static async findAll() {
        const result = await pool.query(
            'SELECT * FROM products ORDER BY product_id ASC'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM products WHERE product_id = $1', [id]
        );
        return result.rows[0] || null;
    }

    static async create({ product_name, product_description, category, is_active }) {
        const result = await pool.query(
            `INSERT INTO products (product_name, product_description, category, is_active)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [product_name, product_description || null, category || null, is_active !== false]
        );
        return result.rows[0];
    }

    static async update(id, { product_name, product_description, category, is_active }) {
        const result = await pool.query(
            `UPDATE products
             SET product_name = $1, product_description = $2, category = $3,
                 is_active = $4, updated_at = NOW()
             WHERE product_id = $5 RETURNING *`,
            [product_name, product_description, category, is_active, id]
        );
        return result.rows[0] || null;
    }

    static async remove(id) {
        const result = await pool.query(
            'DELETE FROM products WHERE product_id = $1', [id]
        );
        return result.rowCount > 0;
    }
}

module.exports = ProductRepository;

const pool = require("../config/db");

class OrderRepository {
  static async findAll() {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY order_id ASC",
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      "SELECT * FROM orders WHERE order_id = $1",
      [id],
    );
    return result.rows[0] || null;
  }

  static async findByClientId(clientId) {
    const result = await pool.query(
      "SELECT * FROM orders WHERE client_id = $1 ORDER BY order_date DESC",
      [clientId],
    );
    return result.rows;
  }

  static async create({ client_id, order_date, order_total, order_status }) {
    const result = await pool.query(
      `INSERT INTO orders (client_id, order_date, order_total, order_status)
             VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        client_id,
        order_date || new Date(),
        order_total || 0,
        order_status || "pending",
      ],
    );
    return result.rows[0];
  }

  static async update(id, { order_total, order_status }) {
    const result = await pool.query(
      `UPDATE orders SET order_total = $1, order_status = $2, updated_at = NOW()
             WHERE order_id = $3 RETURNING *`,
      [order_total, order_status, id],
    );
    return result.rows[0] || null;
  }

  static async markCompleted(id) {
    const result = await pool.query(
      `UPDATE orders SET order_status = 'completed', completed_at = NOW(), updated_at = NOW()
             WHERE order_id = $1 AND order_status != 'completed'
             RETURNING *`,
      [id],
    );
    return result.rows[0] || null;
  }

  static async remove(id) {
    const result = await pool.query("DELETE FROM orders WHERE order_id = $1", [
      id,
    ]);
    return result.rowCount > 0;
  }
}

module.exports = OrderRepository;

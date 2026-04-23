import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { DatabaseService } from '../database/database.service';

type SalesFilters = {
  startDate: string | null;
  endDate: string | null;
  employeeId: number | null;
  itemId: number | null;
  category: string | null;
  lowSalesThreshold: number;
  bucket: string;
};

@Injectable()
export class AppDataService {
  constructor(private readonly db: DatabaseService) {}

  async getClients() {
    const result = await this.db.query(
      'SELECT client_id, client_name, client_email, client_dob, role FROM clients ORDER BY client_id ASC',
    );
    return result.rows;
  }

  async getClient(id: number) {
    const result = await this.db.query(
      'SELECT client_id, client_name, client_email, client_dob, role FROM clients WHERE client_id = $1',
      [id],
    );
    const client = result.rows[0];
    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }
    return client;
  }

  async saveClient(input: { name: string; email: string }, id?: number) {
    if (id) {
      const result = await this.db.query(
        `UPDATE clients
         SET client_name = $1, client_email = $2, updated_at = NOW()
         WHERE client_id = $3
         RETURNING client_id, client_name, client_email, client_dob, role`,
        [input.name, input.email, id],
      );
      const client = result.rows[0];
      if (!client) {
        throw new NotFoundException(`Client with id ${id} not found`);
      }
      return client;
    }

    const result = await this.db.query(
      `INSERT INTO clients (client_name, client_email, password_hash, role)
       VALUES ($1, $2, '', 'customer')
       RETURNING client_id, client_name, client_email, client_dob, role`,
      [input.name, input.email],
    );
    return result.rows[0];
  }

  async deleteClient(id: number) {
    const result = await this.db.query('DELETE FROM clients WHERE client_id = $1', [id]);
    if (result.rowCount === 0) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }
  }

  async getDepartments() {
    const result = await this.db.query('SELECT * FROM departments ORDER BY dep_id ASC');
    return result.rows;
  }

  async getDepartment(id: number) {
    const result = await this.db.query('SELECT * FROM departments WHERE dep_id = $1', [id]);
    const department = result.rows[0];
    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return department;
  }

  async saveDepartment(input: { name: string }, id?: number) {
    if (id) {
      const result = await this.db.query(
        `UPDATE departments SET dep_name = $1, updated_at = NOW()
         WHERE dep_id = $2 RETURNING *`,
        [input.name, id],
      );
      const department = result.rows[0];
      if (!department) {
        throw new NotFoundException(`Department with id ${id} not found`);
      }
      return department;
    }

    const result = await this.db.query(
      'INSERT INTO departments (dep_name) VALUES ($1) RETURNING *',
      [input.name],
    );
    return result.rows[0];
  }

  async deleteDepartment(id: number) {
    const result = await this.db.query('DELETE FROM departments WHERE dep_id = $1', [id]);
    if (result.rowCount === 0) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
  }

  async getEmployees() {
    const result = await this.db.query(
      `SELECT
        client_id AS employee_id,
        client_name AS employee_name,
        client_email AS employee_email,
        role AS employee_role,
        client_dob AS employee_dob,
        NULL::INTEGER AS employee_department
      FROM clients
      WHERE role IN ('employee', 'admin')
      ORDER BY client_id ASC`,
    );
    return result.rows;
  }

  async getEmployee(id: number) {
    const result = await this.db.query(
      `SELECT
        client_id AS employee_id,
        client_name AS employee_name,
        client_email AS employee_email,
        role AS employee_role,
        client_dob AS employee_dob,
        NULL::INTEGER AS employee_department
      FROM clients
      WHERE client_id = $1 AND role IN ('employee', 'admin')`,
      [id],
    );
    const employee = result.rows[0];
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} was not found`);
    }
    return employee;
  }

  async saveEmployee(
    input: {
      employee_name: string;
      employee_email: string;
      employee_role: string;
      employee_dob: string;
      employee_department: number;
    },
    id?: number,
  ) {
    if (id) {
      const result = await this.db.query(
        `UPDATE clients
         SET client_name = $1, client_email = $2, role = $3, client_dob = $4, updated_at = NOW()
         WHERE client_id = $5 AND role IN ('employee', 'admin')
         RETURNING
           client_id AS employee_id,
           client_name AS employee_name,
           client_email AS employee_email,
           role AS employee_role,
           client_dob AS employee_dob,
           NULL::INTEGER AS employee_department`,
        [input.employee_name, input.employee_email, input.employee_role, input.employee_dob || null, id],
      );
      const employee = result.rows[0];
      if (!employee) {
        throw new NotFoundException(`Employee with id ${id} was not found`);
      }
      return employee;
    }

    const result = await this.db.query(
      `INSERT INTO clients (client_name, client_email, role, client_dob, password_hash)
       VALUES ($1, $2, $3, $4, '')
       RETURNING
         client_id AS employee_id,
         client_name AS employee_name,
         client_email AS employee_email,
         role AS employee_role,
         client_dob AS employee_dob,
         NULL::INTEGER AS employee_department`,
      [input.employee_name, input.employee_email, input.employee_role, input.employee_dob || null],
    );
    return result.rows[0];
  }

  async deleteEmployee(id: number) {
    const result = await this.db.query(
      `DELETE FROM clients WHERE client_id = $1 AND role IN ('employee', 'admin')`,
      [id],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException(`Employee with id ${id} was not found`);
    }
  }

  async getItems() {
    const result = await this.db.query('SELECT * FROM items ORDER BY item_id ASC');
    return result.rows;
  }

  async getItem(id: number) {
    const result = await this.db.query('SELECT * FROM items WHERE item_id = $1', [id]);
    const item = result.rows[0];
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    return item;
  }

  async saveItem(
    input: { item_name: string; item_sku: string; unit_price: number; stock_quantity: number },
    id?: number,
  ) {
    if (id) {
      const result = await this.db.query(
        `UPDATE items
         SET item_name = $1,
             item_sku = $2,
             unit_price = $3,
             stock_quantity = $4,
             updated_at = NOW()
         WHERE item_id = $5
         RETURNING *`,
        [input.item_name, input.item_sku, input.unit_price, input.stock_quantity, id],
      );
      const item = result.rows[0];
      if (!item) {
        throw new NotFoundException(`Item with id ${id} not found`);
      }
      return item;
    }

    const existing = await this.db.query('SELECT item_id FROM items WHERE item_sku = $1', [input.item_sku]);
    if (existing.rows[0]) {
      throw new ConflictException('SKU already exists');
    }

    const result = await this.db.query(
      `INSERT INTO items (item_name, item_sku, unit_price, stock_quantity)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [input.item_name, input.item_sku, input.unit_price || 0, input.stock_quantity || 0],
    );
    return result.rows[0];
  }

  async adjustItemStock(id: number, quantityChange: number) {
    const current = await this.getItem(id);
    if (Number(current.stock_quantity) + quantityChange < 0) {
      throw new BadRequestException('Stock cannot go below zero');
    }

    const result = await this.db.query(
      `UPDATE items SET stock_quantity = stock_quantity + $1, updated_at = NOW()
       WHERE item_id = $2 RETURNING *`,
      [quantityChange, id],
    );
    return result.rows[0];
  }

  async deleteItem(id: number) {
    const result = await this.db.query('DELETE FROM items WHERE item_id = $1', [id]);
    if (result.rowCount === 0) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
  }

  async getOrdersByClient(clientId: number) {
    const result = await this.db.query(
      'SELECT * FROM orders WHERE client_id = $1 ORDER BY order_date DESC',
      [clientId],
    );
    return result.rows.map((row) => ({
      ...row,
      customer_id: row.client_id,
    }));
  }

  async getOrderItemsByOrder(orderId: number) {
    const result = await this.db.query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY order_item_id ASC',
      [orderId],
    );
    return result.rows;
  }

  async register(input: {
    client_name: string;
    client_email: string;
    client_dob: string;
    password: string;
    role: string;
  }) {
    const existing = await this.db.query('SELECT client_id FROM clients WHERE client_email = $1', [
      input.client_email,
    ]);
    if (existing.rows[0]) {
      throw new ConflictException('Email already registered');
    }

    const role = (input.role || 'customer').toLowerCase();
    if (!['admin', 'employee', 'customer'].includes(role)) {
      throw new BadRequestException('Role must be admin, employee, or customer');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const result = await this.db.query(
      `INSERT INTO clients (client_name, client_email, client_dob, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING client_id, client_name, client_email, client_dob, role`,
      [input.client_name, input.client_email, input.client_dob || null, passwordHash, role],
    );
    return result.rows[0];
  }

  async login(input: { client_email: string; password: string }) {
    const result = await this.db.query('SELECT * FROM clients WHERE client_email = $1', [
      input.client_email,
    ]);
    const client = result.rows[0];
    if (!client) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const match = await bcrypt.compare(input.password, client.password_hash || '');
    if (!match) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      authenticated: true,
      client: {
        client_id: client.client_id,
        client_name: client.client_name,
        client_email: client.client_email,
        client_dob: client.client_dob,
        role: client.role,
      },
    };
  }

  async sendClientEmail(input: { to: string; subject: string; text: string }) {
    if (!input.to || !input.subject || !input.text) {
      throw new BadRequestException('to, subject, and text are required');
    }

    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail({
        from: '"Client Manager" <test@test.com>',
        to: input.to,
        subject: input.subject,
        text: input.text,
      });

      return {
        success: true,
        message: 'Email sent successfully',
        preview: nodemailer.getTestMessageUrl(info),
      };
    } catch {
      throw new BadGatewayException('Email failed to send');
    }
  }

  async getSalesDashboard(clientId: number, filters: Partial<SalesFilters> = {}) {
    const client = await this.getClient(clientId);
    if (client.role !== 'admin') {
      throw new ForbiddenException('Admin access is required');
    }

    const normalized = this.normalizeFilters(filters);
    const [
      summary,
      profitLossOverview,
      trend,
      salesByEmployee,
      salesByCategory,
      salesByItem,
      topSellingItems,
      lowSellingItems,
      availableFilters,
    ] = await Promise.all([
      this.getSalesSummary(normalized),
      this.getProfitLossOverview(normalized),
      this.getSalesTrend(normalized),
      this.getSalesByEmployee(normalized),
      this.getSalesByCategory(normalized),
      this.getSalesByItem(normalized),
      this.getTopSellingItems(normalized),
      this.getLowSellingItems(normalized),
      this.getAvailableFilters(),
    ]);

    const { bestEmployee, worstEmployee } = this.getEmployeeExtremes(salesByEmployee);
    const topItem = topSellingItems.length ? topSellingItems[0] : null;
    const profitMargin = summary.totalSales > 0 ? (summary.netProfit / summary.totalSales) * 100 : 0;

    return {
      appliedFilters: normalized,
      availableFilters,
      kpis: {
        totalSales: summary.totalSales,
        totalProfit: summary.totalProfit,
        totalLoss: summary.totalLoss,
        netProfit: summary.netProfit,
        totalCost: summary.totalCost,
        ordersCount: summary.ordersCount,
        unitsSold: summary.unitsSold,
        averageOrderValue: summary.averageOrderValue,
        profitMargin,
        bestEmployee,
        worstEmployee,
        topItem,
      },
      profitLossOverview,
      trend,
      salesByEmployee,
      salesByCategory,
      salesByItem,
      topSellingItems,
      lowSellingItems,
    };
  }

  private normalizeFilters(query: Partial<SalesFilters>) {
    const startDate = this.parseOptionalDate(query.startDate, 'startDate');
    const endDate = this.parseOptionalDate(query.endDate, 'endDate');
    const employeeId = this.parseOptionalInt(query.employeeId, 'employeeId');
    const itemId = this.parseOptionalInt(query.itemId, 'itemId');
    const category = query.category ? String(query.category).trim() : null;
    const lowSalesThreshold = Number.parseInt(String(query.lowSalesThreshold ?? 2), 10);
    const bucket = query.bucket ? String(query.bucket).toLowerCase() : 'day';

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('startDate cannot be after endDate');
    }
    if (Number.isNaN(lowSalesThreshold) || lowSalesThreshold < 0) {
      throw new BadRequestException('lowSalesThreshold must be a non-negative integer');
    }
    if (!['day', 'week', 'month'].includes(bucket)) {
      throw new BadRequestException('bucket must be one of: day, week, month');
    }

    return {
      startDate,
      endDate,
      employeeId,
      itemId,
      category,
      lowSalesThreshold,
      bucket,
    };
  }

  private parseOptionalInt(value: unknown, fieldName: string) {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const parsed = Number.parseInt(String(value), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      throw new BadRequestException(`${fieldName} must be a positive integer`);
    }
    return parsed;
  }

  private parseOptionalDate(value: unknown, fieldName: string) {
    if (!value) {
      return null;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
      throw new BadRequestException(`${fieldName} must use YYYY-MM-DD format`);
    }
    return String(value);
  }

  private getBaseSalesCte() {
    return `
      WITH sales AS (
        SELECT
          o.order_id,
          o.order_date,
          o.employee_id,
          COALESCE(emp.client_name, 'Unassigned') AS employee_name,
          oi.item_id,
          i.item_name,
          i.item_sku,
          COALESCE(p.category, 'Uncategorized') AS category,
          oi.quantity,
          (oi.quantity * oi.unit_price)::NUMERIC AS revenue,
          (oi.quantity * COALESCE(oi.unit_cost, i.unit_cost, 0))::NUMERIC AS cost,
          ((oi.quantity * oi.unit_price) - (oi.quantity * COALESCE(oi.unit_cost, i.unit_cost, 0)))::NUMERIC AS profit
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.order_id
        JOIN items i ON i.item_id = oi.item_id
        LEFT JOIN products p ON p.product_id = i.product_id
        LEFT JOIN clients emp ON emp.client_id = o.employee_id
        WHERE o.order_status = 'completed'
          AND ($1::date IS NULL OR o.order_date >= $1::date)
          AND ($2::date IS NULL OR o.order_date <= $2::date)
          AND ($3::int IS NULL OR o.employee_id = $3::int)
          AND ($4::int IS NULL OR oi.item_id = $4::int)
          AND ($5::text IS NULL OR COALESCE(p.category, 'Uncategorized') = $5::text)
      )
    `;
  }

  private getBaseParams(filters: SalesFilters) {
    return [
      filters.startDate || null,
      filters.endDate || null,
      filters.employeeId || null,
      filters.itemId || null,
      filters.category || null,
    ];
  }

  private toNumber(value: unknown) {
    return Number.parseFloat(String(value || 0));
  }

  private toInteger(value: unknown) {
    return Number.parseInt(String(value || 0), 10);
  }

  private mapEmployeeRow(row: any) {
    return {
      employeeId: row.employee_id ? this.toInteger(row.employee_id) : null,
      employeeName: row.employee_name,
      revenue: this.toNumber(row.revenue),
      profit: this.toNumber(row.profit),
      ordersCount: this.toInteger(row.orders_count),
      unitsSold: this.toInteger(row.units_sold),
    };
  }

  private mapItemRow(row: any) {
    return {
      itemId: this.toInteger(row.item_id),
      itemName: row.item_name,
      itemSku: row.item_sku,
      category: row.category,
      unitsSold: this.toInteger(row.units_sold),
      revenue: this.toNumber(row.revenue),
      profit: this.toNumber(row.profit),
      stockQuantity: row.stock_quantity !== undefined ? this.toInteger(row.stock_quantity) : undefined,
    };
  }

  private mapCategoryRow(row: any) {
    return {
      category: row.category,
      revenue: this.toNumber(row.revenue),
      profit: this.toNumber(row.profit),
      unitsSold: this.toInteger(row.units_sold),
      ordersCount: this.toInteger(row.orders_count),
    };
  }

  private mapTrendRow(row: any) {
    return {
      period: row.period,
      periodStart: row.period_start,
      revenue: this.toNumber(row.revenue),
      cost: this.toNumber(row.cost),
      profit: this.toNumber(row.profit),
      ordersCount: this.toInteger(row.orders_count),
    };
  }

  private async getSalesSummary(filters: SalesFilters) {
    const result = await this.db.query(
      `${this.getBaseSalesCte()}
       SELECT
         COALESCE(SUM(revenue), 0) AS total_sales,
         COALESCE(SUM(cost), 0) AS total_cost,
         COALESCE(SUM(profit), 0) AS net_profit,
         COALESCE(SUM(CASE WHEN profit > 0 THEN profit ELSE 0 END), 0) AS total_profit,
         COALESCE(SUM(CASE WHEN profit < 0 THEN ABS(profit) ELSE 0 END), 0) AS total_loss,
         COALESCE(SUM(quantity), 0) AS units_sold,
         COUNT(DISTINCT order_id) AS orders_count,
         COALESCE(SUM(revenue) / NULLIF(COUNT(DISTINCT order_id), 0), 0) AS average_order_value
       FROM sales`,
      this.getBaseParams(filters),
    );
    const row = result.rows[0];
    return {
      totalSales: this.toNumber(row.total_sales),
      totalCost: this.toNumber(row.total_cost),
      netProfit: this.toNumber(row.net_profit),
      totalProfit: this.toNumber(row.total_profit),
      totalLoss: this.toNumber(row.total_loss),
      unitsSold: this.toInteger(row.units_sold),
      ordersCount: this.toInteger(row.orders_count),
      averageOrderValue: this.toNumber(row.average_order_value),
    };
  }

  private async getProfitLossOverview(filters: SalesFilters) {
    const result = await this.db.query(
      `WITH order_profit AS (
         SELECT
           o.order_id,
           COALESCE(SUM((oi.quantity * oi.unit_price) - (oi.quantity * COALESCE(oi.unit_cost, i.unit_cost, 0))), 0) AS order_profit
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.order_id
         JOIN items i ON i.item_id = oi.item_id
         LEFT JOIN products p ON p.product_id = i.product_id
         WHERE o.order_status = 'completed'
           AND ($1::date IS NULL OR o.order_date >= $1::date)
           AND ($2::date IS NULL OR o.order_date <= $2::date)
           AND ($3::int IS NULL OR o.employee_id = $3::int)
           AND ($4::int IS NULL OR oi.item_id = $4::int)
           AND ($5::text IS NULL OR COALESCE(p.category, 'Uncategorized') = $5::text)
         GROUP BY o.order_id
       )
       SELECT
         COUNT(*) FILTER (WHERE order_profit > 0) AS profitable_orders,
         COUNT(*) FILTER (WHERE order_profit < 0) AS loss_orders,
         COUNT(*) FILTER (WHERE order_profit = 0) AS break_even_orders,
         COALESCE(SUM(CASE WHEN order_profit > 0 THEN order_profit ELSE 0 END), 0) AS gross_profit,
         COALESCE(SUM(CASE WHEN order_profit < 0 THEN ABS(order_profit) ELSE 0 END), 0) AS gross_loss
       FROM order_profit`,
      this.getBaseParams(filters),
    );
    const row = result.rows[0];
    return {
      profitableOrders: this.toInteger(row.profitable_orders),
      lossOrders: this.toInteger(row.loss_orders),
      breakEvenOrders: this.toInteger(row.break_even_orders),
      grossProfit: this.toNumber(row.gross_profit),
      grossLoss: this.toNumber(row.gross_loss),
    };
  }

  private async getSalesTrend(filters: SalesFilters) {
    const dateBucketExpr = `
      CASE
        WHEN $6::text = 'week' THEN date_trunc('week', order_date)
        WHEN $6::text = 'month' THEN date_trunc('month', order_date)
        ELSE date_trunc('day', order_date)
      END
    `;
    const result = await this.db.query(
      `${this.getBaseSalesCte()}
       SELECT
         ${dateBucketExpr} AS period_start,
         TO_CHAR(${dateBucketExpr}, CASE WHEN $6::text = 'month' THEN 'YYYY-MM' ELSE 'YYYY-MM-DD' END) AS period,
         COALESCE(SUM(revenue), 0) AS revenue,
         COALESCE(SUM(cost), 0) AS cost,
         COALESCE(SUM(profit), 0) AS profit,
         COUNT(DISTINCT order_id) AS orders_count
       FROM sales
       GROUP BY period_start, period
       ORDER BY period_start ASC`,
      [...this.getBaseParams(filters), filters.bucket || 'day'],
    );
    return result.rows.map((row) => this.mapTrendRow(row));
  }

  private async getSalesByEmployee(filters: SalesFilters) {
    const result = await this.db.query(
      `WITH sales_by_employee AS (
         SELECT
           o.employee_id,
           COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue,
           COALESCE(SUM((oi.quantity * oi.unit_price) - (oi.quantity * COALESCE(oi.unit_cost, i.unit_cost, 0))), 0) AS profit,
           COALESCE(SUM(oi.quantity), 0) AS units_sold,
           COUNT(DISTINCT o.order_id) AS orders_count
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.order_id
         JOIN items i ON i.item_id = oi.item_id
         LEFT JOIN products p ON p.product_id = i.product_id
         WHERE o.order_status = 'completed'
           AND ($1::date IS NULL OR o.order_date >= $1::date)
           AND ($2::date IS NULL OR o.order_date <= $2::date)
           AND ($3::int IS NULL OR o.employee_id = $3::int)
           AND ($4::int IS NULL OR oi.item_id = $4::int)
           AND ($5::text IS NULL OR COALESCE(p.category, 'Uncategorized') = $5::text)
         GROUP BY o.employee_id
       )
       SELECT
         c.client_id AS employee_id,
         c.client_name AS employee_name,
         COALESCE(s.revenue, 0) AS revenue,
         COALESCE(s.profit, 0) AS profit,
         COALESCE(s.orders_count, 0) AS orders_count,
         COALESCE(s.units_sold, 0) AS units_sold
       FROM clients c
       LEFT JOIN sales_by_employee s ON s.employee_id = c.client_id
       WHERE c.role IN ('admin', 'employee')
         AND ($3::int IS NULL OR c.client_id = $3::int)
       ORDER BY profit DESC, revenue DESC, c.client_name ASC`,
      this.getBaseParams(filters),
    );
    return result.rows.map((row) => this.mapEmployeeRow(row));
  }

  private async getSalesByCategory(filters: SalesFilters) {
    const result = await this.db.query(
      `${this.getBaseSalesCte()}
       SELECT
         category,
         COALESCE(SUM(revenue), 0) AS revenue,
         COALESCE(SUM(profit), 0) AS profit,
         COALESCE(SUM(quantity), 0) AS units_sold,
         COUNT(DISTINCT order_id) AS orders_count
       FROM sales
       GROUP BY category
       ORDER BY revenue DESC, category ASC`,
      this.getBaseParams(filters),
    );
    return result.rows.map((row) => this.mapCategoryRow(row));
  }

  private async getSalesByItem(filters: SalesFilters) {
    const result = await this.db.query(
      `${this.getBaseSalesCte()}
       SELECT
         item_id,
         item_name,
         item_sku,
         category,
         COALESCE(SUM(quantity), 0) AS units_sold,
         COALESCE(SUM(revenue), 0) AS revenue,
         COALESCE(SUM(profit), 0) AS profit
       FROM sales
       GROUP BY item_id, item_name, item_sku, category
       ORDER BY revenue DESC, units_sold DESC, item_name ASC
       LIMIT 15`,
      this.getBaseParams(filters),
    );
    return result.rows.map((row) => this.mapItemRow(row));
  }

  private async getTopSellingItems(filters: SalesFilters) {
    const result = await this.db.query(
      `${this.getBaseSalesCte()}
       SELECT
         item_id,
         item_name,
         item_sku,
         category,
         COALESCE(SUM(quantity), 0) AS units_sold,
         COALESCE(SUM(revenue), 0) AS revenue,
         COALESCE(SUM(profit), 0) AS profit
       FROM sales
       GROUP BY item_id, item_name, item_sku, category
       ORDER BY units_sold DESC, revenue DESC, item_name ASC
       LIMIT 10`,
      this.getBaseParams(filters),
    );
    return result.rows.map((row) => this.mapItemRow(row));
  }

  private async getLowSellingItems(filters: SalesFilters) {
    const result = await this.db.query(
      `WITH sales_by_item AS (
         SELECT
           oi.item_id,
           COALESCE(SUM(oi.quantity), 0) AS units_sold,
           COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue,
           COALESCE(SUM((oi.quantity * oi.unit_price) - (oi.quantity * COALESCE(oi.unit_cost, i.unit_cost, 0))), 0) AS profit
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.order_id
         JOIN items i ON i.item_id = oi.item_id
         LEFT JOIN products p ON p.product_id = i.product_id
         WHERE o.order_status = 'completed'
           AND ($1::date IS NULL OR o.order_date >= $1::date)
           AND ($2::date IS NULL OR o.order_date <= $2::date)
           AND ($3::int IS NULL OR o.employee_id = $3::int)
           AND ($4::int IS NULL OR oi.item_id = $4::int)
           AND ($5::text IS NULL OR COALESCE(p.category, 'Uncategorized') = $5::text)
         GROUP BY oi.item_id
       )
       SELECT
         i.item_id,
         i.item_name,
         i.item_sku,
         COALESCE(p.category, 'Uncategorized') AS category,
         i.stock_quantity,
         COALESCE(s.units_sold, 0) AS units_sold,
         COALESCE(s.revenue, 0) AS revenue,
         COALESCE(s.profit, 0) AS profit
       FROM items i
       LEFT JOIN products p ON p.product_id = i.product_id
       LEFT JOIN sales_by_item s ON s.item_id = i.item_id
       WHERE ($4::int IS NULL OR i.item_id = $4::int)
         AND ($5::text IS NULL OR COALESCE(p.category, 'Uncategorized') = $5::text)
         AND COALESCE(s.units_sold, 0) <= $6::int
       ORDER BY units_sold ASC, i.item_name ASC
       LIMIT 10`,
      [...this.getBaseParams(filters), filters.lowSalesThreshold],
    );
    return result.rows.map((row) => this.mapItemRow(row));
  }

  private async getAvailableFilters() {
    const [employeesRes, categoriesRes, itemsRes] = await Promise.all([
      this.db.query(
        `SELECT client_id AS employee_id, client_name AS employee_name
         FROM clients
         WHERE role IN ('admin', 'employee')
         ORDER BY client_name ASC`,
      ),
      this.db.query(
        `SELECT DISTINCT COALESCE(category, 'Uncategorized') AS category
         FROM products
         ORDER BY category ASC`,
      ),
      this.db.query(
        `SELECT
          i.item_id,
          i.item_name,
          i.item_sku,
          COALESCE(p.category, 'Uncategorized') AS category
         FROM items i
         LEFT JOIN products p ON p.product_id = i.product_id
         ORDER BY i.item_name ASC`,
      ),
    ]);

    return {
      employees: employeesRes.rows.map((row: any) => ({
        employeeId: this.toInteger(row.employee_id),
        employeeName: row.employee_name,
      })),
      categories: categoriesRes.rows.map((row: any) => row.category),
      items: itemsRes.rows.map((row: any) => ({
        itemId: this.toInteger(row.item_id),
        itemName: row.item_name,
        itemSku: row.item_sku,
        category: row.category,
      })),
    };
  }

  private getEmployeeExtremes(rows: any[]) {
    if (!rows.length) {
      return { bestEmployee: null, worstEmployee: null };
    }

    const sorted = [...rows].sort((a, b) => {
      if (a.revenue === b.revenue) {
        if (a.profit === b.profit) {
          return a.employeeName.localeCompare(b.employeeName);
        }
        return a.profit - b.profit;
      }
      return a.revenue - b.revenue;
    });

    return {
      bestEmployee: sorted[sorted.length - 1],
      worstEmployee: sorted[0],
    };
  }
}

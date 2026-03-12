const pool = require('../config/db');

const toNumber = (value) => Number.parseFloat(value || 0);
const toInteger = (value) => Number.parseInt(value || 0, 10);

class StatisticsRepository {
    static getBaseSalesCte() {
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

    static getBaseParams(filters) {
        return [
            filters.startDate || null,
            filters.endDate || null,
            filters.employeeId || null,
            filters.itemId || null,
            filters.category || null,
        ];
    }

    static mapEmployeeRow(row) {
        return {
            employeeId: row.employee_id ? toInteger(row.employee_id) : null,
            employeeName: row.employee_name,
            revenue: toNumber(row.revenue),
            profit: toNumber(row.profit),
            ordersCount: toInteger(row.orders_count),
            unitsSold: toInteger(row.units_sold),
        };
    }

    static mapItemRow(row) {
        return {
            itemId: toInteger(row.item_id),
            itemName: row.item_name,
            itemSku: row.item_sku,
            category: row.category,
            unitsSold: toInteger(row.units_sold),
            revenue: toNumber(row.revenue),
            profit: toNumber(row.profit),
            stockQuantity: row.stock_quantity !== undefined ? toInteger(row.stock_quantity) : undefined,
        };
    }

    static mapCategoryRow(row) {
        return {
            category: row.category,
            revenue: toNumber(row.revenue),
            profit: toNumber(row.profit),
            unitsSold: toInteger(row.units_sold),
            ordersCount: toInteger(row.orders_count),
        };
    }

    static mapTrendRow(row) {
        return {
            period: row.period,
            periodStart: row.period_start,
            revenue: toNumber(row.revenue),
            cost: toNumber(row.cost),
            profit: toNumber(row.profit),
            ordersCount: toInteger(row.orders_count),
        };
    }

    static async getSalesSummary(filters) {
        const query = `
            ${this.getBaseSalesCte()}
            SELECT
                COALESCE(SUM(revenue), 0) AS total_sales,
                COALESCE(SUM(cost), 0) AS total_cost,
                COALESCE(SUM(profit), 0) AS net_profit,
                COALESCE(SUM(CASE WHEN profit > 0 THEN profit ELSE 0 END), 0) AS total_profit,
                COALESCE(SUM(CASE WHEN profit < 0 THEN ABS(profit) ELSE 0 END), 0) AS total_loss,
                COALESCE(SUM(quantity), 0) AS units_sold,
                COUNT(DISTINCT order_id) AS orders_count,
                COALESCE(SUM(revenue) / NULLIF(COUNT(DISTINCT order_id), 0), 0) AS average_order_value
            FROM sales
        `;

        const result = await pool.query(query, this.getBaseParams(filters));
        const row = result.rows[0];

        return {
            totalSales: toNumber(row.total_sales),
            totalCost: toNumber(row.total_cost),
            netProfit: toNumber(row.net_profit),
            totalProfit: toNumber(row.total_profit),
            totalLoss: toNumber(row.total_loss),
            unitsSold: toInteger(row.units_sold),
            ordersCount: toInteger(row.orders_count),
            averageOrderValue: toNumber(row.average_order_value),
        };
    }

    static async getProfitLossOverview(filters) {
        const query = `
            WITH order_profit AS (
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
            FROM order_profit
        `;

        const result = await pool.query(query, this.getBaseParams(filters));
        const row = result.rows[0];

        return {
            profitableOrders: toInteger(row.profitable_orders),
            lossOrders: toInteger(row.loss_orders),
            breakEvenOrders: toInteger(row.break_even_orders),
            grossProfit: toNumber(row.gross_profit),
            grossLoss: toNumber(row.gross_loss),
        };
    }

    static async getSalesTrend(filters) {
        const dateBucketExpr = `
            CASE
                WHEN $6::text = 'week' THEN date_trunc('week', order_date)
                WHEN $6::text = 'month' THEN date_trunc('month', order_date)
                ELSE date_trunc('day', order_date)
            END
        `;

        const query = `
            ${this.getBaseSalesCte()}
            SELECT
                ${dateBucketExpr} AS period_start,
                TO_CHAR(${dateBucketExpr}, CASE WHEN $6::text = 'month' THEN 'YYYY-MM' ELSE 'YYYY-MM-DD' END) AS period,
                COALESCE(SUM(revenue), 0) AS revenue,
                COALESCE(SUM(cost), 0) AS cost,
                COALESCE(SUM(profit), 0) AS profit,
                COUNT(DISTINCT order_id) AS orders_count
            FROM sales
            GROUP BY period_start, period
            ORDER BY period_start ASC
        `;

        const params = [...this.getBaseParams(filters), filters.bucket || 'day'];
        const result = await pool.query(query, params);
        return result.rows.map((row) => this.mapTrendRow(row));
    }

    static async getSalesByEmployee(filters) {
        const query = `
            WITH sales_by_employee AS (
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
            ORDER BY profit DESC, revenue DESC, c.client_name ASC
        `;

        const result = await pool.query(query, this.getBaseParams(filters));
        return result.rows.map((row) => this.mapEmployeeRow(row));
    }

    static async getSalesByCategory(filters) {
        const query = `
            ${this.getBaseSalesCte()}
            SELECT
                category,
                COALESCE(SUM(revenue), 0) AS revenue,
                COALESCE(SUM(profit), 0) AS profit,
                COALESCE(SUM(quantity), 0) AS units_sold,
                COUNT(DISTINCT order_id) AS orders_count
            FROM sales
            GROUP BY category
            ORDER BY revenue DESC, category ASC
        `;

        const result = await pool.query(query, this.getBaseParams(filters));
        return result.rows.map((row) => this.mapCategoryRow(row));
    }

    static async getSalesByItem(filters) {
        const query = `
            ${this.getBaseSalesCte()}
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
            LIMIT 15
        `;

        const result = await pool.query(query, this.getBaseParams(filters));
        return result.rows.map((row) => this.mapItemRow(row));
    }

    static async getTopSellingItems(filters) {
        const query = `
            ${this.getBaseSalesCte()}
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
            LIMIT 10
        `;

        const result = await pool.query(query, this.getBaseParams(filters));
        return result.rows.map((row) => this.mapItemRow(row));
    }

    static async getLowSellingItems(filters) {
        const query = `
            WITH sales_by_item AS (
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
            LIMIT 10
        `;

        const params = [...this.getBaseParams(filters), filters.lowSalesThreshold];
        const result = await pool.query(query, params);
        return result.rows.map((row) => this.mapItemRow(row));
    }

    static async getAvailableFilters() {
        const employeesPromise = pool.query(
            `SELECT client_id AS employee_id, client_name AS employee_name
             FROM clients
             WHERE role IN ('admin', 'employee')
             ORDER BY client_name ASC`
        );

        const categoriesPromise = pool.query(
            `SELECT DISTINCT COALESCE(category, 'Uncategorized') AS category
             FROM products
             ORDER BY category ASC`
        );

        const itemsPromise = pool.query(
            `SELECT
                i.item_id,
                i.item_name,
                i.item_sku,
                COALESCE(p.category, 'Uncategorized') AS category
             FROM items i
             LEFT JOIN products p ON p.product_id = i.product_id
             ORDER BY i.item_name ASC`
        );

        const [employeesRes, categoriesRes, itemsRes] = await Promise.all([
            employeesPromise,
            categoriesPromise,
            itemsPromise,
        ]);

        return {
            employees: employeesRes.rows.map((row) => ({
                employeeId: toInteger(row.employee_id),
                employeeName: row.employee_name,
            })),
            categories: categoriesRes.rows.map((row) => row.category),
            items: itemsRes.rows.map((row) => ({
                itemId: toInteger(row.item_id),
                itemName: row.item_name,
                itemSku: row.item_sku,
                category: row.category,
            })),
        };
    }

    static getEmployeeExtremes(rows) {
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

    static async getSalesDashboard(filters) {
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
            this.getSalesSummary(filters),
            this.getProfitLossOverview(filters),
            this.getSalesTrend(filters),
            this.getSalesByEmployee(filters),
            this.getSalesByCategory(filters),
            this.getSalesByItem(filters),
            this.getTopSellingItems(filters),
            this.getLowSellingItems(filters),
            this.getAvailableFilters(),
        ]);

        const { bestEmployee, worstEmployee } = this.getEmployeeExtremes(salesByEmployee);
        const topItem = topSellingItems.length ? topSellingItems[0] : null;
        const profitMargin = summary.totalSales > 0
            ? (summary.netProfit / summary.totalSales) * 100
            : 0;

        return {
            appliedFilters: {
                startDate: filters.startDate,
                endDate: filters.endDate,
                employeeId: filters.employeeId,
                itemId: filters.itemId,
                category: filters.category,
                bucket: filters.bucket,
                lowSalesThreshold: filters.lowSalesThreshold,
            },
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
}

module.exports = StatisticsRepository;

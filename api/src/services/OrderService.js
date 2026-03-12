const OrderRepository = require('../repositories/OrderRepository');
const OrderItemRepository = require('../repositories/OrderItemRepository');
const ItemRepository = require('../repositories/ItemRepository');
const StockAdjustmentRepository = require('../repositories/StockAdjustmentRepository');
const TransactionRepository = require('../repositories/TransactionRepository');
const ApiError = require('../middlewares/ApiError');

class OrderService {
    static async getAll(query = {}) {
        return OrderRepository.findAll(query);
    }
static async findByClientId(customer_id) {
        const orders = await OrderRepository.findByClientId(customer_id);
        if(!orders){
            throw ApiError.notFound(`No orders found for customer with id ${customer_id}`);
        }
        return orders;
    }
    static async getById(id) {
        const order = await OrderRepository.findById(id);
        if (!order) {
            throw ApiError.notFound(`Order with id ${id} not found`);
        }
        const items = await OrderItemRepository.findByOrderId(id);
        return { ...order, items };
    }

    static async create(data) {
        return OrderRepository.create(data);
    }

    static async update(id, data) {
        const order = await OrderRepository.update(id, data);
        if (!order) {
            throw ApiError.notFound(`Order with id ${id} not found`);
        }
        return order;
    }

    /**
     * Idempotent order completion (Task 3).
     * The SQL WHERE clause includes `order_status != 'completed'`.
     * If the order was already completed, markCompleted returns null
     * and we return a clear already-completed response instead of
     * processing stock movements a second time.
     */
    static async complete(id) {
        const existing = await OrderRepository.findById(id);
        if (!existing) {
            throw ApiError.notFound(`Order with id ${id} not found`);
        }

        if (existing.order_status === 'completed') {
            return { order: existing, alreadyCompleted: true };
        }

        const completed = await OrderRepository.markCompleted(id);
        if (!completed) {
            // Race-condition guard: another request completed it between our check and update
            const refreshed = await OrderRepository.findById(id);
            return { order: refreshed, alreadyCompleted: true };
        }

        // Process stock adjustments for each order item
        const orderItems = await OrderItemRepository.findByOrderId(id);
        for (const oi of orderItems) {
            await ItemRepository.adjustStock(oi.item_id, -oi.quantity);
            await StockAdjustmentRepository.create({
                item_id: oi.item_id,
                quantity_change: -oi.quantity,
                reason: 'Order completed',
                reference_type: 'order',
                reference_id: id,
            });
        }

        // Record transaction
        await TransactionRepository.create({
            order_id: id,
            amount: completed.order_total,
            transaction_type: 'payment',
        });

        return { order: completed, alreadyCompleted: false };
    }

    static async addItem(orderId, { item_id, quantity }) {
        const order = await OrderRepository.findById(orderId);
        if (!order) {
            throw ApiError.notFound(`Order with id ${orderId} not found`);
        }
        if (order.order_status === 'completed') {
            throw ApiError.badRequest('Cannot add items to a completed order');
        }

        const item = await ItemRepository.findById(item_id);
        if (!item) {
            throw ApiError.notFound(`Item with id ${item_id} not found`);
        }

        const orderItem = await OrderItemRepository.create({
            order_id: orderId,
            item_id,
            quantity,
            unit_price: item.unit_price,
            unit_cost: item.unit_cost || 0,
        });

        // Recalculate total
        const allItems = await OrderItemRepository.findByOrderId(orderId);
        const total = allItems.reduce((sum, oi) => sum + oi.quantity * parseFloat(oi.unit_price), 0);
        await OrderRepository.update(orderId, { order_total: total, order_status: order.order_status });

        return orderItem;
    }

    static async remove(id) {
        const deleted = await OrderRepository.remove(id);
        if (!deleted) {
            throw ApiError.notFound(`Order with id ${id} not found`);
        }
    }
}

module.exports = OrderService;

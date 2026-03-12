const OrderService = require('../services/OrderService');

class OrderController {
    static async getAll(req, res, next) {
        try {
            const orders = await OrderService.getAll(req.query);
            return res.json(orders);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const order = await OrderService.getById(req.params.id);
            return res.json(order);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const order = await OrderService.create(req.body);
            return res.status(201).json(order);
        } catch (err) {
            next(err);
        }
    }

    static async update(req, res, next) {
        try {
            const order = await OrderService.update(req.params.id, req.body);
            return res.json(order);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /orders/:id/complete
     * Idempotent: completes order and adjusts stock.
     * Returns 200 if newly completed, 200 with alreadyCompleted flag if repeated.
     */
    static async complete(req, res, next) {
        try {
            const result = await OrderService.complete(req.params.id);
            if (result.alreadyCompleted) {
                return res.json({
                    message: 'Order was already completed',
                    order: result.order,
                });
            }
            return res.json({
                message: 'Order completed successfully',
                order: result.order,
            });
        } catch (err) {
            next(err);
        }
    }

    static async addItem(req, res, next) {
        try {
            const orderItem = await OrderService.addItem(req.params.id, req.body);
            return res.status(201).json(orderItem);
        } catch (err) {
            next(err);
        }
    }

    static async remove(req, res, next) {
        try {
            await OrderService.remove(req.params.id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

module.exports = OrderController;

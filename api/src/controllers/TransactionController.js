const TransactionService = require('../services/TransactionService');

class TransactionController {
    static async getAll(req, res, next) {
        try {
            const transactions = await TransactionService.getAll();
            return res.json(transactions);
        } catch (err) {
            next(err);
        }
    }

    static async getByOrderId(req, res, next) {
        try {
            const transactions = await TransactionService.getByOrderId(req.params.orderId);
            return res.json(transactions);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = TransactionController;

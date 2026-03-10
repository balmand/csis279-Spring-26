const StockAdjustmentService = require('../services/StockAdjustmentService');

class StockAdjustmentController {
    static async getAll(req, res, next) {
        try {
            const adjustments = await StockAdjustmentService.getAll();
            return res.json(adjustments);
        } catch (err) {
            next(err);
        }
    }

    static async getByItemId(req, res, next) {
        try {
            const adjustments = await StockAdjustmentService.getByItemId(req.params.itemId);
            return res.json(adjustments);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const adjustment = await StockAdjustmentService.create(req.body);
            return res.status(201).json(adjustment);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = StockAdjustmentController;

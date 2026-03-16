const StockAdjustmentRepository = require('../repositories/StockAdjustmentRepository');
const ItemRepository = require('../repositories/ItemRepository');
const ApiError = require('../middlewares/ApiError');

class StockAdjustmentService {
    static async getAll() {
        return StockAdjustmentRepository.findAll();
    }

    static async getByItemId(itemId) {
        const item = await ItemRepository.findById(itemId);
        if (!item) {
            throw ApiError.notFound(`Item with id ${itemId} not found`);
        }
        return StockAdjustmentRepository.findByItemId(itemId);
    }

    static async create({ item_id, quantity_change, reason }) {
        const item = await ItemRepository.findById(item_id);
        if (!item) {
            throw ApiError.notFound(`Item with id ${item_id} not found`);
        }

        if (item.stock_quantity + quantity_change < 0) {
            throw ApiError.badRequest('Stock cannot go below zero');
        }

        await ItemRepository.adjustStock(item_id, quantity_change);

        return StockAdjustmentRepository.create({
            item_id,
            quantity_change,
            reason,
            reference_type: 'manual',
            reference_id: null,
        });
    }
}

module.exports = StockAdjustmentService;

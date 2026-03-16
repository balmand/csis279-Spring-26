const ItemRepository = require('../repositories/ItemRepository');
const ApiError = require('../middlewares/ApiError');

class ItemService {
    static async getAll(query = {}) {
        return ItemRepository.findAll(query);
    }

    static async getById(id) {
        const item = await ItemRepository.findById(id);
        if (!item) {
            throw ApiError.notFound(`Item with id ${id} not found`);
        }
        return item;
    }

    static async create(data) {
        const existing = await ItemRepository.findBySku(data.item_sku);
        if (existing) {
            throw ApiError.conflict('SKU already exists', { item_sku: 'This SKU is already in use' });
        }
        return ItemRepository.create(data);
    }

    static async update(id, data) {
        const item = await ItemRepository.update(id, data);
        if (!item) {
            throw ApiError.notFound(`Item with id ${id} not found`);
        }
        return item;
    }

    static async remove(id) {
        const deleted = await ItemRepository.remove(id);
        if (!deleted) {
            throw ApiError.notFound(`Item with id ${id} not found`);
        }
    }
    static async adjustStock(id, quantityChange) {
        const item = await ItemRepository.findById(id);
        if (!item) {
            throw ApiError.notFound(`Item with id ${id} not found`);
        }
        if (item.stock_quantity + quantityChange < 0) {
            throw ApiError.badRequest('Stock cannot go below zero');
        }
        const updated = await ItemRepository.adjustStock(id, quantityChange);
        return updated;
    }
}

module.exports = ItemService;

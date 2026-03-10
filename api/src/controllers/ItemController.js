const ItemService = require('../services/ItemService');

class ItemController {
    static async getAll(req, res, next) {
        try {
            const items = await ItemService.getAll();
            return res.json(items);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const item = await ItemService.getById(req.params.id);
            return res.json(item);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const item = await ItemService.create(req.body);
            return res.status(201).json(item);
        } catch (err) {
            next(err);
        }
    }

    static async update(req, res, next) {
        try {
            const item = await ItemService.update(req.params.id, req.body);
            return res.json(item);
        } catch (err) {
            next(err);
        }
    }

    static async remove(req, res, next) {
        try {
            await ItemService.remove(req.params.id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ItemController;
